---
layout: post
title: Linux相關筆記
date: 2016-08-28 16:17:52
tags:
 - linux
 - crontab
 - mount
categories:
 - Linux
photos:
 - https://monovm.com/images/unzip-centos.png
---
<!-- MarkdownTOC -->

- Linux 相關資料
    - 使用者磁碟限額
            - 檢查使用者磁碟限額
            - 啟動 / 關閉磁碟限額
            - 編輯 使用者/群組 磁碟限額規則
    - 開機自動執行 script
    - 開機自動掛載遠端共享資料夾
        - 手動掛載指令步驟 :
        - 改為開機後自動掛載步驟：
    - 使用crontab幫工作排程
    - 建立群組共用目錄
    - AWS EC2\(Ubuntu\)的使用者改用密碼登入

<!-- /MarkdownTOC -->


<a name="linux-相關資料"></a>
# Linux 相關資料

<a name="使用者磁碟限額"></a>
## 使用者磁碟限額

* 參考資料：
    1. [quota - 磁碟配額](https://note.drx.tw/2008/03/disk-quota.html)
    2. [Linux 磁碟配額 (Quota)](http://linux.vbird.org/linux_basic/0420quota/0420quota-fc4.php)

#### 檢查使用者磁碟限額

````bash
sudo quota <UserName>
````

#### 啟動 / 關閉磁碟限額

````bash
sudo quotaon -av  啟動
sudo quotaoff -a    全部關閉
sudo quotaoff -u <UserName>
````
<!-- more -->
#### 編輯 使用者/群組 磁碟限額規則

````bash
jonny@gutsy:~$ sudo edquota -u UserName [Enter]
jonny@gutsy:~$ sudo edquota -g GroupName [Enter]
Disk quotas for user jonny (uid 1004):
Filesystem  blocks  soft  hard inodes soft hard
/dev/sda7   24     100000 102400   7  0  0

// 此範例為限制 100 MB，如想限制 1 GB 請改用 1000000 及 1024000。
````

* 各欄介紹
    - 第１欄 (Filesystem)：啟用 quota 的檔案系統名增。
    - 第２欄 (blocks)：使用者已使用的區塊數量。
    - 第３欄 (soft)：非強制性的磁碟空間限制，單位為 KB。
    - 第４欄 (hard)：強制性的磁碟空間限制，單位為 KB。
    - 第５欄 (inodes)：使用者已使用的檔案數目。
    - 第６欄 (soft)：非強制性的 inode 限制。
    - 第７欄 (hard)：強制性的 inode 限制。

<a name="開機自動執行-script"></a>
## 開機自動執行 script

在 Debian 及 Ubuntu 開機後, 如果想自動執行一些 shell script 或指令, 可以直接編輯 /etc/rc.local 檔案。

以下是 /etc/rc.local 預設內容:
````
#!/bin/sh -e
#
# rc.local - executed at the end of each multiuser runlevel
#
# Make sure that the script will "exit 0" on success or any other
# value on error.
````

要加入自動執行指令或 shell script 十分簡單, 只要直接加上要執行的指令即可，例如我要讓 solr-5.3.1 每次重開機後也被啟動，就加入`/path/to/solr-5.3.1/bin/solr start`

````
#!/bin/sh -e
#
# rc.local - executed at the end of each multiuser runlevel
#
# Make sure that the script will "exit 0" on success or any other
# value on error.
/home/ubuntu/solr-5.3.1/bin/solr start
````

<a name="開機自動掛載遠端共享資料夾"></a>
## 開機自動掛載遠端共享資料夾
由於 Local 的資料備份是透過 mount nas 所分享的資料夾來備份資料
所以每次重開機或 nas 出問題，mount 就會斷掉，必須手動在重新 mount 上

<a name="手動掛載指令步驟-"></a>
### 手動掛載指令步驟 :
1. 請使用root來執行
2. mount指令(20150826更新) : `mount -t cifs -o username=oooo,password=oooo //192.168.68.101/homes/ubuntu /mnt/nas`
3. 檢查指令 : `df -h` 或 `df -Th /mnt/nas`
4. unmount指令 : `umount /mnt/nas`

<a name="改為開機後自動掛載步驟："></a>
### 改為開機後自動掛載步驟：
[參考資料](http://ubuntuforums.org/showthread.php?t=1806455)

- 安裝 smbfs

````bash
sudo apt-get install smbfs
````
- 建立本機對應目錄

````bash
sudo mkdir /mnt/nas
````
- 加入遠端分享資料夾的帳號密碼

````bash
sudo vim /root/.cifspwd

# .cifspwd 檔案內容
username=oooo
password=oooo
````
- 修改 fstab (/etc/fstab) 來增加重開機後自動掛載的資料

````bash
//192.168.68.101/homes/ubuntu /mnt/nas cifs user,uid=1000,gid=users,credentials=/root/.cifspwd 0 0

# 當中的 uid 為 /mnt/nas 建立的初始帳戶 uid (soar:1000)
# 使用 id -u username 去檢查 uid
````
- 檢查是否成功
    - 如果已經掛載，先解除掛載 `umount /mnt/nas`
    - 然後在透過下列語法模擬開機後執行的 mount 動作 `sudo mount -a`
    - `df -h` 來檢查是否 mount 成功

<a name="使用crontab幫工作排程"></a>
## 使用crontab幫工作排程
* `crontab -l` : 列出目前使用者的排程工作
* `crontab -e` : 編輯目前使用者的排程工作

````bash
10 3 * * 6 /bin/bash -c 'mysql_backup/backup.sh >> /mnt/nas/mysql_backup/backup.log 2>&1'
30 3 * * 6 /bin/bash -c 'weekly/backup.sh >> /mnt/nas/weekly/backup.log 2>&1'
0 4 * * 6 /bin/sh -c 'system_backup/backup.sh >> /mnt/nas/system_backup/backup.log 2>&1’
````

![crontab時間含義](https://i.imgur.com/OGytWih.gif)

<a name="建立群組共用目錄"></a>
## 建立群組共用目錄
[參考資料](https://www.babyface2.com/NetAdmin/41200906basic/) (20190813已失效)

**請先切換成root帳號**

- 建立使用者帳號
I
````bash
useradd -s /bin/bash -G sudo -m -d /home/username username -p 密碼
````
- 建立群組帳號，GID使用50000

````bash
groupadd -g 50000 {group-name}
````
- 將使用者帳號加入群組
    - 使用指令「vigr」(vi /etc/group的意思)，接著大寫G到最下面
    - 會看到剛剛建立的群組名稱與GID

    ````bash
    {group-name}:x:50000:
    ````
- 在這行後面加上使用者帳號，多數使用者以逗號隔開

````bash
{group-name}:x:50000:user1,user2,user3
````

- 建立目錄來共享

````bash
mkdir /home/{group-name}/shard-folder
````
- 變更目錄權限

````bash
hgrp {group-name}  /home/{group-name}/shard-folder
````
- 變更目錄權限(其中的x表示其他賬戶的存取權限，4:可讀，5:可讀＋執行，7:可讀寫＋執行)

````bash
chmod 277x /home/{group-name}/shard-folder
````

<a name="aws-ec2ubuntu的使用者改用密碼登入"></a>
## AWS EC2(Ubuntu)的使用者改用密碼登入

先使用正常的方式登入

````bash
ssh -i xxxx.pem ubuntu@ip
````

修改 sshd_config 檔，將PasswordAuthentication 改成 yes 後存檔離開

````bash
sudo vim /etc/ssh/sshd_config

sudo service ssh restart (ssh服務重啟)
````

重新改用使用者帳號登入，就需要打密碼了，**前提是這個賬戶有設定密碼**
