---
layout: post
title: Vue 專案搭配 Vuesax / Element UI 開發筆記
author: Soar Lin
cdn: header-off
header-img: ''
date: 2020-11-08 21:16:23
tags:
  - vuejs
  - element
  - vuesax
  - scss
categories:
  - Frontend
---

最近因為參加了公司舉辦的 hackathon，總算又有機會回來寫寫 Vue.js 了，太久沒寫真的生疏好多，加上最近 Angular 寫太多，再次回來寫 Vue 看到 .vue 檔裡面放著 template, script, style 覺得程式碼變得好長，不過好處是不用在 VSCode 裡面開一堆 .html, .ts, .scss 等檔案，透過 tab 找起檔案來會快一點點。

由於參加了兩組比賽，所以可以嘗試不同的東西，這次就找了兩套 UI Component 來搭配使用，一個是使用 [Vuesax](https://vuesax.com/)，另一個則是使用 [Element](https://element.eleme.io/)，先說結論吧！ Element 用起來比較舒服，除了文件有中文可以看，元件也比較多種可選擇。一開始選擇 Vuesax 時，覺得這套畫面感覺很生動，就選來試試看！但是遇到安裝了 3.x 版，卻找去 4.0 版的說明文件，結果一直覺得怪怪的，好一陣子後才發現。

不過 Vuesax 的 input 真的做得好精緻，除了有底線顏色、驗證狀態，還可以讓 placeholder 躍升變成 label，以及 checkbox 跟 switch 的一些畫面小動畫，感覺在表單製作上可以做得很精緻，在專案中用它建立了一個簡單的登入畫面覺得很滿意，可惜後來登入頁面被捨棄，沒辦法展現一下。不過實際上在使用 Vuesax 開發時，還是覺得看文件編開發卡卡的，可能還不太習慣用 UI Component 來開發吧！

後來另一個專案想說換一個玩看看，就選了 Element，發現這個真的好用很多，可能真的因為文件有中文的吧(先加100分)！實作上也覺得 Layout 跟 Container 比較快上手，也可能是經歷了之前一個套件的關係吧！而這次開發時，碰到了幾個小問題，一個是以前也碰過只是解法有點複雜的在 Vue 專案內讓每個元件可以引入共同的 SASS/SCSS 檔案，另一個則是因為用了 UI Component 後可能會遇到的問題，在寫 style 的時候，無法去客製化引用的 UI 元件，正確來說應該是寫的 css selector 無法複寫到元件內的樣式，底下就針對這兩個來記錄說明吧！

## 開發環境紀錄
* Node v12.18
* npm 6.14.6
* @vue/cli 4.5.6

## Import Sass/Scss files into Every Vue Component
參考文件 :
1. [How to Import a Sass File into Every Vue Component in an App](https://css-tricks.com/how-to-import-a-sass-file-into-every-vue-component-in-an-app/)
2. [Vue CLI 專案中引入 SCSS 檔案的四種方法，該如何使用呢？](https://medium.com/unalai/vue-%E5%B0%88%E6%A1%88%E4%B8%AD%E5%BC%95%E5%85%A5-scss-%E6%AA%94%E6%A1%88%E7%9A%84%E5%9B%9B%E7%A8%AE%E6%96%B9%E6%B3%95-%E8%A9%B2%E5%A6%82%E4%BD%95%E4%BD%BF%E7%94%A8%E5%91%A2-9babcd3a4ef1)

這邊忽略建立 Vue 專案的過程，直接進入重點：

### Install Loader
先安裝所需要的 loader，`node-sass`跟`sass-loader`
```
npm install --save-dev node-sass sass-loader
```

### Create vue.config.js
如果已經有調整過 vue 專案的編譯過程，可能已經新增過這個檔案了，如果還沒有這個檔案就在專案目錄下新增，用以調整 webpack 的設定，這邊載入兩個共用的 scss 檔案，一個是我用來放 css 顏色的變數，而另一個是放一些常用的 mixin
```
module.exports = {
  css: {
    loaderOptions: {
      sass: {
        data: `
          @import "@/assets/styles/_variables.scss";
          @import "@/assets/styles/_mixin.scss";
        `
      }
    }
  }
}
```

另外如果 sass-loader 會根據不同版本，有不同的寫法，上述的是 v7 或更舊的版本，
* sass-loader v8 : `data`請更換為`prependData`
* sass-loader v9 : `data`請更換為`additionalData`

做完這兩部，基本上就算完成了。接下來在專案內的 vue 檔撰寫 style 時，都可以套用已經 import 的變數跟 mixin 了。

## Customize Element-UI Style
這次在使用 Element UI 的時候，有一些要客製化的需求，但是在 vue 檔的 style 直接寫，似乎無法將 css 套用到 Element UI 上，所以只好上網問問 Google 大神了。

參考文件 :
1. [如何在Vue裡面使用Element-ui並修改CSS樣式呢？](https://medium.com/i-am-mike/%E5%A6%82%E4%BD%95%E5%9C%A8vue%E8%A3%A1%E9%9D%A2%E4%BD%BF%E7%94%A8element-ui%E4%B8%A6%E4%BF%AE%E6%94%B9css%E6%A8%A3%E5%BC%8F%E5%91%A2-f11c1e05787f)
2. [Element-UI 不能自定义样式吗](https://segmentfault.com/q/1010000009483822)
3. [/deep/ 是什麼？ — 聊聊 Vue 裡的 scoped css](https://medium.com/@debbyji/deep-%E6%98%AF%E4%BB%80%E9%BA%BC-%E8%81%8A%E8%81%8A-vue-%E8%A3%A1%E7%9A%84-scoped-css-d1877f902845)

### Method 1 - Remove 'scoped'
將 vue 檔內 style 的 scoped 參數移除，這樣一來就可以全局套用了，只是缺點就是影響的範圍太廣，實在不是一個很好的方法
```
...
<style lang="scss" scoped>
.el-main {
    ....
}
</style>
　　　　　
// 改寫成下面
<style lang="scss">
.el-main {
    ....
}
</style>
```


### Method 2 - Customize at local
將 node_modules 裡面 Element UI 的 scss 整包抓下來自己修改，然後另外放到 assets 目錄下自行修改，並在 main.js 內引入，但是這個真的沒路可走的時候再這麼做吧！不然自己維護一整份也挺累的，而且如果有更新的需求時就慘了

* 樣式路徑 `node_modules/element-ui/lib/theme-chalk`
* 複製到專案下 `assets/element-ui/style`
* 將原本 main.js 的 import 改成

```
// import 'element-ui/lib/theme-chalk/index.css'
// 將上面這行改成底下這行
import 'assets/element-ui/style/index.css'
```

### Method 3 - Use Deep Selector
