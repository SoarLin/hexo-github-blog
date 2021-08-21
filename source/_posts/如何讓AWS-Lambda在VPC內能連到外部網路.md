---
layout: post
title: 設定AWS Lambda開發環境且在VPC內能連到外部網路
author: Soar Lin
cdn: header-off
header-img: 'https://soarlin.github.io/images/cloud-computer.jpg'
date: 2018-09-01 17:49:25
tags:
  - lambda
  - SQS
  - elasticsearch
  - vpc
  - subnet
  - internet gateway
  - nat gateway
categories:
  - AWS
---

> 目前需要 Lambda 在 VPC 下運作，才能連接到 VPC 下的 ElasticSearch，但是有需要有外連網路的功能

最近開始在使用 AWS Lambda，為了能跟目前 server 以及 elasticsearch 整合運作，花了約三天的時間才弄得差不多，大概是資質有限吧！沒辦法遇到狀況很快釐清原因，雖然也跟過去沒有太多這方面經驗有關，總之還是把想要的流程串接起來了，謝天謝地！

# Lambda Setup
以前雖然有用過 lambda 開發過一些簡單的東西，可是通常僅限於直接在 lambda console 介面直接撰寫 node.js，唯一一次可以在本地端開發後上傳到 lambda 的小專案是使用別人包好的 [aws-lambda-image](https://github.com/ysugimoto/aws-lambda-image) 這個自動針對 S3 image resize/reduce 的套件，只能說真的挺好用的，幫忙推薦一下：

<!-- more -->

**AWS Lambda Image** : [https://github.com/ysugimoto/aws-lambda-image](https://github.com/ysugimoto/aws-lambda-image)
如果對於上傳到 S3 的圖片想另外做縮圖、壓縮，或是不同尺寸的圖片輸出時，我想這套件應該非常實用。

## Makefile
如果電腦有安裝 [aws-cli](https://aws.amazon.com/tw/cli/) 的話，可以考慮參考 aws-lambda-image 專案裡面的 Makefile 檔案，是個很好的學習範本

這裡擷取部分內容，資料來源：[https://github.com/ysugimoto/aws-lambda-image/blob/master/Makefile](https://github.com/ysugimoto/aws-lambda-image/blob/master/Makefile)

````
lambda:
	npm install .
	@echo "Factory package files..."
      . . . . . . .
	@echo "Create package archive..."
	@cd build && zip -rq aws-lambda-image.zip .
	@mv build/aws-lambda-image.zip ./

uploadlambda: lambda
	@if [ -z "${LAMBDA_FUNCTION_NAME}" ]; then (echo "Please export LAMBDA_FUNCTION_NAME" && exit 1); fi
	aws lambda update-function-code --function-name ${LAMBDA_FUNCTION_NAME} --zip-file fileb://aws-lambda-image.zip

clean:
	@echo "clean up package files"
	@if [ -f aws-lambda-image.zip ]; then rm aws-lambda-image.zip; fi
	@rm -rf build/*
````

* `make lambda` : 用來打包要準備上傳 lambda 的 zip 檔
* `make uploadlambda` : 透過 aws-cli 的指令來上傳 zip 檔
* `make clean` : 清除打包的資料

而其中 `${LAMBDA_FUNCTION_NAME}` 這個參數可以直接在環境中透過 export 的方式提前宣告，或是在執行 make 指令時，添加在後面

```
// xxxxxxxxx 是 AWS Lambda 上的函式名稱
export LAMBDA_FUNCTION_NAME=xxxxxxxxx

// ==== OR =====

make uploadlambda -e LAMBDA_FUNCTION_NAME=xxxxxxxxx
```

## Claudia.js

[claudia](https://claudiajs.com/) 這套的功能就是讓你發佈 node.js 專案到 AWS Lambda 用的，本身也提供了很多教學可以參考，[教學範例](https://claudiajs.com/tutorials/index.html):

* [INSTALLING AND CONFIGURING CLAUDIA.JS](https://claudiajs.com/tutorials/installing.html)
* [HELLO WORLD AWS LAMBDA FUNCTION](https://claudiajs.com/tutorials/hello-world-lambda.html)
* [HELLO WORLD FROM API GATEWAY](https://claudiajs.com/tutorials/hello-world-api-gateway.html)
* [HELLO WORLD CHAT-BOT USING LAMBDA](https://claudiajs.com/tutorials/hello-world-chatbot.html)
* [DEPLOYING A PROXY API](https://claudiajs.com/tutorials/deploying-proxy-api.html)

然而 claudia 的一些操作指令，可以直接看 [github](https://github.com/claudiajs/claudia) 上的[說明文件](https://github.com/claudiajs/claudia/tree/master/docs)，但是我實在不想花太多時間一個一個慢慢摸索，所以一樣是參考 aws-lambda-image 這專案的 package.json 檔案，然後也只用到兩個指令

* [create](https://github.com/claudiajs/claudia/blob/master/docs/create.md) : 建立專案使用的指令，不過由於目前的專案有很多設定，所以我選擇手動在 AWS Lambda console 介面建立好函示，並且把相關設定弄好
* [update](https://github.com/claudiajs/claudia/blob/master/docs/update.md) : 專案更新後，重新打包上傳用的指令


# 專案流程
因為這次專案的流程，是 Server 發生某些需要更新搜尋引擎資料的事件時，先將事件送到 AWS SQS，然後再透過 SQS 觸發 Lambda 來更新 ElasticSearch 的內容，但是因為 ElasticSearch 是在 VPC 的環境內，所以 lambda 也要跟著放到 VPC 下，而 lambda 在更新資料的時候，需要透過 API 來跟 ECS 的 server 要資料，雖然 ECS 跟 lambda 都同樣在 VPC 下，可是 lambda 無法透過 private ip 來存取 API，所以最後解法是讓 lambda 可以從 VPC 內存取外部網路來發送 API，取回所需資料處理後再寫入 ElasticSearch 內。

這麼說完好像是個很複雜的流程，不過大致上畫一下流程就如下圖。

![專案流程SQS_Lambda_ES](/images/AWS/SQS_Lambda_Flow.png)

# Lambda在VPC內存取網路

前面鋪成了這麼多，現在才要進入這次寫 blog 的重點，當初也是因為要處理這個流程，花了很久的時間才知道問題，然後才開始找這個方法。其實網路上已經有 AWS 專人教學的文章了，不過我還是想自己在寫一次，以我能理解的方式。

參考教學：

* [How can I grant internet access to my VPC Lambda function?](https://aws.amazon.com/premiumsupport/knowledge-center/internet-access-lambda-function)
* [AWS Lambda: Enable Outgoing Internet Access within VPC](https://medium.com/@philippholly/aws-lambda-enable-outgoing-internet-access-within-vpc-8dd250e11e12)

第一篇文章裡面還有精美的影片講解，我想英文跟我一樣不好的人，在看完教學影片，應該也要理解個80%了。根據我實作的結論，大概需要滿足底下這些條件

* Lambda 執行權限
  * Lambda 在 VPC 下的網際網路存取權限(Required)
  * Lambda 執行時寫入 cloudwatch log 的權限(Optional，不過一般專案建立都會有，這樣才能再 CloudWatch 下查看 log)
  * Lambda 接收 SQS message 的基本操作權限(非必要，只是因為我專案本身需要)
  * Lambda 在 VPC 內操作 ElasticSearch 的基本權限(非必要，只是因為我專案本身需要)
* Lambda 網路設定
  * 位於 VPC 內
  * 兩個私有子網路(Private Subnet)
  * 安全群組傳出規則(Outbound rules)，連接埠 : 全部, 目的地 : 0.0.0.0/0
* VPC 設定
  * 一個 Public Subnet
  * 兩個 Private Subnet
  * 兩個 Route table，一個與 Public Subnet 關聯，一個與兩個 Private Subnet 關聯
  * Route table(with Public Subnet) 連接 Internet Gateway
  * 替 Public Subnet 建立 NAT Gateway，並指定一組 Elastic IP
  * Route table(with Private Subnet) 連接 NAT Gateway


## VPC 設定步驟
底下的設定步驟，我只是照著[教學影片](https://youtu.be/JcRKdEP94jM)來說明，如果有誤，麻煩再指正，感謝！

### 建立三個 Subnet
建立三個 Subnet，一個用來連接外部 Internet，另外兩個為內部私有 Subnet
![建立三個 Subnet](/images/AWS/vpc_step1.png)

### 建立兩個 Route Table
建立兩個 route table，之後一個用來設定連外，一個則是用來設定連內部 subnet 以及橋接用
![建立兩個 Route Table](/images/AWS/vpc_step2.png)

### Route table 關聯 Public Subnet
將一個要設定外連規則的 route table 與 public subnet 關聯
![Route table 關聯 Public Subnet](/images/AWS/vpc_step3.png)

### Route table 關聯 Private Subnet
將另一個 route table 與兩個內部 subnet 關聯
![Route table 關聯 Private Subnet](/images/AWS/vpc_step4.png)

### 建立 Internet Gateway
建立 internet gateway 並與 VPC 關聯，這樣 VPC 才有外連的能力
![建立 Internet Gateway](/images/AWS/vpc_step5.png)

### 設定 Route table 外連規則
將建立好的 internet gateway 給要設定外連的 route table 來設定外連的規則

* 新增一個 route : `0.0.0.0/0 -> igw-xxxxx`

![設定 Route table 外連規則](/images/AWS/vpc_step6.png)

### 建立 NAT Gateway
建立 nat gateway 來橋接內部子網路與連外的子網路

* 建立時，選擇 public subnet
* 新增一個 Elastic IP (注意:每個 region 基本限制為五個 elastic ip)

![建立 NAT Gateway](/images/AWS/vpc_step7.png)

### 設定 Route table 橋接規則
替關聯內部 subnet 的 route table 增加規則

* 新增一個 route : `0.0.0.0/0 -> nat-xxxxxx`

![設定 Route table 橋接規則](/images/AWS/vpc_step8.png)

### IAM 建立 Lambda 執行權限
記得幫 Lambda 執行的角色增加 VPC 存取執行的權限

![IAM 建立 Lambda 執行權限](/images/AWS/vpc_step9.png)

### Lambda VPC 設定
回到 Lambda 內，檢查一下 VPC 的設定，選擇兩個 private subnet

![Lambda VPC 設定](/images/AWS/vpc_step10.png)

底下是我自己畫的架構圖，不過沒有很確定這樣畫是不是正確，如果有人發現錯誤，麻煩再幫我指正，感謝！

![Lambda於VPC內外連架構](/images/AWS/Lambda_VPC_Internet.png)

最後這些都做完後，可以利用底下的 code 檢查一下是否成功取得外部IP

````javascript
const http = require('http');

exports.handler = function(event, context, callback) {
  const option = {
    "hostname": "api.ipify.org",
    "path": "/?format=JSON",
    "method": "GET"
  };

  callback(null, Request(option).
    then((data) => {
      console.log('IP = ', data);
    }).catch((err) => {
      console.error(err);
    })
  );
};

function Request(options) {
  return new Promise((resolve, reject) => {
    const req = http.request(options, (res) => {
      let body = '';
      // console.log('Status:', res.statusCode);
      // console.log('Headers:', JSON.stringify(res.headers));
      res.setEncoding('utf8');
      res.on('data', (chunk) => body += chunk);
      res.on('end', () => {
        // console.log('Successfully processed HTTP response');
        // If we know it's JSON, parse it
        if (res.headers['content-type'] === 'application/json') {
            body = JSON.parse(body);
        }
        resolve(body);
      });
    });
    req.on('error', (err) => {
        reject(err);
    });
    req.write('');
    req.end();
  });
}
````