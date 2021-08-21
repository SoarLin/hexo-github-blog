---
layout: post
title: 使用 Travis CI 自動發布 Hexo 內容到 Github
author: Soar Lin
cdn: header-off
header-img: 'https://soarlin.github.io/images/tarvis-ci/Travis-CI-bg.png'
date: 2017-03-29 23:27:57
tags:
  - TravisCI
  - Hexo
  - Github
categories:
  - CI/CD
---

<!-- MarkdownTOC -->

- [前期準備](#%E5%89%8D%E6%9C%9F%E6%BA%96%E5%82%99)
- [Add Private Key](#add-private-key)
- [加入 SSH 連線設定](#%E5%8A%A0%E5%85%A5-ssh-%E9%80%A3%E7%B7%9A%E8%A8%AD%E5%AE%9A)
  - [增加 ssh 連線的 config 設定](#%E5%A2%9E%E5%8A%A0-ssh-%E9%80%A3%E7%B7%9A%E7%9A%84-config-%E8%A8%AD%E5%AE%9A)
  - [.travis.yml 內設定](#travisyml-%E5%85%A7%E8%A8%AD%E5%AE%9A)
- [增加 git 資訊](#%E5%A2%9E%E5%8A%A0-git-%E8%B3%87%E8%A8%8A)
- [加入 Hexo 以及執行 Deploy](#%E5%8A%A0%E5%85%A5-hexo-%E4%BB%A5%E5%8F%8A%E5%9F%B7%E8%A1%8C-deploy)
  - [補充：](#%E8%A3%9C%E5%85%85%EF%BC%9A)
- [後記](#%E5%BE%8C%E8%A8%98)
- [Reference](#reference)

<!-- /MarkdownTOC -->


其實一直都想研究一下 CI/CD 的一些流程，知道 Travis CI 可以結合 Github 上的專案來進行，那就先從一些簡單的小專案開始好了，上網找到一篇[文章](https://zespia.tw/blog/2015/01/21/continuous-deployment-to-github-with-travis/)有 Travis CI 與 Github 以及 Hexo 的關鍵字，害我好興奮，看了好一陣子後決定上了！
<!-- more -->
<a name="%E5%89%8D%E6%9C%9F%E6%BA%96%E5%82%99"></a>
# 前期準備

* 申請 Travis CI 帳號
* 串接 Github 上的 repo
* 替 github 的 repo 加上 .trivas.yml 檔案
	* 這就比較麻煩，因為得根據各自專案的程式語言來撰寫，我也超不熟，只好去官方網站看[文件](https://docs.travis-ci.com/user/languages/)了
	* 我先以目前 hexo 的專案為例，就如下面顯示少少兩三行

````
language: node_js
node_js:
  - '4'
````


<a name="add-private-key"></a>
# Add Private Key
因為不能大辣辣的把自己 ssh private key 丟到 github 上，所以 Travis CI 提供加密的方式，可以把 private 加密，等到 Travis 上再來處理；因為我已經把自己電腦的 private key 加到 github 上，所以就直接把 key 加到 Travis 與對應的 repo 上

* 安裝 Travis command line tool，因為使用 ruby 所以要確認電腦已經安裝好 ruby

````
gem install travis
````

* 透過 Command Line Tool 登入到 Travis，需要輸入 github 的帳號密碼

````
travis login --auto
````

* 將自己的 private key 加到對應 repo，加入後會自動改寫 .travis.yml 檔案
	* 我後來在專案下建立 .travis 目錄，然後將 private key 資料放進去

````
travis encrypt-file ~/.ssh/id_rsa_github --add

// or 手動指定 repo
travis encrypt-file ~/.ssh/id_rsa_github --add YOUR-NAME/YOUR-REPO-NAME

mkdir .travis
cp id_rsa_github.enc .travis/
````

這時候 .travis.yml 裡面會被添加一些加解密的指令，就不要亂改嘍！注意最後的 `-in xxxxx.enc -out oooooo -d`，當中`xxxxx`是剛剛加密後產生的 .enc 檔，而`ooooo`是 Travis 解密後的檔案路徑，之後會一直用到

* `-in xxxxx.enc` 整個 repo 被 Travis CI 抓取後 private key 的相對路徑，剛剛搬到 .travis 目錄下，所以是 `.travis/id_rsa_github.enc`
* `-out ooooooo` 解密後 private key 路徑，後續會再用到，這裡我定義成 `~/.ssh/id_rsa`

````
language: node_js
node_js:
	- '4'
before_install:
	- openssl aes-256-cbc -K $encrypted_43f1702cd897_key -iv $encrypted_43f1702cd897_iv -in .travis/id_rsa_github.enc -out ~/.ssh/id_rsa -d

````

<a name="%E5%8A%A0%E5%85%A5-ssh-%E9%80%A3%E7%B7%9A%E8%A8%AD%E5%AE%9A"></a>
# 加入 SSH 連線設定

這時只是把自己的 private key 加密後，在 Travis 從 github 抓出來解密成功，接著還需要指定 SSH 連回 github 使用剛剛解密的 private key，步驟大概是：

<a name="%E5%A2%9E%E5%8A%A0-ssh-%E9%80%A3%E7%B7%9A%E7%9A%84-config-%E8%A8%AD%E5%AE%9A"></a>
## 增加 ssh 連線的 config 設定
* 自己的再連 github 的時候，因為有兩個 github 帳號，所以產生了兩組 private key使用，連帶需要把 ssh 連線設定分開寫
* 這邊只列出自己目前常用帳號的 ssh 連線設定提供參考

````
vim .travis/ssh_config
````

內容如下：

````
# SoarLin@github
Host SoarLin.github.com
	HostName github.com
	User git
	StrictHostKeyChecking no
	# 底下路徑需要根據實際 Travis CI 上存取解開後的 private key 位置
	IdentityFile ~/.ssh/id_rsa
	IdentitiesOnly yes
````

<a name="travisyml-%E5%85%A7%E8%A8%AD%E5%AE%9A"></a>
## .travis.yml 內設定

1. 更改 private key 權限為 600
2. 將 private key 增加到系統中
3. 將 ssh 連線搬到系統 `~/.ssh` 目錄下


以上這些動作，大概會讓 .travis.yml 檔案變成如下

````
language: node_js
node_js:
	- '4'
before_install:
	- openssl aes-256-cbc -K $encrypted_43f1702cd897_key -iv $encrypted_43f1702cd897_iv -in .travis/id_rsa_github.enc -out id_rsa -d

	- chmod 600 ~/.ssh/id_rsa

	- eval $(ssh-agent)
	- ssh-add ~/.ssh/id_rsa

	- cp .travis/ssh_config ~/.ssh/config
````

<a name="%E5%A2%9E%E5%8A%A0-git-%E8%B3%87%E8%A8%8A"></a>
# 增加 git 資訊
因為 hexo deploy 的時候，會將所有產生出來的檔案 push 回 github，所以需要有個 git psuh 的使用者資訊，所以繼續加入 .travis.yml

````
language: node_js
node_js:
	- '4'
before_install:
	- openssl aes-256-cbc -K $encrypted_43f1702cd897_key -iv $encrypted_43f1702cd897_iv -in id_rsa_github.enc -out id_rsa_github -d

	- chmod 600 id_rsa_github

	- eval $(ssh-agent)
	- ssh-add id_rsa_github

	- cp .travis/ssh_config ~/.ssh/config

	- git config --global user.name "Soar Lin"
	- git config --global user.email soar.lin@gmail.com

````

<a name="%E5%8A%A0%E5%85%A5-hexo-%E4%BB%A5%E5%8F%8A%E5%9F%B7%E8%A1%8C-deploy"></a>
# 加入 Hexo 以及執行 Deploy
最後當然是把 hexo 套件安裝好，然後執行`hexo generate`來產生檔案，以及`hexo deploy`來自動發布，因為我自己還要把 blog 文章丟去 ElasticSearch Server 建立 index 來做搜尋索引，所以會再多一些東西，最後完成的 .travis.yml 大概如下：

<a name="%E8%A3%9C%E5%85%85%EF%BC%9A"></a>
## 補充：
一開始忘了把 package.json 內相關套件安裝，所以後來才又補上 `npm install`，以及增加個 cache，才不用每次都重新安裝 node_modules 內的套件。

目前 repo 內的佈景，不曉得為何沒有跟著上 github，所以之前 deploy 後，整個頁面空空如也，所以只好再把布景重新傳上去

````
language: node_js

node_js:
  - '4'

cache:
  directories:
    - node_modules

before_install:
  - openssl aes-256-cbc -K $encrypted_43f1702cd897_key -iv $encrypted_43f1702cd897_iv -in .travis/id_rsa_github.enc -out ~/.ssh/id_rsa -d

  - chmod 600 ~/.ssh/id_rsa

  - eval $(ssh-agent)
  - ssh-add ~/.ssh/id_rsa

  - cp .travis/ssh_config ~/.ssh/config

  - git config --global user.name "Soar Lin"
  - git config --global user.email soar.lin@gmail.com

  - npm install -g hexo-cli

install:
  - npm install

script:
  - hexo generate
  - curl -i -X POST "https://soar.stco.tw/update" -F 'file=@db.json' -F 'index=blog' -F 'type=articles'
  - hexo deploy

branches:
 only:
  - master

````

<a name="%E5%BE%8C%E8%A8%98"></a>
# 後記

雖然好像不複雜，可是我也是照著大大的教學文章，做了好幾個小時，不斷的失敗，不斷的找其他資料參考，最後才完成這小小的流程。希望之後可以越來越上手嘍～

<a name="reference"></a>
# Reference

[用Travis CI自动部署Hexo博客](https://www.karlzhou.com/2016/05/28/travis-ci-deploy-blog/) <-- 推薦這篇，很詳細
[用 Travis CI 自動部署網站到 GitHub](https://zespia.tw/blog/2015/01/21/continuous-deployment-to-github-with-travis/) <-- Hexo作者大大的文章
[用 Travis CI 自動部屬 hexo 到 GitHub](https://ssarcandy.tw/2016/07/29/hexo-auto-deploy/)
[使用 Travis CI 自动更新 Hexo Blog](http://xwartz.xyz/pupa/2016/06/auto-update-with-travis-ci/)
