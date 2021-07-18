---
layout: post
title: Vue.js 專案開發紀錄 Part 1
author: Soar Lin
cdn: header-off
header-img: ''
date: 2018-07-22 09:24:42
tags:
  - vuejs
  - vuex
  - webpack
  - i18n
categories:
  - Frontend
---

頭一次用 Vue.js 來開發整個網站的專案，雖然還沒全部做完，還是先來做一下至目前為止的一些記錄，提供日後有需要的時候可以參考。專案是使用 vue-cli 3.0 版本產生的，環境所需 `Node >=8.`，目前本機環境 node.js v6.9.5，因為有舊專案的需求，所以不敢直接更新上去，所以使用 nvm 來安裝不同版本的 node.js

初始化專案指令
````
vue init webpack <project-name>
````
<!-- more -->
````
// 這裏 project-name 以 vue-hello 為例

? Project name vue-hello
? Project description A Vue.js project
? Author Soar <soar.lin@gmail.com>
? Vue build standalone
? Install vue-router? Yes
? Use ESLint to lint your code? Yes
? Pick an ESLint preset Standard
? Set up unit tests Yes
? Pick a test runner jest
? Setup e2e tests with Nightwatch? Yes
? Should we run `npm install` for you after the project has been created? (recommended) (Use arrow keys) yarn

   vue-cli · Generated "vue-hello".


# Installing project dependencies ...
# ========================
yarn install v1.3.2
info No lockfile found.
[1/5] 🔍  Validating package.json...
[2/5] 🔍  Resolving packages...
.....
[3/5] 🚚  Fetching packages...
[##############################################################################################------------------------] 975/1223
   vue-cli · Generated "vue-hello".

# Installing project dependencies ...
[4/5] 🔗  Linking dependencies...
[5/5] 📃  Building fresh packages...
success Saved lockfile.
✨  Done in 68.73s.

Running eslint --fix to comply with chosen preset rules...
# ========================

yarn run v1.3.2
$ eslint --ext .js,.vue src test/unit test/e2e/specs --fix
✨  Done in 2.24s.

# Project initialization finished!
# ========================

To get started:

  cd vue-hello
  npm run dev

Documentation can be found at https://vuejs-templates.github.io/webpack
````

# 專案目錄演進

![Vue專案目錄結構演進](/images/vue2/project-src.png)

綠色框框的部分，隨著專案持續開發下去，內容越來越多，也持續在做些目錄的調整，雖然覺得還可以改得更好，不過目前專案就一人開發，所以我覺得還行就這麼繼續下去了。

## assets 內容
assets 的內容主要都用來放些程式在編譯時，會共用到的檔案，由於不想把圖檔一起做編譯，所以後來都移到 `/static/images/` 下了，而 `semantic-ui-calendar` 則是因為手動調整了一些這個套件的內容，雖然發了 pull request，不過該專案的作者似乎不太想理我...Orz，所以只好每次編譯都得另外載入自己修改的 js 檔

而 `/assets/sass/` 下目前放著兩個檔案，每次 vue component 編譯時，皆會預先載入 resources.sass，然後再透過 resources.sass 來 `import common.sass`，至於修改方式在上一篇文章有[寫道](http://soarlin.github.io/2018/06/02/Vue-%E4%BD%BF%E7%94%A8Firebase-Cloud-Messaging/#Vue-%E5%B0%88%E6%A1%88%E5%85%A7%E4%BD%BF%E7%94%A8%E5%85%B1%E5%90%8C-SASS-%E8%B3%87%E6%BA%90)
* resources.sass : 用來定義CSS顏色變數，mixin function，media query 語法等等
* common.sass : 用來撰寫一些客製化的共通元件 style，如：sidebar, modal, button ...等

````
// resources.sass
　　　
/* Colors */
$greeny-blue: #34aeab
$grapefruit: #fc5857
$flat-blue: #398eab
$denim: #366474
....

@mixin ellipsis($line:1)
  text-overflow: ellipsis
  overflow: hidden

  @if $line == 1
    white-space: nowrap
  @else
    display: -webkit-box
    -webkit-line-clamp: $line
    -webkit-box-orient: vertical

@mixin size($w, $h:$w, $bdrs:0)
  width: $w
  height: $h
  border-radius: $bdrs

@mixin flex($jc:center, $ai:center)
  display: flex
  justify-content: $jc
  align-items: $ai

/* large desktop */
$desktop-lg-min: 1200px;
/* normal desktop range */
$desktop-max:    1199px;
$desktop-min:     992px;
/* tablet range */
$tablet-max:      991px;
$tablet-min:      768px;
$mobile-max:      767px;
$mobile-min:      480px;

@mixin lg-desktop
  @media screen and (min-width: $desktop-lg-min)
    @content
@mixin desktop
  @media screen and (max-width: $desktop-max)
    @content
@mixin tablet
  @media screen and (max-width: $tablet-max)
    @content
@mixin phone
  @media screen and (max-width: $mobile-max)
    @content
@mixin phoneV
  @media screen and (max-width: $mobile-min)
    @content

/* margin-top 10~100 */
@for $i from 1 through 10
  .mt#{$i}0
    margin-top: $i * 10px

/* margin-bottom 10~100 */
@for $i from 1 through 10
  .mb#{$i}0
    margin-bottom: $i * 10px

@import './common.sass'
````

## components 內容
原本會將每個頁面的 .vue 檔放在這裡，做了一陣子後覺得，頁面歸頁面，這目錄下還是放些單純一點的元件，事實證明好像沒什麼差別，單純就是自己爽就好，目前這裡放了些某些畫面上會使用到的元件，有個小型客製化的時間選擇器，用來選擇每間隔 15 分鐘的時間，另外的是畫面的 sidebar 內容，sidebar 內容其實做了很多東西，不過由於不算是完整頁面，還是被我歸類到這目錄下了

## helpers 內容
之前不曉得在哪裡看到有個教學用了這樣的目錄，然後裡面主要是定義一些變數讓整個專案來使用，很想學習這樣的做法，不過目前有點東施效顰吧！裡面也沒放幾個變數，一個是 CDN 路徑，一個是 Object hasOwnProperty 的檢查，不過另外寫了一個取得目前執行環境所用到的 API 路徑，以及一堆時間計算、字串處理的 function

````
import moment from 'moment'
　　　
const helpers = {
  getParameterByName (name, url) {
    if (!url) url = window.location.href
    name = name.replace(/[[\]]/g, '\\$&')
    let regex = new RegExp('[?&|#]' + name + '(=([^&#]*)|&|#|$)')
    let results = regex.exec(url)
    if (!results) return null
    if (!results[2]) return ''
    return decodeURIComponent(results[2].replace(/\+/g, ' '))
  },
  isEmpty (obj) {
    // null and undefined are "empty"
    if (obj == null) return true

    // Assume if it has a length property with a non-zero value
    // that that property is correct.
    if (obj.length > 0) return false
    if (obj.length === 0) return true

    // If it isn't an object at this point
    // it is empty, but it can't be anything *but* empty
    // Is it empty?  Depends on your application.
    if (typeof obj !== 'object') return true

    // Otherwise, does it have any properties of its own?
    // Note that this doesn't handle
    // toString and valueOf enumeration bugs in IE < 9
    for (var key in obj) {
      if (hasOwnProperty.call(obj, key)) return false
    }
    return true
  },
  getCurrentTime (format) {
    return moment().format(format)
  },
  getNextDate (format) {
    return moment().add(1, 'days').format(format)
  },
  getPrevDate (format) {
    return moment().subtract(1, 'days').format(format)
  },
  nl2br (str, isXhtml) {
    var breakTag = (isXhtml || typeof isXhtml === 'undefined') ? '<br />' : '<br>'
    return (str + '').replace(/([^>\r\n]?)(\r\n|\n\r|\r|\n)/g, '$1' + breakTag + '$2')
  },
  thousandComma (number) {
    let num = number.toString()
    let pattern = /(-?\d+)(\d{3})/

    while (pattern.test(num)) {
      num = num.replace(pattern, '$1,$2')
    }
    return num
  }
}

export default helpers
````

## i18n 內容
顧名思義就是用來放多語系的檔案，當初為了把多語系的部分搞定也是四處找資料，花了不少時間改好自己用的樣子

目前使用的 [vue-i18n](https://github.com/kazupon/vue-i18n)的v.7.6版，[參考文件](http://kazupon.github.io/vue-i18n/introduction.html)

i18n 目錄如下：
````
src/i18n
├── index.js
└── languages
    ├── en-US.json
    ├── ja-JP.json
    ├── zh-CN.json
    └── zh-TW.json
````

index.js 內容
````
import Vue from 'vue'
// Vuex-i18n
import VueI18n from 'vue-i18n'
// i18n
import zhTW from './languages/zh-TW.json'
import zhCN from './languages/zh-CN.json'
import jaJP from './languages/ja-JP.json'
import enUS from './languages/en-US.json'

// Vuex-i18n
Vue.use(VueI18n)

const messages = {
  'zh-TW': zhTW,
  'zh-CN': zhCN,
  'ja-JP': jaJP,
  'en-US': enUS
}

// 1.檢查 localStorage 語系
// 2.檢查瀏覽器語系
// 3.預設英文語系
let locale = localStorage.getItem('LANGUAGE') || navigator.language || 'en-US'

const i18n = new VueI18n({
  locale,
  fallbackLocale: 'zh-TW',
  messages
})

export default i18n
````

而 languages 下的檔案內容，以 zh-TW.json 為例
````
{
  "shortMonths": ["1月", "2月", "3月", "4月", "5月", "6月", "7月", "8月", "9月", "10月", "11月", "12月"],
  "longMonths": ["一月", "二月", "三月", "四月", "五月", "六月", "七月", "八月", "九月", "十月", "十一月", "十二月"],
  "shortDays": ["日", "一", "二", "三", "四", "五", "六"],
  "longDays": ["星期日", "星期一", "星期二", "星期三", "星期四", "星期五", "星期六"],
  "天": "天",
  "時": "時",
  "分": "分",
  "小時": "小時",
  "分鐘": "分鐘",

  "確定": "確定",
  "取消": "取消",
  "關閉": "關閉",
  "儲存": "儲存",
  "上一步": "上一步",
  "下一步": "下一步",

  "消費稅 X%": "消費稅 {0}%"
}
````

而在 .vue 檔內使用時，範例如下：
````
<template>
  <p>日期：{{ displayToday }}</p>
  <!-- ... -->
  <button>{{ $t('確定') }}</button>
  <!-- ... -->
  <p>{{ $t('消費稅 X%', [tax]) }}</p>
  <!-- ... -->
</template>

<script>
import moment from 'moment'
export default {
  data () {
    return {
      tax: 8
    }
  },
  computed: {
    displayToday () {
      let yyyy = moment().year()
      let mm = moment().month()
      let dd = moment().date()
      let weekday = moment().day()
      // 2018年7月22(日)
      return yyyy + '年' + this.$i18n.t('shortMonths')[mm] + dd + '日' + '(' + this.$i18n.t('shortDays')[weekday] + ')'
    }
  }
}
</script>
````

因為要寫的東西太多，所以決定偷懶分成不同 Part 來寫