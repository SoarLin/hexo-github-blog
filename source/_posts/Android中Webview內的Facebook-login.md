---
layout: post
title: Android 中 Webview 內的 Facebook login
author: Soar Lin
cdn: header-off
header-img: ''
date: 2017-07-02 22:10:01
tags:
  - facebook sdk
  - android
  - webview
categories:
  - PHP
---

# 前言

上週一一大早本來想說，好不容易完成多語系的初版，可以再稍微修改調整，準備上code來測試，誰知道突然來了個問題，原本以為這問題應該半天可以處理掉，誰知道竟然花了整整三天，真的改到好崩潰啊！

## 遇到的問題

目前正在開發的 mobile web 為了搭配某銀行的優惠活動，所以之前趕緊把整個購買流程跟會員登入的功能都補上去，結果請對方先行測試，果然都不會測試，等活動一上線才發現問題，問題就是 App 內開啟網頁後，facebook 登入的功能就...無效了！？

# 處理經過

## 嘗試一 - 手動建立登入流程

原本就是按照Facebook Developer內文件教學來撰寫的，但還是出問題，只好先暫時改用[Facebook登入](https://developers.facebook.com/docs/facebook-login)裡面的進階做法了，裡面有個[手動建立登入流程](https://developers.facebook.com/docs/facebook-login/manually-build-a-login-flow)，照著這個做法，把原本fb登入呼叫API的行爲替換成一個帶有回傳網址(redirect_uri)的連結。

不過很偷懶，回傳網址還是跟原本頁面一樣，只是在透過 js 把一些回傳參數接起來處理，另外也把一些對方反應我們提供的優惠怎麼只有新註冊會員才有，而原本我們服務的舊會員沒有享受到優惠這樣不行啦！所以除了改登入問題，順便偷渡了這個商業邏輯的處理上去。
<!-- more -->
**結果**
* iOS 裝置都可以正常登入啦！(撒花～)
* Android 裝置一樣毫無反應....Orz (哭哭)

## 嘗試二 - 獨立寫一個 FB callback 頁面

星期一的所有努力，遇到了 Android 還是無解，所以想說乖乖地另外寫一頁來接收 facebook callback 吧！當然也把授權的行為改到 PHP 端來處理，不過我又想偷吃步，把授權後的資料丟給 JS 再來完成後續的登入/註冊流程。這也不能怪我，原本 js 端把所有的註冊登入流程都寫好了，code 不拿來用真的很可惜啊！

**結果**
* iOS 裝置都可以正常登入啦！(撒花～)
* Android 裝置畫面跳轉了，但是....沒下文了 (哭哭)

## 嘗試三 - 克難的建立測試方式

因為只有 Android 裝置不行，而我本身也沒有 Android 的裝置可以測試，為了讓自己好測試 debug，所以出動了 [Genymotion 模擬器](https://www.genymotion.com/)，不得不說這個模擬器真的是之前試過可以在電腦內快速啟動的 Android 模擬器，要是用原本 Android Studio 裡另外安裝的模擬器，可能要跑到天荒地老了。

然後請同事幫忙開發一個只有 webview 的測試 APP，好讓我能夠隨時測試，雖然聽起來很美好，但是真的透過 Android Studio build code 然後在 install pkg 到模擬器內，這過程真的是很漫長，而且電腦會跑的很慢，風扇也會持續發出哀號，我難過啊～

但是暫時也只能先這樣進行，不過沒辦法在 app 內的 webview 看到 js 印出來的 console.log 真的非常難除錯，感覺都只能用猜的，不過後來去 google 了一下類似的問題，發現了幾行神奇的 sample code 就順手把它加到原本 android 那個精簡的測試 app 內，然後再重新 build，結果這次竟然就成功了！！

````
if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.LOLLIPOP) {
    CookieManager.getInstance().setAcceptThirdPartyCookies(myWebView, true);
}
````

後來查了一下，這是讓 webview 內的頁面能夠接受第三方寫入 cookie，也就是說 facebook js sdk 的登入流程中，會將一些必要的 cookie 寫到我的網站內，但是 Android APP 內的 webview 預設是不允許的，所以 facebook 登入才會一直失敗沒反應，也就是說原本寫好的登入流程，得全部改用 php 來重寫...崩潰！

## 嘗試四 - 使用 Facebook PHP SDK

最後真的沒其他招了，只好乖乖的去改用 PHP SDK 來撰寫這整段 facebook 登入註冊流程，然後順便把 fb 新註冊會員的資料確認頁面一起做好，雖然 android 的程式只要加個三行 code 就可以解決這個問題，但是日後可能還有其他合作夥伴，不可能要求每個廠商都把他們 android 的 app 重新 build 一版上架，而且還要對方的用戶都有更新才行，所以還是得自己來，只是內心都會想著「人家只要改個三行code就好了，可是我卻要改三天」，唉～

星期三花了一整天再改寫 PHP，到了下班前測了幾台 android 裝置，發現除了 android 7.0 以上的機器外，其他版本的 android 都正常了，這...到底該不該高興呢？抱著哀傷的心情先上一版 code 吧！至少可以先解決 android 7.0 版本以下的用戶，回家再來想想會是什麼問題。

## 嘗試五 - Facebook OAuth 重新導向 URI

回家的一路上，一直在思考，為何 Android 有的裝置跳轉網址還是會有問題，後來才想到原因應該是 Facebook OAuth 重新導向 URI 的白名單設定問題，其實原本的名單也不算有錯，只是我寫的是`https`的網址，但是在這幾天改寫手動登入流程的過程中，需要重組 callback uri，可是我自己本機開發時，抓到 server 的 port 都很正常是 443，但是 code 一到 server 上，會抓到 80 port，造成我一開始的重組的 redirect_uri 有問題，只好都改成寫死是`https`開頭的網址。

但是 facebook App 的登入設定內，OAuth redirect uri 卻不能寫死`https`，必須改成`http`才能正常運作，我實在搞不懂這到底是什麼道理啊！！！！！

只能推測目前公司的 server 都是架設在 ELB 後面，而是透過 ELB 來做 port forward，所以原本 server 不一定要強制將網頁導向 443 port，所以 php code 才會都抓到 80 port。

## 結論！能動最重要

因為我沒有管理 AWS 的權限，所以不太清楚 ELB 設定的如何，只能用推測的來猜想結論，反正自己的結論就是 code 裡面產生的 redirect_uri 一定要 https 開頭，但是 facebook app 設定一定要 http 開頭，然後就可以在這微妙的設定下達成平衡，程式就可以正常運作了～喔耶！