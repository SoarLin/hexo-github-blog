---
layout: post
title: Transcoding AWS S3 media files using AWS Lambda
author: Soar Lin
cdn: header-off
header-img: ''
date: 2016-09-11 14:37:23
tags:
 - s3
 - elastictranscoder
 - lambda
 - node.js
categories:
 - AWS
---
<!-- MarkdownTOC -->

- [需要工具](#需要工具)
- [參考文獻](#參考文獻)
- [操作步驟](#操作步驟)
    - [Step 1. Create Lambda function](#step-1-create-lambda-function)
    - [Step 2. Use example code](#step-2-use-example-code)
    - [Step 3. Setting event trigger](#step-3-setting-event-trigger)
    - [Step 4. Naming and setting role authority](#step-4-naming-and-setting-role-authority)
    - [Step 5. Check setting](#step-5-check-setting)
- [Lambda 使用方法](#lambda-使用方法)

<!-- /MarkdownTOC -->

最近因為工作上的需求，需要把影片檔案轉換成串流的格式，還好有想到去年似乎有參加一場 AWS 開發者大會聽到類似這樣的技術，這樣就不用自己很辛苦的架設一台 Streaming Server 了，但是缺點就是當 AWS 的服務用的越爽，就會被 AWS 給綁架，以後沒 AWS 可以用怎麼辦！！！

<!-- more -->

<a name="需要工具"></a>
## 需要工具

整個作法其實不算很複雜，但是必須先理解滿多服務如何使用，這裡大致上會使用到的 AWS 服務項目有：S3, Elastic Transcoder, Lambda。

 - S3 : 儲存空間
 - Elastic Transcoder : 轉檔服務，可將 S3 上的影音檔轉成各種格式
 - Lambda : 類似可自行撰寫的 API，來完成一些制式的工作項目

首先，需自行花點時間了解 Elastic Transcoder 的操作與使用，這部份可自行上網找尋相關資訊，或參考[這篇](https://foliovision.com/player/video-hosting/securing-your-video/hls-stream)。

如果 Elastic Transcoder 都已經了解怎麼操作，就算是已經理解這像轉檔服務的使用方式，接著就是透過 Lambda 的方式將這些工作自動化，所以接下來的重頭戲就是如何撰寫 Lambda 的 function 了，沒記錯的話，目前提供三種語法來撰寫，有 Python、Node.js、Java 三種，就請大家找個自己最熟悉或擅長的程式語言吧！

底下我會以 Node.js 的語法來當範例，因為 Python 跟 Java 都很不熟，node.js 至少算是 javascript 的好親戚，平時多少有再寫。

<a name="參考文獻"></a>
## 參考文獻

先附上個人參考文獻，其實能力好的，看完這兩篇，大概也不用我多廢話了

 - [Using AWS Lambda for Web Video Transcoding](https://tonym.us/using-aws-lambda-for-web-video-transcoding.html)
 - [Automating Transcoding using AWS service (Elastic Transcoder , Lambda, S3 notifications)](https://axcessblog.wordpress.com/2015/09/21/automating-transcoding-using-aws-service-elastic-transcoder-lambda-s3-notifications/)

<a name="操作步驟"></a>
## 操作步驟
底下先來看圖說故事，先到 AWS Lambda 內去建立一個 function，內容是由 S3 bucket 內特定資料夾(video/)內，建立(新增/上傳)了一個 mp4 檔案時，所觸發的條件。

<a name="step-1-create-lambda-function"></a>
### Step 1. Create Lambda function

![Create Lambda function](/images/Transcoding-AWS-S3-media-files-using-AWS-Lambda/step1.jpg)

<a name="step-2-use-example-code"></a>
### Step 2. Use example code

有範例程式就選來用吧！不然就得自己從頭寫，挺麻煩的
![Use example code](/images/Transcoding-AWS-S3-media-files-using-AWS-Lambda/step2.jpg)

<a name="step-3-setting-event-trigger"></a>
### Step 3. Setting event trigger

確定好觸發 Lambda 的條件設定
![Setting event trigger](/images/Transcoding-AWS-S3-media-files-using-AWS-Lambda/step3.jpg)

<a name="step-4-naming-and-setting-role-authority"></a>
### Step 4. Naming and setting role authority

命名以及設定執行 Lambda 的角色權限
![Naming and setting role authority](/images/Transcoding-AWS-S3-media-files-using-AWS-Lambda/step4-1.jpg) ![Naming and setting role authority](/images/Transcoding-AWS-S3-media-files-using-AWS-Lambda/step4-2.jpg)

在此提供該角色權限的 Policy

````javascript
{
    "Version": "2012-10-17",
    "Statement": [
        {
            "Effect": "Allow",
            "Action": [
                "logs:CreateLogGroup",
                "logs:CreateLogStream",
                "logs:PutLogEvents"
            ],
            "Resource": "arn:aws:logs:*:*:*"
        },
        {
            "Effect": "Allow",
            "Action": [
                "s3:GetObject",
                "s3:PutObject"
            ],
            "Resource": [
                "arn:aws:s3:::*"
            ]
        },
        {
            "Sid": "Stmt1441234334958",
            "Action": [
                "elastictranscoder:CreateJob"
            ],
            "Effect": "Allow",
            "Resource": "*"
        }
    ]
}
````

<a name="step-5-check-setting"></a>
### Step 5. Check setting

檢查一下所有的設定，沒問題就繼續了！
![Check setting](/images/Transcoding-AWS-S3-media-files-using-AWS-Lambda/step5.jpg)

<a name="lambda-使用方法"></a>
## Lambda 使用方法

畫面截圖後簡單說明
![Lambda-use-1](/images/Transcoding-AWS-S3-media-files-using-AWS-Lambda/lambda1.jpg)

測試檔的用法

 1. 左上角的 Action -> Configure test event
 2. 然後選澤 S3 Put 的範例來修改，進行測試
 3. 請到 S3 上找個檔案來比對修改測試檔範例，改好後測試的結果應該如上一張圖。

![Lambda-use-2](/images/Transcoding-AWS-S3-media-files-using-AWS-Lambda/lambda2.jpg) ![Lambda-use-3](/images/Transcoding-AWS-S3-media-files-using-AWS-Lambda/lambda3.jpg)

再熟悉 lambda 的使用方式後，就可以開始撰寫轉檔的部份了，其實就是再 S3 上傳 mp4 檔後，建立一個 __Elastic Transcoder__ 的工作來進行轉檔

````javascript
console.log('Loading function');
var AWS = require('aws-sdk');
var s3 = new AWS.S3({ apiVersion: '2006-03-01' });
var eltr = new AWS.ElasticTranscoder({
    apiVersion: '2012-09-25',
    region: 'ap-northeast-1'
});
var pipelineId = '1453215075XXX-XXXXXX';  // please use your pipeline id
// System preset: HLS 1.5M
var preset_HLS_15M  = '1351620000001-200020';
// return basename without extension
function basename(path) {
   return path.split('/').reverse()[0].split('.')[0];
}
exports.handler = function(event, context) {
    var bucket = event.Records[0].s3.bucket.name;
    var key    = event.Records[0].s3.object.key;
    var params = {
        Bucket: bucket,
        Key: key
    };
    s3.getObject(params, function(err, data) {
        if (err) {
            console.log(err);
            var message = "Error getting object " + key + " from bucket " + bucket +
                ". Make sure they exist and your bucket is in the same region as this function.";
            console.log(message);
            context.fail(message);
        } else {
            /* Below section can be used if you want to put any check based on metadata */
            if (data.ContentType == 'video/mp4') {
                console.log('Found new video: ' + key + ', sending to ET');
                sendVideoToET(key, context);
            } else {
                console.log('Upload ' + key + 'was not video');
                console.log(JSON.stringify(data.Metadata));
                context.fail();
            }
        }
    });
};
function sendVideoToET(key, context) {
    var params = {
        PipelineId: pipelineId,
        OutputKeyPrefix: null,
        Input: {
            Key: key,
            FrameRate: 'auto',
            Resolution: 'auto',
            AspectRatio: 'auto',
            Interlaced: 'auto',
            Container: 'auto'
        },
        Output: {
            Key: 'stream/' + basename(key),
            ThumbnailPattern: 'stream-thumb/' + basename(key) + '-thumb-{count}',
            PresetId: preset_HLS_15M,
            Rotate: 'auto',
            SegmentDuration: "10"
        }
    };
    eltr.createJob(params, function(err, data) {
        if (err) {
            console.log(err, err.stack); // an error occurred
            context.fail();
        }else {
            console.log("Create Job Success");
            context.succeed();
        }
    });
}
````

先到自己 S3 bucket 上建立 video 目錄，然後傳個 mp4 擋上去，接著修改一下 test configure 的內容，使用剛剛傳上去的 mp4 檔來測試，當測試成功後，再回到 S3 bucket 內，應該就可以看到轉出來的檔案在 stream 目錄下，以及縮圖在 stream-thumb 下