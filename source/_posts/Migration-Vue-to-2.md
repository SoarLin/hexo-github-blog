---
layout: post
title: Vue 1.x 升級至 2.0 的辛酸歷程
author: Soar Lin
cdn: header-off
header-img: 'https://soarlin.github.io/images/vue2/bg.jpg'
date: 2017-01-22 21:19:20
tags:
  - vue
  - laravel
  - elixir
  - vuex
  - vuejs
categories:
 - Frontend
---
<!-- MarkdownTOC -->

- [Migration Vue 1.x to 2.0](#migration-vue-1x-to-20)
  - [前言](#前言)
  - [升級前後版本比較](#升級前後版本比較)
  - [升級 Step 1](#升級-step-1)
    - [Vue 1.0 內可無痛修改](#vue-10-內可無痛修改)
  - [升級 Step 2](#升級-step-2)
    - [安裝主要工具](#安裝主要工具)
    - [安裝編譯工具](#安裝編譯工具)
    - [gulpfile 調整](#gulpfile-調整)
    - [語法調整](#語法調整)
  - [大功告成？](#大功告成？)
  - [Reference](#reference)

<!-- /MarkdownTOC -->


<a name="migration-vue-1x-to-20"></a>
# Migration Vue 1.x to 2.0

<a name="前言"></a>
## 前言
雖然知道 Vue 2.0 推出也好一陣子了，但是原本的專案一直在猶豫該不該升級到 2.0 版本，之前嘗試了一兩次要升級，最後都因為無法順利編譯過而放棄。但由於考量到之後還要再開發的功能也需要使用前端框架，所以這幾天還是痛下決心再試一次。

目前專案用到的東西真的好複雜，gulp 流程要跑完都要好長一段時間，光 CSS 處理就從，純 CSS 到 CSS 前處理器(包含 [Less](http://lesscss.org/), [Sass](http://sass-lang.com/))甚至還有後處理器 [PostCSS](http://postcss.org/)，而 JS Framework 也使用了兩個 [React.js](https://facebook.github.io/react/) 與 [Vue.js](https://vuejs.org/)，而原本 gulpfile 也從單純自己安裝套件到後來改為 [Laravel Elixir](https://laravel.com/docs/5.1/elixir) 的方式來處理，這些全都算是一種技術債吧！

<!-- more -->

而這次 Vue 的版本升級，也順便更新了 Laravel Elixir 的版本從 5 到 6，但似乎遇到了一個滿多人遇到的情況，在執行 gulp watch 時，會因為產生亂數版本號([version](https://laravel.com/docs/5.1/elixir#versioning-and-cache-busting)) 的動作出問題而程序終止，也因為這個問題讓我一度猶豫是否該把 elixir 版本降回去 5.0.x 版，但是昨晚也為了這付出了許多代價，結果還是失敗，只能放棄 gulp watch 這個美好的指令....XD

<a name="升級前後版本比較"></a>
## 升級前後版本比較
這裡先將有相關工具升級前後，版本的資料紀錄一下，

|       Tools    |    Before  |    After   |   備註      |
| -------------- |:----------:|:----------:| ---------- |
| [laravel-elixir](https://laravel.com/docs/5.3/elixir) |   5.0.0    |  6.0.0-14  |            |
| [laravel-elixir-webpack-official](https://www.npmjs.com/package/laravel-elixir-webpack)| ---- | 1.0.2 | elixir 6 使用 webpack |
| [laravel-elixir-rollup-official](https://www.npmjs.com/package/laravel-elixir-rollup-official) | ---- | 1.1.0 | elixir 6 採用 Rollup 來轉譯 JS 到 ES 5 |
| [laravel-elixir-browserify-official](https://www.npmjs.com/package/laravel-elixir-browserify-official) | ---- | 0.1.3 |  elixir 6 在執行 browserSync 用到，不過本身沒用到，似乎白裝了 |
| [laravel-elixir-postcss](https://www.npmjs.com/package/laravel-elixir-postcss) | 0.3.6 | 0.5.0 | 順便更新 |
| [laravel-elixir-vueify](https://www.npmjs.com/package/laravel-elixir-vueify) | 1.0.3 | ---- | elixir 5 編譯 Vue 1.0 時會用，要編譯 vue 2.0 改用 laravel-elixir-vueify-2.0 |
| [laravel-elixir-vueify-2.0](https://www.npmjs.com/package/laravel-elixir-vueify-2.0)| ---- | 1.0.3 | elixir 5 編譯 Vue 2.0 時用到，只是我實驗結果失敗了，所以 elixir 才升級到 6 |
| [vue](https://vuejs.org/v2/guide/) | 1.0.26 | 2.0.1 | 這次的主角 Vue 2.0 |
| [vuex](https://www.npmjs.com/package/vuex) | 0.6.3 | 1.0.1 | Vuex 搭背 Vue 來處理狀態機制，類似 React.js 搭配 Redux |
| [laravel-elixir-vue-2](https://www.npmjs.com/package/laravel-elixir-vue-2) | ---- | 0.2.0 | elixir 6 搭配這個總算順利編譯 Vue 2.0 了 |
| [vueify](https://www.npmjs.com/package/vueify) | 8.7.0 | 9.4.0 | 用來處理單一 Vue Compoment 檔案，不曉得需不需要也是升級了 |

很希望有人來指導這次的升級該怎麼做才是最佳做法，我不是很聰明，只能一直 try & error，經過了好幾個小時的時間消耗，才順利把 Vue 2.0 給編譯出來，而且可以正常執行，覺得這真的是個打擊信心的做法

<a name="升級-step-1"></a>
## 升級 Step 1

當然先去找升級提示工具來提示，然後在 Vue 1.0 還能編譯的範圍，先將一些細節修改，使用的是官方推薦的工具 - [Vue migration helper](https://github.com/vuejs/vue-migration-helper)，第一次檢查專案時，跑出了37個建議，因為之前有過一些經驗，知道有些問題可以先處理，這裡列出來給後人參考

![Vue Migration Helper](https://soarlin.github.io/images/vue2/vue-migration-helper.png)

<a name="vue-10-內可無痛修改"></a>
### Vue 1.0 內可無痛修改

在真的 npm install vue@2.0 之前，還是有些建議寫法可以先改起來放，可能會有人問說，就乾脆安裝 Vue 2.0 然後再一口氣改不就好了，我也很想這麼做，但是 gulp 一開始就跑不過，不可控制的變數太多，我失敗了幾次後學到的教訓，還是慢慢來就好，如果本身已經是大神的，可能就沒差，直接上吧！

所以試誤了幾次後，大概歸納出下面幾個可以先在 Vue 1.x 改了也還能編譯過的方法：

#### 原本屬性內的計算插值要改寫法
[Interpolation within attributes has been removed](https://vuejs.org/v2/guide/migration.html#Interpolation-within-Attributes-removed)

````
Vue 1.x 寫法
<button class="btn btn-{{ size }}"></button>

Vue 2.0 寫法
<button v-bind:class="'btn btn-' + size"></button>
````

#### HTML 計算插值改用 v-html 替換
[HTML interpolation with &#123;&#123;&#123;&#125;&#125;&#125; has been removed](http://vuejs.org/guide/migration.html#HTML-Interpolation)

````
Vue 1.x 寫法
<div> {{{ foo }}} </div>

Vue 2.0 寫法
<div v-html="foo"></div>
````

這裡有踩到雷的經驗，因為在 1.x 時，輸出的 html 內容還可以再搭配其他 DOM 元素，但是改用 v-html 後，裡面再放其他 DOM 元素都會消失，只剩下原本要輸出的 html 內容

__踩到的地雷__，原本寫法如下

````
<div> {{{ foo }}} <button>OK</button> </div>
````
在 1.x 版本還能顯示 button，若改成 2.0 寫法

````
<div v-html="foo"> <button>OK</button> </div>
````

這時候裡面的 button 就無法顯示了，需拆成兩個元件來寫

````
<div v-html="foo"></div> <button>OK</button>
````
雖然可能覺得沒什麼，但是原本寫好的一些邏輯判斷就要小心，是否因為 DOM 排列變化而出問題

#### 移除 v-for 中隱含變數 $index, $key
[$index has been removed to avoid implicitly defined (i.e. "magic") variables](http://vuejs.org/guide/migration.html#index-and-key)

````
Vue 1.x 寫法
<div v-for="item in items">
index : {{ $index }}, item = {{ item }}
</div>

Vue 2.0 寫法
<div v-for="(item, index) in items">
index : {{ index }}, item = {{ item }}
</div>
````

__注意事項__，在還沒真的升級到 Vue 2.0 前，v-for 裡增加 index 的寫法，index 擺在前面，如下面的過渡寫法

````
<div v-for="(index, item) in items">
index : {{ index }}, item = {{ item }}
</div>
````

<a name="升級-step-2"></a>
## 升級 Step 2
當然就是安裝 Vue 2.0，然後再根據 vue-migration-helper 剩下的建議，把語法改一改，再來找合適的編譯工具

因為還有使用 vuex 來做狀態的管理，為了配合 Vue 2.0，vuex 也需要從原本的 0.6 升級啦 ([Migration form Vuex 0.6.x to 1.0](https://vuejs.org/v2/guide/migration-vuex.html))，雖然 vuex 也有 2.0版本，但是寫法也改了，我暫時不想再搞自己了，先把 vue 升到 2.0 就快搞死我了，不想多折磨自己

<a name="安裝主要工具"></a>
### 安裝主要工具

當然是 vue 2.0 與 vuex

````
npm install --save vue@2.0.1 vuex@1.0.1
````

<a name="安裝編譯工具"></a>
### 安裝編譯工具

經過了很長時間的 try & error，總結出應該就是下面這幾個工具，不然就在參考上面的表格吧

* laravel-elixir@6.0.0-14
* laravel-elixir-vue-2
* laravel-elixir-rollup-official
* laravel-elixir-webpack-official


````
npm install --save-dev laravel-elixir-rollup-official laravel-elixir-webpack-official
npm install --save laravel-elixir@6.0.0-14 laravel-elixir-vue-2
````

<a name="gulpfile-調整"></a>
### gulpfile 調整

為了編譯 Vue 2.0，使用了 laravel-elixir-vue-2，所以基本用法如下：

````
var elixir = require('laravel-elixir')

require('laravel-elixir-vue-2')

elixir(function(mix) {
  mix.webpack('app.js'); // resources/assets/js/app.js
})
````

另外 laravel-elixir 版本也從 5 升級到 6，所以原本的 [Bebel](https://laravel.com/docs/5.1/elixir#babel) 寫法也要改成 [Rollup](https://laravel.com/docs/5.3/elixir#rollup)

````
Bebel 寫法
elixir(function(mix) {
    mix.babel([
        'order.js',
        'product.js'
    ]);
});

Rollup 寫法
elixir(function(mix) {
    mix.rollup('app.js');
});
````

<a name="語法調整"></a>
### 語法調整
一樣繼續使用 vue-migration-helper 檢查語法，加以調整

#### v-for 中 index, key 變數位置
由於先前過度寫法已經加入 index or key 在 v-for 內，所以這邊只是將位置調換，為了符合 Vue 2.0 的用法

````
過渡時寫法 (index, value)
<div v-for="(index, item) in items">
index : {{ index }}, item = {{ item }}
</div>

Vue 2.0 寫法 (value, index)
<div v-for="(item, index) in items">
index : {{ index }}, item = {{ item }}
</div>
````

#### Lifecycle 中的 ready 已移除
[ready lifecycle hook has been removed](http://vuejs.org/guide/migration.html#ready)
Vue 1.x 與 Vue 2.0 的 lifecycle 經過調整，原本的 ready 狀態更換為 mounted，所以就跟著調整

````
Vue 1.x
ready: function() {
  // code here
}

Vue 2.0
mounted: function () {
  this.$nextTick(function () {
    // code here
  })
}
````

#### Transition 參數替換
[The new and improved transition system requires use of new &lt;transition&gt; and &lt;transition-group&gt; components](http://vuejs.org/guide/migration.html#transition-Attribute)

原本的專案內用到 modal 效果，就會需要個簡單的過場，這裡 Vue 有提供好的範例可以參考使用，還不賴 ( [Vue 2.0 的 Modal Compontent 範例](https://vuejs.org/v2/examples/modal.html) )

[Vue 1.x 版本](http://v1.vuejs.org/examples/modal.html)

````
<div class="modal-mask" v-show="show" transition="modal">
  <div class="modal-wrapper">
    ....
  </div>
</div>
````

[Vue 2.0 版本](https://vuejs.org/v2/examples/modal.html)

````
<transition name="modal">
  <div class="modal-mask">
    <div class="modal-wrapper">
      ....
    </div>
  </div>
</transition>
````

#### Component 必須有個 root dom

Vue 2.0 後，每個元件都必須被包在一個 DOM 元素下，這點跟 React.js 有點像，之前沒這麼做，現在就不得不改寫了

````
Vue 1.x 版本
<template>
  <div>
    ....
   </div>
  <component-a></<component-a>
  <component-b></<component-b>
</template>

Vue 2.0 版本
<template>
  <div>
    <div>
      ....
     </div>
    <component-a></<component-a>
    <component-b></<component-b>
  </div>
</template>
````

#### vm.$set (this.$set) 用法替換
原本專案內很多元件裡的 data 都透過 this.$set 的方式來更新內容，現在 vm.$set 變成 Vue.set 的別名，所以原本的用法就變啦！

`vm.$set( keypath, value )` --> `Vue.set( object, key, value )`

底下是自己的紀錄

````
基本調整
this.$set('mode', nextMode);
修改為
this.$set(this, 'mode', nextMode);

在 vue-resource 使用時要注意
// Vue 1.0 -> 2.0後, this.$set 改成 Vue.set 別名
// Vue.set(object, key, value), 所以須將自身傳入才能指定到contents這個資料
var self = this;
this.$http.get('/someUrl').then((response) => {
  // success callback
  var contents = response.json();
  this.$set(self, 'contents', contents);
}, (response) => {
  // error callback
});

````

#### 其他自己遇到的問題

checkbox 元件的預設狀態
原本 Vue 1.x 寫成 `<input type="checkbox" :checked="checked">` 裡面的 checked 是從父原件傳入的 Boolean 值，但是改成 Vue 2.0 後，似乎就失效了，花了很久的時間才改正確

````
Vue 1.x 時
<input type="checkbox" name="status" :checked="checked"
       v-model="status">
搭配
export default {
  props: {
    checked: Boolean
  },
  data() {
        return {
            status: ''
        };
    },
};

Vue 2.0 後
<input type="checkbox" name="status" v-model="status">
搭配
export default {
  props: {
    checked: Boolean
  },
  data() {
        return {
            status: this.checked
        };
    },
};
````

中間一度誤入歧途，找到了一些在討論 [prop 取消雙向綁定](https://vuejs.org/v2/guide/migration.html#twoWay-Prop-Option-removed) 的問題，但等到後來解決後才想到，我根本就是用 vuex 在做狀態管理，一開始就不是 twoWay bind 的做法，還搞了半天，簡直就是白痴

<a name="大功告成？"></a>
## 大功告成？

其實還沒有經過很嚴謹的測試，但是基本的功能與操作上，似乎沒有太多問題，我該高興我好不容易花了兩三天總算順利升級了嗎？但是想到 elixir 6 在 gulp watch 會出錯 ([Cannot gulp watch, but can gulp](https://github.com/laravel/elixir/issues/637))，實在一點也高興不起來，上網找了一下相關問題，似乎滿多人也都遇到了，但真正的解法我倒是還沒找到，希望有人可以來替我指點迷津。


<a name="reference"></a>
## Reference

[VueJS 2.0 升級小幫手: Vue migration helper](http://kuro.tw/posts/2016/09/30/Vue-2-0-%E5%8D%87%E7%B4%9A%E5%B0%8F%E5%B9%AB%E6%89%8B-Vue-migration-helper/)

[Migration from Vue 1.x](https://vuejs.org/v2/guide/migration.html)
