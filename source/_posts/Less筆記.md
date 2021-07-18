---
layout: post
title: Less筆記
author: Soar Lin
date: 2016-08-28 18:29:43
tags:
  - less
  - mixins
  - RWD
  - color
  - css-preprocessor

categories:
 - Frontend

---
<!-- MarkdownTOC -->

- [Less](#less)
    - [變數](#變數)
    - [計算](#計算)
    - [顏色處理](#顏色處理)
    - [mixins 混入](#mixins-混入)
    - [RWD 寫法參考](#rwd-寫法參考)

<!-- /MarkdownTOC -->


<a name="less"></a>
# Less
<a name="變數"></a>
## 變數
* 使用@符號當開頭命名變數, e.g.`@link-color: #4281dc;`

````css
@link-color:        #428bca; // sea blue

// Usage
a,
.link {
    color: @link-color;
}
````
#### Selectors

````css
// Variables
@my-selector: banner;

// Usage
.@{my-selector} {
    font-weight: bold;
    line-height: 40px;
    margin: 0 auto;
}
````
#### URLs
<!-- more -->
````css
// Variables
@images: "../img";

// Usage
body {
    color: #444;
    background: url("@{images}/white-sand.png");
}
````
#### Import Statements

````css
// Variables
@themes: "../../src/themes";

// Usage
@import "@{themes}/tidal-wave.less";
````

#### Properties

````css
@property: color;

.widget {
    @{property}: #0ee;
    background-@{property}: #999;
}
````

<a name="計算"></a>
## 計算
* 雖然有 `calc()` 可以用，但是必須在前面加上 `~" ... "` 來跳脫字符
* 由於要以字串處理，所以裡面無法使用變數
* 如果要使用變數，需要以 `@{變數}` 的方式使用

````css
@asideWidth: 30px;

// error sample
.post {
    width: calc(100% - @asideWidth);
}

//correct sample, can't use parameter
.post {
    width: ~"calc(100% - 30px)";
}
// another way
.post {
    width: ~"calc(100% - @{asideWidth})";
}
````

<a name="顏色處理"></a>
## 顏色處理
* 可參考 [Color Channel Functions](http://lesscss.org/functions/#color-channel) , [Color Operation Functions](http://lesscss.org/functions/#color-operations)
* 一樣有 `hue`, `saturation`, `lightness`, `lighten`, `darken` ...等處理方式

<a name="mixins-混入"></a>
## mixins 混入
* 定義時，與原本寫 class name 類似 `.my-mixin` or `.my-mixin2()`
* 使用時，也是直接引用 `.my-mixin` or `.my-mixin2`

````css
.my-mixin {
    color: black;
}
// 不會輸出 class
.my-other-mixin() {
    background: white;
}
.class {
    .my-mixin;
    .my-other-mixin;
}

----------- Output -----------
.my-mixin {
    color: black;
}
.class {
    color: black;
    background: white;
}
````
* 可帶入參數 `.shadow(@color)`

````css
.border-radius(@radius) {
  -webkit-border-radius: @radius;
     -moz-border-radius: @radius;
          border-radius: @radius;
}

.header {
    .border-radius(4px);
}
.button {
    .border-radius(6px);
}
````

<a name="rwd-寫法參考"></a>
## RWD 寫法參考
* 直接寫`@media`條件式

````css
header {
    color: red;
    @media only screen and (min-width : 768px) { color: green; }
    @media only screen and (min-width : 1024px) { color: blue; }
}
````

* 透過變數宣告條件式

````css
@smartphones: ~"only screen and (max-width: 479px)";

.foo {
    font-size: 2.4em;

    @media @smartphones {
        font-size: 1.8em;
    }
}
````

````css
@smartphones: ~"only screen and (max-width: 479px)";
@tablets: ~"only screen and (min-width: 768px) and (max-width: 959px)";

@font-size--large: 24px;
@font-size--medium: 12px;

.foo {
    font-size: @font-size--large;

    @media @smartphones, @tablets {
        font-size: @font-size--medium;
    }
}
````