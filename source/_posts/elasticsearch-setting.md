---
layout: post
title: Elasticsearch Installation and Setting
author: Soar Lin
cdn: header-off
header-img: ''
date: 2016-11-12 17:49:40
tags:
  - elasticsearch
  - java
  - maven
categories:
  - Server
---
<!-- MarkdownTOC -->

- [Elasticsearch 筆記\(環境設定\)](#elasticsearch-筆記環境設定)
    - [前言\(垃圾話\)](#前言垃圾話)
    - [Installation 安裝](#installation-安裝)
        - [檢查 Java 版本](#檢查-java-版本)
        - [使用整包壓縮檔方式](#使用整包壓縮檔方式)
        - [Amazon Linux 上安裝方式](#amazon-linux-上安裝方式)
    - [安裝套件](#安裝套件)
        - [安裝 AWS Cloud Plugin](#安裝-aws-cloud-plugin)
        - [安裝 IK 分詞套件](#安裝-ik-分詞套件)

<!-- /MarkdownTOC -->

<a name="elasticsearch-筆記環境設定"></a>
# Elasticsearch 筆記(環境設定)

<a name="前言垃圾話"></a>
## 前言(垃圾話)
由於先前接 case 的時候，簡單的碰了一下 solr 這套搜尋引擎，後來又聽鈞元哥提到他正在玩的另一套搜尋引擎 - Elasticsearch，記得之前在臉書上比較常看到 Elasticsearch 的討論或文章，所以後來自己也選擇這套來研究。

一開始出發點很單純，因為開始在寫 blog，希望 blog 上開始有文章搜尋的功能，雖然現在這技術相關文章的 blog 裡面也才10來篇文章，切個兩頁就差不多了，根本不太需要特別弄個搜尋功能，不過本著好玩的心情開始來鑽研這工具，深深覺得日後工作上肯定會在用到。

果不其然前陣子收到合作單位發信來問說，他在我們資料庫搜尋題目的時候，想找 "go" 一詞相關的題目，結果我們回傳給他的題目卻是 "good" 的結果...QQ。因為資料庫是MySQL，我們用這種 「%keyword%」 方式來針對題目欄位搜尋，當然會出現這種悲劇...Orz。跟同事討論的解法大概就是使用能夠正確斷詞斷字的搜尋引擎吧！

不過這套搜尋引擎工具，實在是博大精深，我到現在大概只摸到一點點邊邊角角吧！趕快趁熱來把一些資訊整理記錄下來。造福日後的自己。另外，一點小小哀怨的是，我才研究兩週左右，趕巧遇上版本從 2.4.1 瞬間變成 5.0 ... 我還是先乖乖把 2.4.1 的使用弄熟好了。

<!-- more -->

<a name="installation-安裝"></a>
## Installation 安裝

根據官方文件的方式，我先在自己的 Macbook pro 電腦上試著安裝使用，還算簡單，缺點就是得一直開著一個 terminal 的頁面來運行 elasticsearch。

Elasticsearch 仍是需要 Java 環境來運行，而 Java 版本至少需要 1.7 以上，官網推薦使用 Oracle JDK version 1.8.0_73 這版本來安裝(教學請根據各自作業系統環境 google 吧)。

<a name="檢查-java-版本"></a>
### 檢查 Java 版本

````
java -version
echo $JAVA_HOME
````

<a name="使用整包壓縮檔方式"></a>
### 使用整包壓縮檔方式
#### 下載並解壓縮 Elasticsearch 2.4.1 版本，開始執行

````
curl -L -O https://download.elastic.co/elasticsearch/release/org/elasticsearch/distribution/tar/elasticsearch/2.4.1/elasticsearch-2.4.1.tar.gz

tar -xvf elasticsearch-2.4.1.tar.gz

cd elasticsearch-2.4.1/bin
./elasticsearch
````

#### 設定調整
設定叢集與節點名稱，可以利用再啟動 elasticsearch 指令後面添加參數

````
./elasticsearch --cluster.name my_cluster_name --node.name my_node_name
````

另一個作法是，先把設定檔改好，然後再啟動 elasticsearch

````
$ ~/elasticsearch-2.4.1/ cd config/
vim elasticsearch.yml

// add custom cluster.name and node.name at file last line
cluster.name: my_cluster_name
node.name: my_node_name
````

<a name="amazon-linux-上安裝方式"></a>
### Amazon Linux 上安裝方式
會使用 Amazon linux 其實是個美麗的意外，因為某天早上先從 AWS Elasticsearch 服務開始測試，發現無法安裝中文分詞套件，只好放棄這個偷懶的方式，後來只好重新啟動一台 EC2 instance 來用，一開始用 Ubuntu 14.04 版本(自己慣用版本)，但是找到的 [教學文(How To Install and Configure Elasticsearch on Ubuntu 14.04)](https://www.digitalocean.com/community/tutorials/how-to-install-and-configure-elasticsearch-on-ubuntu-14-04) 到最後好像也是在安裝中文分詞遇到狀況

幾番波折下，找到比較詳細的 [安裝教學1](https://www.elastic.co/blog/running-elasticsearch-on-aws) [安裝教學2](https://blog.pushapps.mobi/installing-elasticsearch-2-2-and-kibana-4-4-on-amazon-linux/) 已經是使用 Amazon Linux 了，只好重新啟動 Amazon Linux 的 EC2 instance 來安裝使用。

#### Install Java 8

````
sudo yum install java-1.8.0
````
安裝後檢查一下版本

````
java -version

--------------------------------------------------------

java version "1.8.0_65"
Java(TM) SE Runtime Environment (build 1.8.0_65-b17)
Java HotSpot(TM) 64-Bit Server VM (build 25.65-b01, mixed mode)
````

#### 安裝 Elasticsearch 2.4.1

````
sudo rpm -i https://download.elastic.co/elasticsearch/release/org/elasticsearch/distribution/rpm/elasticsearch/2.4.1/elasticsearch-2.4.1.rpm
````

另外使用 yum 的安裝方式，可以參考 [這篇](https://blog.pushapps.mobi/installing-elasticsearch-2-2-and-kibana-4-4-on-amazon-linux/)，底下節錄安裝步驟出來

Elasticsearch 可以透過新增套件倉儲網址到套件管理檔案裡的方式來使用 yum 指令安裝。首先先執行底下指令:

````
sudo rpm --import http://packages.elastic.co/GPG-KEY-elasticsearch
````

接著編輯 yum respository 檔案

````
sudo vi /etc/yum.repos.d/elasticsearch.repo

// And save the following configuration to it
--------------------------------------------

[elasticsearch-2.x]
name=Elasticsearch repository for 2.x packages
baseurl=http://packages.elastic.co/elasticsearch/2.x/centos
gpgcheck=1
gpgkey=http://packages.elastic.co/GPG-KEY-elasticsearch
enabled=1
````

然後再執行安裝指令:

````
sudo yum -y install elasticsearch
````

#### 啟動 elasticsearch

````
sudo service elasticsearch start (stop / restart)
````

#### 調整設定值

設定檔位置 `/etc/elasticsearch/elasticsearch.yml`

````
sudo vi /etc/elasticsearch/elasticsearch.yml
````

設定讓外部可連入該台主機 elasticsearch，加入 `network.host: 0.0.0.0` 到設定檔內，不過要注意這樣有點風險，只要有人知道這台主機 IP，就可以拿來使用，所以主機防火牆請在另外設定允許的 IP，來降低主機被拿去當他的搜尋引擎主機使用的風險。

<a name="安裝套件"></a>
## 安裝套件

<a name="安裝-aws-cloud-plugin"></a>
### 安裝 AWS Cloud Plugin
AWS EC2 上要使用 cluster，就必須要安裝此套件

插件安裝位置 `/usr/share/elasticsearch/`

````
cd /usr/share/elasticsearch/
sudo bin/plugin install cloud-aws
````

<a name="安裝-ik-分詞套件"></a>
### 安裝 IK 分詞套件

這個步驟真的比較複雜，根據 IK 在 [Github](https://github.com/medcl/elasticsearch-analysis-ik) 上的說明，雖然只有短短幾行指令，但是中間有個套件我又需要另外安裝，那就是 mvn (Apache Maven:Java 自動化編譯工具)，因為我跟 Java 很不熟，所以真的是頭一次聽過這東西，不過好在有好心的老蕭學長講解，才讓我不會花太久時間摸索。

#### 安裝 mvn

在 Mac 上我使用偷懶的方式，透過 Homebrew 來安裝，[教學影片](https://www.youtube.com/watch?v=xTzLGcqUf8k)，另外使用手動的方式安裝，因為太複雜了，我就僅提供 [教學連結](https://www.mkyong.com/maven/install-maven-on-mac-osx/) 就好

````
brew install maven
````

在 Amazon Linux 上的安裝方式，可以參考[這篇](https://gist.github.com/sebsto/19b99f1fa1f32cae5d00) (不過我沒裝，我直接把自己電腦編譯出來的檔案透過SFTP上傳而已)

#### insatll ik analyze

先 clone github 上的 code 下來，然後根據 Elasticsearch 版本，切換到對應的 ik 版本，然後編譯出檔案後，再解壓縮放到 elasticsearch plugin 目錄下

````
git clone https://github.com/medcl/elasticsearch-analysis-ik.git

# 因為 elasticsearch 使用 2.4.1 版，所以 ik 選用 1.10.1 版
git checkout tags/1.10.1

# 使用maven編譯
mvn package
````

##### unzip to plugin folder

copy and unzip `target/releases/elasticsearch-analysis-ik-1.10.1.zip `  to `elasticsearch-2.4.1/plugins/ik`(解壓縮方式) or `/usr/share/elasticsearch/plugins/ik`(Amazon Linux上安裝)

````
unzip target/releases/elasticsearch-analysis-ik-1.10.1.zip
==> /usr/share/elasticsearch/plugins/ik
# unzip 指令可能要再查一下，這裡只是示意
````

以上步驟都完成後，大概算是環境基本設定都搞定了，剩下的路途依然漫長，接著還要學習如何建立 index/type 設定 index 的 mapping，這已經可以花很久時間摸索了，等 Mapping 都搞定，開始寫入資料後，搜尋的方式也需要在另外花時間慢慢學習。