---
layout: post
title: Google Cloud Platform 初體驗
author: Soar Lin
cdn: header-off
header-img: 'https://soarlin.github.io/images/gcp/header_bg.jpg'
date: 2017-02-28 22:33:44
tags:
  - gcp
  - google cloud platform
  - google compute engine
  - elasticsearch
categories:
  - Server
---

<!-- MarkdownTOC -->

- [Google Cloud Platform 初體驗](#google-cloud-platform-初體驗)
  - [實驗](#實驗)
  - [Create VM on Google Compute Engine](#create-vm-on-google-compute-engine)
  - [Install JDK and ElasticSearch](#install-jdk-and-elasticsearch)
    - [地雷區1](#地雷區1)
  - [Install elasticsearch-analysis-ik](#install-elasticsearch-analysis-ik)
    - [地雷區2](#地雷區2)
  - [Setup RESTful API for ES](#setup-restful-api-for-es)
  - [Create Index,Type and Mapping](#create-indextype-and-mapping)
    - [地雷區3](#地雷區3)
  - [Upload data to create indices](#upload-data-to-create-indices)
  - [Test Query API](#test-query-api)
- [後記！](#後記！)
  - [補充說明](#補充說明)

<!-- /MarkdownTOC -->


<a name="google-cloud-platform-初體驗"></a>
Google Cloud Platform 初體驗
==========================

原本自己都使用 AWS，但上週聽阿宏說改用 google cloud platform 似乎價格會降低將近一半，所以就來試試看了，覺得 GCP 一開始的 Free Trial 給的不是很吸引人，因為只有 $300 美元 / 兩個月的期限，兩個月其實很快就過去了，然後馬上就要開始收費，很多東西可能才剛架設好，甚至還沒摸熟，服務還沒正式啟用，就開始要使用者付費，這感覺不是很愉快。

反觀 AWS 的 Free Trial 方案，提供新帳號一年許多服務免費試用，雖然可以使用的等級是最低階的，不過對於新創事業來說，可以邊摸索雲端服務編開發跟部署，等差不多準備就緒應該也好幾個月過去了，接著熟悉雲端服務後，也差不多可以把等級提升正式營運了。

好了，廢話少說，這次就先找一個簡單的範例來做實驗，在開始之前覺得應該很簡單，實際操作後，才發現踩了好多雷，以及自己原本的文件不夠充足，但還是可以花時間一一克服，唯一比較辛苦的是....我家網路連不上stackoverflow....ＯＭＧ，對於一個工程師來說連不上這網站幾乎是武功被廢的狀態了

<a name="實驗"></a>
## 實驗
**將 elasticsearch 移植到 google compute engine 上面運行**

為了達成這目標，有底下幾個步驟：

1. 建立一台VM，類似 AWS EC2 上開啟一台 instance
2. 安裝 ElasticSearch，當然還必須先把 JDK 安裝好， JDK 版本也要對
3. 安裝中文分詞套件 [ik](https://github.com/medcl/elasticsearch-analysis-ik)，須根據 es 版本編譯正確版本套件
4. 建立 RESTful API 來存取 ElasticSearch
5. 建立 Index 與 Type 以及 Mapping 資料
6. 上傳檔案批次建立 index 資料
7. 搜尋 API 測試

<a name="create-vm-on-google-compute-engine"></a>
## Create VM on Google Compute Engine
其實進入 [Google Cloud Platform](https://cloud.google.com/) 官網，就可以看到親切的繁體中文介面，大大增加了我想繼續試用下去的心情。

進入 Compute Engine 的介面，選擇建立"執行個體"後，介面也都是中文的，很好理解，尤其是已經被 AWS 訓練過後，底下是我一開始的設定

![參考圖1](https://soarlin.github.io/images/gcp/gce1.png)
<!-- more -->
* 名稱 : micro-elasticsearch-server(請自訂吧！)
* 區域 : us-east-a (為了省錢，先放這邊吧！)
* 機器類型 : 微型(f1-micro)
  * 一個共用vCPU
  * RAM : 0.6G
* 開機磁碟 :
  * Ubuntu 16.04 LTS (原本都用14.04，趁現在換個新版試試看)
  * 標準永久磁碟 10G (為了省錢，放棄SSD)
* 身分及 API 存取權 : 允許預設存取權
* 防火牆 : 允許 HTTP, HTTPS 流量
  * 之後再手動設定 Node.js 的 port
  * 以及本地端IP連 elasticsearch 的 9200 port
* SSH 金鑰
  * 請自行 cat ~/.ssh/id_rsa.pub 的內容貼上
  * 注意自己的登入名稱

![參考圖2](https://soarlin.github.io/images/gcp/gce2.png)

建立完成後，就可以使用網頁版 Terminal 或是自己習慣的SSH軟體連線進去主機操作了，由於已經新增SSH金鑰，所以可以直接根據畫面上顯示的"外部IP"來連線

![ssh](https://soarlin.github.io/images/gcp/ssh.png)

````
ssh soar@104.XXX.XXX.106
````

<a name="install-jdk-and-elasticsearch"></a>
## Install JDK and ElasticSearch

* 先安裝 Oracle JDK 8 ，[教學文件](https://www.digitalocean.com/community/tutorials/how-to-install-java-with-apt-get-on-ubuntu-16-04)
* 安裝 Elasticsearch 到 Server 上，[教學文件](https://www.digitalocean.com/community/tutorials/how-to-install-and-configure-elasticsearch-on-ubuntu-16-04)
  * 這裡我又想心血來潮去官網抓了 Elasticsearch 5.2.1 版的 deb 檔來安裝
  * 修改的設定檔如下

````
sudo vim /etc/elasticsearch/elasticsearch.yml

cluster.name: my-cluster
http.port: 9200
network.host: 0.0.0.0
````

* 啟動 Elasticsearch

````
sudo service elasticsearch start
````

<a name="地雷區1"></a>
### 地雷區1
這裡我遇到了第一個地雷，原本以為可以順利啟動 Elasticsearch，但後來檢查的時候發現服務沒啟動(狀態檢查`sudo service elasticsearch status`)，原因是由於 JVM 啟動時所需要的記憶體預設為**2G**，靠！怎麼我之前那台 t2.micro 才 1G 的 RAM 都可以跑，在這邊就挫賽了，難道因為改用新版比較潮，所以記憶體也需要比較多？

找了很多資料(從這時候開始無法連上stackoverflow)，最後try了很久，好像只需要修改 jvm 設定，在 5.2 版後可以在 `/etc/elasticsearch/` 下看到有個 `jvm.options` 的檔案，打開來修改吧！

````
# 註解原本的這兩行
#-Xms2g
#-Xmx2g

# 修改為下面這樣
-Xms1g
-Xmx1g
````

這時候，聰明的人應該會發現原本開啟的 vm 只有 0.6G RAM，應該不行吧！__沒錯！__

所以需要調整 vm 的等級，所以乖乖地將 vm stop 後，將機器類型從 f1-micro 更換到 g1-small (1 個 vCPU，1.7 GB 記憶體)，然後再重新 SSH 進去啟動 Elasticsearch 吧！

<a name="install-elasticsearch-analysis-ik"></a>
## Install elasticsearch-analysis-ik

安裝一下中文分詞的套件，因為已經不是第一次了，所以還滿容易上手的

* clone 專案回自己電腦

````
git clone https://github.com/medcl/elasticsearch-analysis-ik.git
````

* 切換到對應的 ES 版本
  * ES version 5.2.1 ==> IK version 5.2.1

````
git checkout tags/v5.2.1
````

* 使用 mvn 來封裝 package

````
mvn package
````

* 上傳封裝後 zip 擋到 server 上

````
sftp soar@104.XXX.XXX.106
put target/releases/elasticsearch-analysis-ik-5.2.1.zip .

ssh soar@104.XXX.XXX.106
# copy zip to /usr/share/elasticsearch/plugins
sudo -s
cp elasticsearch-analysis-ik-5.2.1.zip /usr/share/elasticsearch/plugins
cd /usr/share/elasticsearch/plugins
mkdir ik
unzip elasticsearch-analysis-ik-5.2.1.zip -d ik
````

<a name="地雷區2"></a>
### 地雷區2
其實是自己白癡，解壓縮後忘了把zip黨刪除，造成後來啟動 es 失敗，所以 plugins 目錄下請保持正確檔案結構

<a name="setup-restful-api-for-es"></a>
## Setup RESTful API for ES

使用自己之前建立的專案 [es-restful-api](https://github.com/SoarLin/es-restful-api)，應該可以很快的把服務建立

前提是先安裝好 Node.js 以及 npm，安裝 Node.js 可參考 [官方文件](https://nodejs.org/en/download/package-manager/#debian-and-ubuntu-based-linux-distributions) 或是 [digitalocean的文章](https://www.digitalocean.com/community/tutorials/how-to-install-node-js-on-ubuntu-16-04)

<a name="create-indextype-and-mapping"></a>
## Create Index,Type and Mapping

根據之前專案補上的說明文件，大致上可以順利完成，但是在建立 Mapping 時出現狀況了

<a name="地雷區3"></a>
### 地雷區3
因為 Elasticsearch 5.x 的版本內不在支援 "string" 這個資料類型，所以得改成 "text" 才能順利建立 mapping

<a name="upload-data-to-create-indices"></a>
## Upload data to create indices

一樣可以參考專案內的文件，打開 upload 網址，然後將 blog 的 db.json 上傳上去，這邊只要注意原本 API 目錄內沒有 .es-last-index-time 這個檔案就好，才能把資料新建上去

<a name="test-query-api"></a>
## Test Query API
這邊依然根據專案的文件來測試吧！


<a name="後記！"></a>
# 後記！
我這個白痴在 Server 上使用 ufw 來設定防火牆規則，而外部 Google Cloud Platform 的網路中也設定好規則，__但是！__主機裡的 ufw 規則一開始我就忘了開啟 22 port 來讓自己電腦連進去，所以就在我剛剛很開心地關掉 SSH 後，就再也無法連線進去了，所以今天所做的一切都白費了。

<a name="補充說明"></a>
## 補充說明
後來經過半個多小時的掙扎，以為複製一台機器就有機會成功，結果只是規格複製，裡面空空如也。不過卻有找到可以再開機的時候，讓主機預先執行指定的 script 語法，所以再回到不願放棄的 VM 裡設定，增加自訂 script

但是記得要先停止 VM 再來更改設定

**自訂中繼資料**

|  Key            |        Value         |
|-----------------|----------------------|
| startup-script  | sudo ufw allow ssh   |

也可以在對等 REST 的描述裡找到位置添加，位於 "metadata" 下 "items" 的陣列內加入一組 object，包含 key 與 value

````
  "metadata": {
    "kind": "compute#metadata",
    "fingerprint": "GXxxxxxxxx=",
    "items": [
      {
        "key": "startup-script",
        "value": "sudo ufw allow ssh"
      },
      {
        "key": "ssh-keys",
        "value": "soar:ssh-rsa AAAAWMrLjP[中間省略]zoHWzIzP/ soar@Soar.local"
      }
    ]
  },
````
