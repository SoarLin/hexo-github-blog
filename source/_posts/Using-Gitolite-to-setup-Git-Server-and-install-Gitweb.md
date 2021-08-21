---
layout: post
title: Using Gitolite to setup Git Server and install Gitweb
author: Soar Lin
cdn: header-off
header-img: ''
date: 2016-09-04 09:49:47
categories:
 - Server
tags:
 - git
 - git server
 - gitolite
 - gitweb
---
<!-- MarkdownTOC -->

- [在 Linux 環境下架設 Git Server](#在-linux-環境下架設-git-server)
    - [系統套件安裝](#系統套件安裝)
    - [協同開發人員產生 SSH public key](#協同開發人員產生-ssh-public-key)
    - [Git Server 的設定](#git-server-的設定)
    - [建立 Git Repository](#建立-git-repository)
    - [開發人員 clone 程式碼](#開發人員-clone-程式碼)
- [使用 Gitolite 管理 Git Server](#使用-gitolite-管理-git-server)
    - [系統套件安裝](#系統套件安裝-1)
    - [產生/收集 SSH Public Key](#產生收集-ssh-public-key)
    - [Gitolite Server 架設](#gitolite-server-架設)
        - [建立專案](#建立專案)
        - [加入開發人員](#加入開發人員)
- [安裝 Gitweb 並整合 Gitolite](#安裝-gitweb-並整合-gitolite)
    - [系統套件安裝](#系統套件安裝-2)
    - [Apache 2.4 與 Gitweb 設定](#apache-24-與-gitweb-設定)
    - [修正 Gitweb conf](#修正-gitweb-conf)
    - [修正 Gitolite 部分](#修正-gitolite-部分)
    - [建立專案設定檔修改部分](#建立專案設定檔修改部分)

<!-- /MarkdownTOC -->


<a name="在-linux-環境下架設-git-server"></a>
# 在 Linux 環境下架設 Git Server
[參考資料](https://blog.longwin.com.tw/2011/03/build-git-env-share-over-ssh-2011/)
<a name="系統套件安裝"></a>
## 系統套件安裝

````bash
sudo -s (切換帳號為root)
apt-get install git git-core
````
<!-- more -->
<a name="協同開發人員產生-ssh-public-key"></a>
## 協同開發人員產生 SSH public key

````bash
mkdir .ssh
cd .ssh
ssh-keygen
cat ~/.ssh/id_rsa.pub
#或上傳到 Server /tmp/目錄下統一保存
````

<a name="git-server-的設定"></a>
## Git Server 的設定
- ssh 連線到 Server 上
- `sudo -s` (切換帳號為root)
- `useradd -s /bin/bash -m -d /home/git git` (建立名為 git 的使用者)
- `passwd git` (替 git 建立密碼，與開啟 sudoer 權限)
- `visudo`
- `su - git` (切換到 git user，以下動作以 git 權限操作)
- 將開發人員的 public key 加入認證檔

    ````bash
    cat /tmp/user1.pub >> ~/.ssh/authorized_keys
    cat /tmp/user2.pub >> ~/.ssh/authorized_keys
    ````

<a name="建立-git-repository"></a>
## 建立 Git Repository
- ssh 連線到 Server 上
- 切換到 git user，以下動作以 git 權限操作

````bash
su git
mkdir -p ~/project_name.git
cd ~/project_name.git
git init --bare --shared
````

<a name="開發人員-clone-程式碼"></a>
## 開發人員 clone 程式碼

````bash
git clone git@<網址 or IP>:/home/git/project_name.git
````

以上作法是最基本的以 git 帳號來建立 Git Server，優點是適合人少的專案，架設步驟簡單快速；缺點是無法針對不同專案給予不同開發者存取權限，所以需要往下一步

<a name="使用-gitolite-管理-git-server"></a>
# 使用 Gitolite 管理 Git Server
[參考資料一](https://blog.longwin.com.tw/2011/03/linux-gitolite-git-server-2011/)　
[參考資料二](http://blog.changyy.org/2012/09/linux-git-gitolite-gitweb-git-server.html)

<a name="系統套件安裝-1"></a>
## 系統套件安裝

````bash
apt-get install gitolite
````

<a name="產生收集-ssh-public-key"></a>
## 產生/收集 SSH Public Key

- ssh 連線到 Server 上
- su - git (切換到 git user，以下動作以 git 權限操作)
- cd .ssh (若沒有該目錄，請先自行建立)
- ssh-keygen -t rsa -f admin (產生名為 admin 的 public key)
- 請所有人將各自的 public key 放到 /tmp/ 下，並且已各自名稱命名 (e.g. alex.pub, ben.pub, john.pub …)

<a name="gitolite-server-架設"></a>
## Gitolite Server 架設

- ssh 連線到 Server 上
- su - git (切換到 git user，以下動作以 git 權限操作)
- gl-setup ~/.ssh/admin.pub (匯入管理者的Public key)

目錄結構如下：

````bash
.
├── .gitolite/
├── .gitolite.rc
├── repositories/
│   ├── gitolite-admin.git
│   └── testing.git
├── .ssh
├── .vim
└── .vimrc
````

__這時 git 帳號的 $HOME(家目錄)下，會產生__

- .gitolite/ 目錄
- .gitolite.rc 設定檔
- repositories/ 目錄

**repositories 目錄下，有兩個專案**

- gitolite-admin.git (用來管理所有專案的主要專案)
- testing.git (測試用專案)

<a name="建立專案"></a>
### 建立專案

因為gitolite的專案管理，是透過在主專案(gitolite-admin.git)裡，改寫 config 檔案來設定，所以需要以管理者帳號

(剛剛使用 git 帳號，因為產生的 admin.pub，被設定為 gitolite 管理者的認證)

- ssh 連線到 Server 上
- su - git (切換到 git user，以下動作以 git 權限操作)
- 抓主專案來修改設定

````bash
git clone git@localhost:gitolite-admin.git
cd gitolite-admin/
vim conf/gitolite.conf

# sample：增加一個名為 ios_test 的專案,
# 並設定 esu 為可存取的使用者
# soar 為可讀，加入以下幾行到conf 檔中

repo    ios_test
        RW      =   esu
        R       =   soar

````

- 修改完畢後，以一般 git 上 code 的流程處理

````bash
git add .
git commit -m "add new project"
git push
````

- 順利的話，可以看到畫面上出現，建立 project 的訊息

````bash
Counting objects: 7, done.
Delta compression using up to 4 threads.
Compressing objects: 100% (3/3), done.
Writing objects: 100% (4/4), 423 bytes | 0 bytes/s, done.
Total 4 (delta 1), reused 0 (delta 0)
remote: creating ios_test...
remote: Initialized empty Git repository in /home/git/repositories/ios_test.git/
remote:
To git@localhost:gitolite-admin.git
   a37d282..62dffa9  master -> master
````

<a name="加入開發人員"></a>
### 加入開發人員
**在主專案中，加入開發人員的 public key 檔**

````bash
ssh 連線到 Server 上

# 切換到 git user
su - git
cd gitolite-admin/

# 將之前收集的 pub 檔，複製到 keydir 目錄下
cp -r /tmp/*.pub keydir/
git add -A
git commit -m "add developer public key"
git push
````

<a name="安裝-gitweb-並整合-gitolite"></a>
# 安裝 Gitweb 並整合 Gitolite
[參考資料](https://ubuntuforums.org/showthread.php?t=2244960)

<a name="系統套件安裝-2"></a>
## 系統套件安裝

````bash
sudo apt-get install gitweb apache2
sudo usermod -a G git www-data
# 將 www-data 使用者加入 git group
````

<a name="apache-24-與-gitweb-設定"></a>
## Apache 2.4 與 Gitweb 設定

gitweb 安裝後，產生的設定是 Apache 2.2 的設定寫法，所以在2.4版需要做些修正

- 調整 gitweb 設定檔位置

````bash
sudo cp /etc/apache2/conf.d/gitweb /etc/apache2/conf-available/gitweb.conf
cd /etc/apache2/conf-enabled
sudo ln -s ../conf-available/gitweb.conf
````

- 修正 gitweb conf 內容

````bash
sudo vim /etc/apache2/conf-enabled/gitweb.conf


Alias /gitweb /usr/share/gitweb

<Directory /usr/share/gitweb>
  Options +FollowSymLinks +ExecCGI
  AddHandler cgi-script .cgi
</Directory>
````

- Apache 載入 cgi model `sudo a2enmod cgi`
- 重啟 Apache Server `sudo service apache2 restart`

<a name="修正-gitweb-conf"></a>
## 修正 Gitweb conf

````bash
sudo vim /etc/gitweb.conf

$projectroot = "/home/git/repositories";
# Syntax highlighting
$feature{'highlight'}{'default'} = [1];
# 提供系統 loadavg check，若系統繁忙，逛 gitweb 只會看到 503 - The load average on the server is too high 訊息
$masload = 500;
$projects_list = $projectroot; # unmark this line
````

<a name="修正-gitolite-部分"></a>
## 修正 Gitolite 部分

- ssh 連線到 Server 上
- su - git (切換到 git user)
- `vim .gitolite.rc`

````bash
$REPO_UMASK = 0027; # change this value
$WEB_INTERFACE = "gitweb”;  # unmark this line
$GL_GITCONFIG_KEYS = "gitweb.owner gitweb.description .*”;   # change this value
````

<a name="建立專案設定檔修改部分"></a>
## 建立專案設定檔修改部分
_gitolite-admin/conf/gitolite.conf_

- 將所有專案加入 gitweb 與 daemon 兩個帳戶的讀取權限，才能讓 gitweb 讀取到專案資料
- 原有的專案可以添加一些資訊，來透過 gitweb 顯示出來

````bash
# 加入部分
repo    @all
        R       =   gitweb daemon

# 專案描述部份
repo    testing
        RW+     =   @all
    config gitweb.owner         = "Sagacity Tech. Co., Ltd."
    config gitweb.description   = "This is test repository"
    config gitweb.url           = git@<IP or 網址>:testing.git
````

- 檢查 repositories 目錄權限可被讀取
- `sudo service apache2 restart` (重啟 Apache)
- 連線到 http://IP or 網址/gitweb
