---
layout: post
title: Google Analytics與Facebook Pixel事件追蹤筆記
author: Soar Lin
cdn: header-off
header-img: 'https://soarlin.github.io/images/ga-fb.png'
date: 2017-09-02 16:00:20
tags:
  - google analytics
  - facebook pixel
  - tracking
categories:
  - Others
---

# Google Analytics

## 基本作法

每一頁都加上 pageview，這個真的太基本了，就不在浪費時間說明了

## 使用事件追蹤

事件追蹤主要分幾個參數可以使用

* Category
* Action
* Label
* Value (int, 可選擇)

下面用個簡單的例子說明，如果想要對用戶登入、註冊進行事件追蹤，大概可以這樣設計

|   說明    |  Category  |  Action   |   Label    |
| -------- |:----------:|:----------:| ---------- |
| Email登入 |  Login    |  Click    | Email_Login |
| Facebook登入 | Login  |  Click   | Facebook_Login |
| Email註冊    | Register|  Click  | Email_Register |
| Facebook註冊 | Register|  Click  | Facebook_Register |

JavaScript 程式碼說明，也可以看 [Google Analytics的教學文件](https://developers.google.com/analytics/devguides/collection/analyticsjs/events)
<!-- more -->
````
ga('send', 'event', [eventCategory], [eventAction], [eventLabel], [eventValue], [fieldsObject]);
````

## 設定目標

GA增加目標，可以用來驗證 AdWords 廣告成果轉換率，以及在「轉換」頁籤中的分析統計資料

目標設定的方式有四種，這裡只介紹有用過的兩種，一種是針對頁面來設定，一種是針對事件

### 針對頁面設定目標

決定好目標頁面
填寫連結目標頁面網址，記得用反斜線`/`開頭，可以用以下三種方法
* 完全相等的網址(e.g. `/payment/product-123`)
* 開始路徑一樣(e.g. `/payment/product-`)
* 正規表示式的網址寫法(e.g. `/payment/product-[0-9]+`)
如果需要先經過其他頁面，再到目標頁面，才算完成目標的話，再將需要先經過的頁面寫上

例如：目標是「進入商品購買頁面」，需要先經過商品頁面瀏覽，就記得在開啟「程序」，然後步驟內填上畫面網址

### 針對事件設定目標

將目標的事件先加入追蹤，假定目標為成功登入的事件
進入目標詳情裡面的設定，記得跟當初事件追蹤用的 Category, Action, Label, Value(如果有的話)
* 類別 = Login
* 動作 = Click
* 標籤 = Email_Login
* 價值 (X) 不設定

**使用事件價值做為這項轉換的目標價值**，這個意思是說如果事件本身有設定價值，可以用來當成這次目標達成的價值，不然可以自己設定一個金額，但不是每個目標都有價值，所以見仁見智了

### 驗證目標

這個步驟非常重要，當 GA 放置一段時間後，開始有資料統計後，再來設定目標會比較準確，因為可以透過驗證剛剛設定的目標，檢查是否到目前為止有出現過你想追蹤的目標，如果驗證的結果 > 0.0%，就表示你設定沒錯啦！不然可能就是設定出問題或這目標在先前的統計資料裡還沒有資訊。

## 電子商務追蹤

這個追蹤肯定沒有自己的後台訂單追蹤來的準確，畢竟很容易遇到消費者退訂、取消訂單之類的，所以加入這個追蹤只能當作是參考用，應該會超過 87% 的程度與實際相符。

使用方式：

開始結帳的時候，先在頁面加入
````
ga('require', 'ecommerce');
````

當商品加入購物車時可加入，如果是單一商品結帳畫面，可以再填寫結帳資訊時加入
````
ga('ecommerce:addItem', {
  'id': 訂單ID,
  'sku': 商品ID,
  'name': 商店名稱-商品名稱,
  'category': 商品分類,
  'price': 訂單價格,
  'quantity': '1',
  'currency': 幣別(e.g. TWD, HKD..)
});
````

交易(付款)成功時，加入
````
ga('ecommerce:addTransaction', {
    'id'         : 訂單ID or 商品ID,
    'affiliation': 商店名稱,
    'revenue'    : 訂單價格,
    'currency'   : 幣別
});
ga('ecommerce:send');
````

若中途返回，訂單要釋放時
````
ga('ecommerce:clear');
````

# Facebook Pixel Tracking

基本的像素追蹤，也是每頁加入 PageView 事件(注意大小寫，與GA不同)
Chrome 擴充套件 **Facebook Pixel Helper **可以檢查

## 事件

已經定義9種標準事件，大致上已經夠用，可再自行增加事件定義，以下是以目前工作上使用的紀錄為例

|    說明  |   Event Name  |  參數 | 備註   |
| -------- |:----------:|:----------:| ---------- |
|完成註冊  |CompleteRegistration |      |       |
|使用關鍵字搜尋時|Search| search_string| |
|進入商品頁面|ViewContent|value, currency, content_name, content_type, content_ids| 動態商品廣告中用到，必要參數 content_ids 與 content_type|
|進入預訂享樂流程| InitiateCheckout|  content_type, content_ids, content_name| |
|進入信用卡頁面| AddToCart|value, currency, content_name, content_type, content_ids|  動態商品廣告中用到，必要參數 content_ids 與 content_type|
|新增信用卡資料|  AddPaymentInfo|  value, currency, content_name, content_ids| |
|訂單交易成功 | Purchase |value, currency, content_name, content_type, content_ids | 動態商品廣告中用到，必要參數 content_ids 與 content_type |

ViewContent 範例 :
````
fbq('track', 'ViewContent', {
  content_type: 'product',// 固定名稱為 product
  content_ids: ['204'],   // product_id, array
  content_name: '店家名稱-商品名稱',
  value: 13,              // 價格,integer
  currency: 'TWD'
});
````

AddToCart 範例 :
````
fbq('track', 'AddToCart', {
    content_type: 'product',
    content_ids: ['204'],
    content_name: '店家名稱-商品名稱',
    value: 68,
    currency: 'TWD'
});
````

Purchase 範例 :
````
fbq('track', 'Purchase', {
    value: 68,
    currency: 'TWD',
    content_type: 'product',
    content_ids: ['204'],
    content_name: '店家名稱-商品名稱'
});
````

其實 FB Pixel 還有其他用途，算是用在商品目錄上，讓公司可以針對客戶再行銷使用

使用情境像是，顧客A到網站上瀏覽了類別①的商品，也將商品加入購物車，但最後卻沒有完成結帳。

這樣是不是很可惜，沒有好好把握到這位顧客，所以FB可已讓妳投廣告的時候打到精準的客戶，讓他再重新看到這項商品，溝引起他想買的慾望。有時候一次購買需要2~3次的推波助瀾才會成功，而FB的再行銷就可以在這邊用上，只是這個過程有點複雜，日後再補上另一篇詳細一點的介紹吧！
(如果有人需要的話..XD，根據這網站的流量，我猜應該是沒人需要)
