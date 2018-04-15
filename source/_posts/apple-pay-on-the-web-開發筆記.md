---
layout: post
title: Apple Pay on the Web 開發筆記
author: Soar Lin
cdn: header-off
header-img: 'https://soarlin.github.io/images/ApplePayOnTheWeb.png'
date: 2018-03-10 20:44:18
tags:
  - applepay
  - safari
  - mac
  - iphone
categories:
  - Frontend
---


已經不想去算到底多久沒有更新 Blog 了，因為最近幾個月實在沒什麼梗，不過這也算是好事吧！感覺起來似乎比較輕鬆些？其實也沒有比較輕鬆，前陣子還得趕鴨子上架，把剛摸沒多久的 Go lang 直接投入在新版後台開發上，想想都覺得很抖～～

從去年進公司以來，一開始就先著手開發的商品預訂流程，想當初花了一個半月，直接用 vue 2.x + vuex + vue-router 真的很敢，結果就是後來陸續要針對預訂流程做調整，就得再回顧之前一開始寫的 code，也不能說看得很痛苦，但是...看著好幾個月前寫的東西，總是在陌生與痛苦間徘徊。

最近一次的調整除了把註冊登入的流程提早了一個步驟，還要在原本的信用卡付款金流外，陸續增加 Apple Pay 與 Line Pay，真是令人感到刺激，雖然自己在做之前覺得這功能做好後的實用性遠小於噱頭性質，不過既然決定要做，那就認真做吧！順便多學一些東西。

不過這次串接的好處是，我們原先就透過 TayPay 這第三方金流服務，所以 TayPay 已經把 Apple Pay 與 Line Pay 都串接了，我們直接沿用原本的套件就可以繼續開發，當然後端 API 間處理還是得自己來，但由於是另一個同事負責的，就不在這次的討論範圍了。

廢話了那麼多，要進入正題了，接下來開始記錄這次耗時約一週才搞定的 Apple Pay，應該不是我能力太廢，是真的一路走來踩了好多雷，所以才要發文紀錄一下，讓自己日後可以回味。

# 環境設定

有在 iPhone 上用過 Apple Pay 的人都應該知道，手機會彈出一個驗證指紋的付款畫面，可是用網頁要怎麼驗證指紋，所以要使用 Apple Pay on the Web 有一些先天限制條件。

* 持有 iPhone 且作業系統版本需要 `iOS 10 以上`的版本
* 使用 Mac 電腦且作業系統版本需要 `macOS 10.12 以上`，當然也得用 Safari 瀏覽器

另外就是 Server 本身除了要支援 HTTPS 外，還要有合法的 SSL 憑證，關於 Server 設定可以看 [Apple 官方文件](https://developer.apple.com/documentation/applepayjs/setting_up_your_server)

### 踩雷1

所以想在本機開發，馬上就遇到了問題，雖然 TayPay 建議使用 [ngrok](https://ngrok.com/) ([TayPay寫的教學](https://medium.com/tappay/ngrok-connect-to-your-localhost-c6f3ba84525b))，就可以透過 ngrok 服務產生的臨時網址來讓支援 SSL 來使用 Apple Pay，可是在實際摸索後，Apple 似乎不認為這服務產生的憑證是可信任的，一直噴出連線的憑證是 `untrusted`

由於無法在本機端開發，更不可能讓我在 production 的機器上開發，只好到測試(stage)的機器上開發了，不過公司使用的 stage server，遠在 AWS 美西的機房內，而且主機等級還是 micro，除了連線過去的延遲時間很嚴重，主機本身運作起來也不快，但也沒辦法了，硬著頭皮上嘍！

# Server domain 驗證

### 踩雷2

由於是測試機的環境，所以有連線上的限制，某天早上一早到公司，就先連到 AWS 上把 EC2 的 security 限制開啟 443 port 可以讓 Apple Pay 的主機連進來，然而得先在 Apple Developer 將 domain 加入且驗證通過，但是照著 Apple 文件內把所有可能的主機 IP 都加入白名單了，可是試了很久怎麼都驗證不過，一直顯示 domain 驗證失敗，WTF!

後來等另一位同事來了，跟他說了這樣的情況，他就建議暫時把 stage server 的 443 都對外開放試試看，果然這次出現了另一個錯誤訊息，這次的錯誤是說驗證的檔案已經過期，噗～原來 Apple 真的很嚴格，連給驗證用的檔案都有時效性，雖然只是重新下載新的驗證檔上傳，還是得先經過 Jenkins 在發布實在有點麻煩。

這次總算可以驗證過了，經過這次的教訓我學到了一點，Apple 官方文件提供的 `Apple Pay Server IP，跟他要來驗證 domain 的主機肯定是他媽不同 IP`，這真的太陰險了，文件裡面寫那麼多廢話，卻沒說明驗證的主機 IP 是啥。


接下來又花了不少時間，把 stage 環境安裝 vim, git, composer, npm ... 等工具，然後再把目前開發的 code pull 下來，重新把開發中的版本環境搞定，apache 的 web 目錄設定也指向這暫時的開發目錄，因為開發時期會透過 watch 工具，每次存檔後讓 js 重新編譯，當真的要在上面開發修改程式的時候發現，vim 裡面光是讓游標移動就要等待一段時間，更不用提真的 coding 的時候有多不順暢就好，每次存檔後重新編譯 js 檔要等待的時間也很難預測，順利的話可以在三秒內重新編譯，運氣不好的話可能上個廁所回來還沒重新編譯，我真的被搞到快崩潰了。

後來沒辦法只好儘可能地把相關文件閱讀過，將可能執行的流程都先在本機寫好，可能會出現的狀況都盡量印出 log，接著再重新 push commit，再去 stage 上 pull 下來測試。

# 瀏覽器檢測

一開始就說了想在網頁上執行 Apple Pay 有一些限制的條件，所以 [Apple 文件](https://developer.apple.com/documentation/applepayjs/checking_for_apple_pay_availability)也有提供一些檢測的方式，最基本檢查瀏覽器是否支援，如：

```javascript
if (window.ApplePaySession) {
   // The Apple Pay JS API is available...
}
```

接著再檢查是否真的可用 Apple Pay，這會去檢查是否有可用卡片，有的話顯示 Apple Pay 按鈕

```javascript
if (window.ApplePaySession) {
   var merchantIdentifier = 'example.com.store';
   var promise = ApplePaySession.canMakePaymentsWithActiveCard(merchantIdentifier);
   promise.then(function (canMakePayments) {
      if (canMakePayments)
         // Display Apple Pay Buttons here…
}); }
```

### 踩雷3

但是在我前面花了這麼久的努力，把一切環境都弄好要測試時，發現怎麼都無法執行 TayPay 串接 Apple Pay 的 function，最後檢查了我跟同事的瀏覽器後，發現原來是我的瀏覽器沒有支援，明明一切條件都符合 Apple 自己要求的條件，電腦跟手機也都登入相同的 Apple ID，手機上的 Apple Pay 也有綁定信用卡，但是我的 Safari 瀏覽器就是不能用...Orz...

而同事的電腦也是一台可以，一台不行，雖然現在寫這篇文章的時候，我的 safari 好像也支援 Apple Pay 了，但是三天前到底發生甚麼狀況，我真的完全摸不著頭緒，唯一做的改變是，我昨天借用同事開發用的 Apple ID 登入自己電腦來測試 Apple Pay，然後在登出並登入回自己 Apple ID，神奇的事情就這麼發生了，贛！

所以前兩三天在開發的時候，除了大部分的 code 需要先在本機盲寫，再上到 stage 上進行測試跟小改動，還必須使用手機接著一條線到電腦，開啟 Safari 的網頁檢閱器，就是類似 Chrome 上的開發者工具一樣，但是卻難用 10 倍以上，真的開發的很艱辛！

# Apple Pay Payment Request

總算可以開始接近 Apple Pay 的核心了，目前總算可以進入到呼叫 Apple Pay 的階段了，可是在看過 TayPay 提供的文件，以及 [Apple 官方文件](https://developer.apple.com/documentation/applepayjs/creating_an_apple_pay_session)，大概理解需要提供一份資料後，來建立 Apple Pay Session，才會呼叫出 Apple Pay 的介面。

```javascript
var request = {
  countryCode: 'US',
  currencyCode: 'USD',
  supportedNetworks: ['visa', 'masterCard', 'amex', 'discover'],
  merchantCapabilities: ['supports3DS'],
  total: { label: 'Your Merchant Name', amount: '10.00' },
}
var session = new ApplePaySession(3, request);
```

好像很簡單麻～～～可是！要是這麼簡單，我就不用特地寫這篇文章來宣洩這一週的不快了，我左看右看，上看下看，完全沒寫錯，可是呼叫 TayPay 的 API 會沒反應，只好改用 [Apple Pay 提供的 sample code](https://developer.apple.com/library/content/samplecode/EmporiumWeb/Introduction/Intro.html#//apple_ref/doc/uid/TP40017557-Intro-DontLinkElementID_2) 來測試，怎麼試也都沒反應，到底發生什麼事啊！！！

### 踩雷4

雖然中途有看到噴出一個錯誤訊息，`「Must create a new ApplePaySession from a user gesture handler」`，但是一直沒有很在意他，後來真的沒招了才回頭來研究這問題，這個意思是呼叫 Apple Pay 必須是使用者操作的行為來產生，我就心想難不成你還能監視使用者事不是按了你們家規定的按鈕不成，後來跟同事討論了一下後想到，雖然我也是在使用者按下 Apple Pay(自家做)按鈕後才呼叫，不過礙於改版後的訂購流程，必須先建立訂單，然後才能呼叫 Apple Pay，該不會真的是因為這原因吧！

在跳過建立訂單的步驟後，我的手機畫面終於彈出 Apple Pay 的介面了，咁～我真的內牛滿面了，為了看到這個畫面我都已經跟你耗了三天多了，這麼一來訂購的流程肯定要再調整了，一想到這裡，不禁又要滴下男兒淚來。因為每次流程調整就要改很久，常常會再多出很多 garbage code，眼看著這天也快下班，把程式碼整理整理，在跟設計師約一下隔天討論流程的調整。唉～

隔天跟設計師討論目前這樣的結帳流程，無法在建立訂單的同時，馬上在呼叫 Apple Pay，必須在建立訂單後，重新計算台幣計價的金額，過渡一頁資料確認，再讓使用者按那顆黑黑的  Pay，才能順利叫出 Apple Pay 來付款。再討論好要調整的流程後，盡可能以修改最少的方式進行，也總算可以在一週的最後一天把整個流程都搞定。

這週扣掉週一下午處理別的問題，週二上午看醫生，串接 Line Pay 約一天，剩下的時間全都拿來跟 Apple Pay 耗了，接下來就是再多測試整個訂購流程了，希望可以在下週順利上線。


PS. 其實中途遇到的問題不只這些，光是一開始 Apple Developer 帳號就搞好久，原本有最高權限的主管好兒剛好離職，為了把 Merchant Identity Certificate 上傳也花了不少時間
