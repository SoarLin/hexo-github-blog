---
layout: post
title: Build a Serverless Facebook Messenger Chatbot
author: Soar Lin
cdn: header-off
header-img: ''
date: 2016-10-07 13:49:37
tags:
  - lambda
  - serverless
  - apigateway
  - webhook
  - facebook
  - messenger
categories:
  - AWS
---
<!-- MarkdownTOC -->

- [Build a Serverless Facebook Messenger Chatbot](#build-a-serverless-facebook-messenger-chatbot)
  - [準備工具與服務](#準備工具與服務)
    - [安裝 Serverless Framework](#安裝-serverless-framework)
    - [AWS 前置作業 - IAM](#aws-前置作業---iam)
    - [Facebook 前置作業](#facebook-前置作業)
  - [建立 Serverless 專案](#建立-serverless-專案)
  - [Serverless 環境設定](#serverless-環境設定)
  - [Functoin 參考](#functoin-參考)
  - [AWS 上服務檢查](#aws-上服務檢查)
    - [API Gateway 設定確認](#api-gateway-設定確認)
    - [Lambda 確認](#lambda-確認)
  - [FB Page Webhook Setting](#fb-page-webhook-setting)
- [Refrence](#refrence)

<!-- /MarkdownTOC -->


<a name="build-a-serverless-facebook-messenger-chatbot"></a>
# Build a Serverless Facebook Messenger Chatbot

<a name="準備工具與服務"></a>
## 準備工具與服務

* Serverless Framework (I use v1.0-rc1)
* AWS Account
* Facebook Page
* Facebook Developer

<!-- more -->

<a name="安裝-serverless-framework"></a>
### 安裝 Serverless Framework
serverless 目前(2016/10/06)的版本是 v1.0 rc1，過去在網路上找到的教學文都是 v.0.5.許多，從 JSON 格式轉換成 YAML 格式，這部份搞了我很久，加上一些變數設定等，花了一兩天在摸索。

Serverless Framework 安裝指令如下：

````
npm install -g serverless
````
這裡說明一下 Serverless framework 大致上需要以及會使用到的 AWS 服務項目

- IAM : 權限管理，讓本機端寫好的東西可以部屬到 AWS 各項資源與服務上的權限
- CloudFormation : AWS 資源與各項服務配置的模版，目前 v1.0 版改用 YAML 格式
- S3 : 資料儲存空間，存放 coludformation 模板與發布的 function + libraries zip檔的地方
- Lambda : 在接收某些觸發條件後執行邏輯運算功能的服務，也就是用來執行聊天機器人的功能
- API Gateway : 用來管理後台 Server or Lambda 等的 API 接口服務，這裡是用來觸發 Lambda function 執行運算
- CloudWatch : 可以檢視 Lambda 上 Function 執行時所留下的 log，協助開發中 Debug 使用

<a name="aws-前置作業---iam"></a>
### AWS 前置作業 - IAM
如果已經有安裝 AWS 提供的 command line tool ([aws-cli](https://aws.amazon.com/tw/cli/))，可能會方便一點？沒有也沒關係，因為我也是到 aws console 介面上慢慢做的

#### 建立 IAM user 並給予權限 ([教學](https://github.com/serverless/serverless/blob/master/docs/02-providers/aws/01-setup.md#amazon-web-services))
1. 在 AWS Console 介面，在進入 IAM 介面
2. 建立使用者，命名 serverless-admin
3. 記下 Access Key Id 與 Secret Access Key，或把檔案也下載下來
4. 添加 AdministratorAccess 權限

![IAM-1](/images/serverless/IAM-1.jpg)
![IAM-1](/images/serverless/IAM-2.jpg)


#### 在本機設定 AWS API Key & Secret

````
export AWS_ACCESS_KEY_ID=<key>
export AWS_SECRET_ACCESS_KEY=<secret>
````
或者使用 aws-cli 來設定 aws config

````
$ aws configure
AWS Access Key ID [None]: <key>
AWS Secret Access Key [None]: <secret>
Default region name [None]: ap-northeast-1
Default output format [None]: ENTER
````

<a name="facebook-前置作業"></a>
### Facebook 前置作業

#### 建立 facebook 粉絲專頁
為了測試聊天機器人，在臉書建立一個粉絲專業吧！
所以這邊就不在針對這部份寫教學了



<a name="建立-facevook-application"></a>
#### 建立 facevook application

1. 進入 Facebook Developer 建立一個新的 APP
2. 替這個 APP 加入 Messenger 這項產品

![Create FB Page](/images/serverless/fb-page1.png)![Add Messenger](/images/serverless/fb-page2.png)

<a name="建立-serverless-專案"></a>
## 建立 Serverless 專案

因為使用到 Lambda，所以有 Node.js, Python, Java 等樣板可以選擇，這裡使用 Node.js 來做示範(小弟不才，雖然 nodejs 也不熟，但另外兩種語言更是悲劇)

建立專案指令：(使用 Node.js 樣板)

````
# 採用 nodejs 基本模板, 並將專案建立在 sls-fb-msg-bot 目錄下
serverless create --template aws-nodejs --path sls-fb-msg-bot
````

完成這建立專案指令後，應該會建立好指定的目錄名稱，並且在裡面產生三個檔案，結構如下：

````
sls-fb-msg-bot
├── event.json
├── handler.js
└── serverless.yml
````

<a name="serverless-環境設定"></a>
## Serverless 環境設定

可以參考我的範例 ([github](https://github.com/SoarLin/serverless-fb-messenger-bot))，這裡需要安裝一些必要的套件


#### npm 套件安裝

````
npm init
# 經過一連串的 enter，產生 package.json 後，繼續安裝套件
npm install --save lodash request serverless-plugin-stage-variables

````

而 serverless 的環境設定 yml 檔，參考如下：

````
service: sls-fb-msg-bot

provider:
  name: aws
  runtime: nodejs4.3

  # You can change your stage and aws region
  stage: dev
  region: ap-northeast-1

functions:
  webhook:
    handler: handler.webhook
    events:
      - http:
          path: webhook
          method: GET
      - http:
          path: webhook
          method: POST
          response:
            template: '{ "body": "$input.json(''$'')" }'

custom:
  stageVariables:

    # Remeber to setting your variables
    pageAccessToken: 'FB_Page_Access_Token'
    validationToken: 'Your_Validation_Token'

plugins:
  - serverless-plugin-stage-variables
````

__注意1:__ stage 與 region 請改成自己需要的內容，這邊設定是發佈到日本東京的機房

__注意2:__ FB_Page_Access_Token 請開啟 fb developer app，在 Messenger 的 Setting 中的 「Token Generation」內選好粉絲專頁來產生

![Page Access Token](/images/serverless/fb-page-access-token.png)

__注意3:__ Your_Validation_Token 是 FB 要與 webhook API 溝通時的驗證碼，設定一個自己喜歡的密碼，這裡會與 FB_Page_Access_Token 都寫入 API Gateway Stages 內的 Stage Variables，之後再透過 Lambda 撈出來

![Verify Token](/images/serverless/FB-APIGateway.jpg)


<a name="functoin-參考"></a>
## Functoin 參考

serverless.yml 的設定都搞定後，剩下的就是 handle.js 這個用來執行邏輯運算的功能程式了，我得先承認我是到處參考東拼西湊出來的程式碼，所以真的就參考就好。

想了解更詳細 [Messenger API](https://developers.facebook.com/docs/messenger-platform)，麻煩還是到 Facebook 所提供的[文件](https://developers.facebook.com/docs/messenger-platform)去研究吧！這裡僅節錄部分程式碼並在稍微精簡一些(有可能無法實行)，正確完成內容還是請到我的 [github](https://github.com/SoarLin/serverless-fb-messenger-bot) 上去參考

````javascript
'use strict';

const request = require('request');

function sendTextMessage(recipientId, messageText) {
    return {
        recipient: { id: recipientId },
        message: { text: messageText }
    };
}

function display(object) {
    return JSON.stringify(object, null, 2);
}

module.exports.webhook = (event, context, callback) => {
    console.log('Event: ', display(event));

    // FB Page access token
    const PAGE_ACCESS_TOKEN = event.stageVariables.pageAccessToken;
    // FB webhook validation token
    const VALIDATION_TOKEN = event.stageVariables.validationToken;

    if (!VALIDATION_TOKEN) {
        console.error("Missing validation token");
        context.fail(new Error('Missing validation token'));
    }

    function callSendAPI(messageData) {
        request({
            uri: 'https://graph.facebook.com/v2.6/me/messages',
            qs: { access_token: PAGE_ACCESS_TOKEN },
            method: 'POST',
            json: messageData
        }, (error, response, body) => {
            if (!error && response.statusCode == 200) {
                context.succeed("Successfully");
            } else {
                context.fail(new Error('Failed Send API'));
            }
        });
    }

    if (event.method === "GET") {
        let query = event.query;
        if (query['hub.mode'] === 'subscribe' &&
            query['hub.verify_token'] === VALIDATION_TOKEN) {
            console.log("Validating webhook");
            context.succeed(parseInt(query['hub.challenge']));
        } else {
            context.fail(new Error('[403] Failed validation.'));
        }
    }
    else if (event.method === "POST") {
        var data = event.body;
        if (data.object == 'page') {
            var messagingList = data.entry[0].messaging;
            var messageData;

            messagingList.forEach(function(messagingEvent) {
                var senderId = messagingEvent.sender.id;
                if (messagingEvent.message) {
                    // Received user message
                    messageData = sendTextMessage(senderId, "Hello, I am messenger bot");
                } else {
                    messageData = sendTextMessage(senderId, "Webhook received other messagingEvent");
                }
                callSendAPI(messageData);
            });
        }
    } else {
        context.fail(new Error('Unrecognized method "' + event.method + '"'))
    }
};
````

到了這邊，大致上 serverless 的設置都完成了，總算可以發佈到 AWS 上啦！

````
serverless deploy
````

<a name="aws-上服務檢查"></a>
## AWS 上服務檢查

<a name="api-gateway-設定確認"></a>
### API Gateway 設定確認

首先檢查一下設定檔內寫的 State Variables 有沒有正確的被設定好

![API Gateway-1](/images/serverless/API-Gateway1.png)

接著檢查 Get Method 中的 request template，這邊原本沒有設定，但應該會有圖中的預設樣板 code

![API Gateway-2](/images/serverless/API-Gateway2.png)

然後再檢查 Post Method 中的 response template 是否有設定檔內寫的內容，如下圖

![API Gateway-3](/images/serverless/API-Gateway3.png)


<a name="lambda-確認"></a>
### Lambda 確認

應該可以順利產生一組 function 命名格式為 `<service_name>-<stage>-<function_name>`，這裡的例子是 sls-fb-msg-bot-dev-webhook

![Lambda Function](/images/serverless/lambda.png)

#### FB 連結 Webhook 測試(GET)

可以參考下面範例:

 - __hub.verify_token__ 與 __validationToken__ 記得設成一樣
 - __hub.challenge__ 是由 FB 驗證時傳過來的一組數值，自行測試時隨便打都可以
 - __pageAccessToken__ 記得填入 FB 產生的粉絲專頁存取權杖


````json
{
  "body": {},
  "method": "GET",
  "stage": "dev",
  "query": {
        "hub.mode": "subscribe",
        "hub.challenge": "29606336",
        "hub.verify_token": "Your_Validation_Token"
  },
  "stageVariables": {
    "validationToken": "Your_Validation_Token",
    "pageAccessToken": "FB_Page_Access_Token"
  }
}
````

#### Messenger Bot 接收訊息測試(POST)

一樣參考下方的範例：

````json
{
    "body": {
        "object": "page",
        "entry": [
            {
                "messaging": [
                    {
                        "sender": {
                            "id": "<Your_Facebook_Id>"
                        },
                        "message": {
                            "text": "test"
                        }
                    }
                ]
            }
        ]
    },
    "method": "POST",
    "stage": "dev",
    "stageVariables": {
        "validationToken": "FB_Page_Access_Token",
        "pageAccessToken": "Your_Validation_Token"
    }
}
````

- __Your_Facebook_Id__ : 這個比較麻煩，可能得自己去 FB Developer 提供的 [Graph API Explorer](https://developers.facebook.com/tools/explorer/) 上面查詢
  - 先點下 Get Token, 然後直接確定
  - 接著預設應該會取出用 user name 與 id，就可以得到自己的 id 了，參考下圖

![Graph API 1](/images/serverless/GraphAPIExplorer1.jpg)![Graph API 2](/images/serverless/GraphAPIExplorer2.png)


<a name="fb-page-webhook-setting"></a>
## FB Page Webhook Setting

總算快大功告成了，還記得之前一直有提到的 Your_Validation_Token 吧！在設定 webhook 時就會派上用場啦！

- 進入 facebook developer app 頁面
- 切換到 Messenger 產品分頁
- 點選 Setup Webhooks
- 接著填入 API Gateway endpoints 的 GET 網址與要跟程式驗證的內容
  - endpoints 網址在發佈時，會顯示在 terminal 上
  - 或是使用`serverless info`來檢視資訊
- 驗證通過後，記得在下方訂閱要執行 bot 的粉絲專頁

![Facebook Webhooks Setting](/images/serverless/fb-webhook.png)![Subscribe Page](/images/serverless/subscribe_page.png)

如果順利驗證通過，就可以開始跟機器人對話啦！

![Messenger Chat](/images/serverless/chat-sample.jpg)


<a name="refrence"></a>
# Refrence

[Serverless Framerowk](https://serverless.com)
[Serverless Github](https://github.com/serverless/serverless)
[實作 Serverless 的 facebook messenger bot](http://denny.qollie.com/2016/05/29/sls-fb-bot/)
[Building a Serverless Facebook messenger chatbot](http://justserverless.com/blog/building-a-serverless-facebook-messenger-chatbot/)
