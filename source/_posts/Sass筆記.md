---
layout: post
title: Sass筆記
author: Soar Lin
date: 2016-08-28 18:24:40
tags:
  - mixins
  - RWD
  - color
  - sass
  - css-preprocessor
categories:
 - Frontend
---
<!-- MarkdownTOC -->

- [Sass](#sass)
  - [變數](#變數)
  - [計算](#計算)
  - [顏色處理](#顏色處理)
  - [mixins 混入](#mixins-混入)
  - [RWD 寫法參考](#rwd-寫法參考)

<!-- /MarkdownTOC -->


<a name="sass"></a>
# Sass
<a name="變數"></a>
## 變數
* 開頭錢($)字號, e.g. `$mainColor`, `$spaceUnit`
* 使用時，直接使用定義好的變數

````scss
$warm_grey: #8b8a8a;

h3.title {
    color: $warm_grey;
}
````
<!-- more -->
<a name="計算"></a>
## 計算
* 支援`+`,`-`,`*`,`/`與`%`

````scss
.container { width: 100%; }

article[role="main"] {
    float: left;
    width: 600px / 960px * 100%;
}

aside[role="complementary"] {
    float: right;
    width: 300px / 960px * 100%;
}
````

* 迴圈處理 `@for $i from 1 through 5 { ... } `

````scss
@for $i from 1 through 5 {
  .mt-#{$i}0 { margin-top: 10px * $i; }
  .mb-#{$i}0 { margin-bottom: 10px * $i; }
}
````

<a name="顏色處理"></a>
## 顏色處理
* 調整亮度，HSL 模式中的 L
  * 調高亮度 `lighten($base-color, 10%)`
  * 降低亮度 `darken($base-color, 10%)`
* 飽和度，HSL 模式中的 S
  * 調高飽和度 `saturate( $base-color, 20% )`
  * 降低飽和度 `desaturate( $base-color, 20% )`
* 色調值，HSL 模式中的 H
  * 調整 `adjust-hue( $base-color, 20% )`
* 透明度
  * `rgba( $base-color, .7 )`
* 色調與陰影 Tint & Shade, 增加白色色調或黑色色調
  * 增加白色(Tint) `tint( $base-color, 10% )`
  * 增加黑色(Shade) `shade( $base-color, 10% )`

<a name="mixins-混入"></a>
## mixins 混入
* 定義時，用 `@mixin mixin_name(param)`, `param`為可選
* 引用時，使用 `@include mixin_name`

````scss
@mixin shadow($color) {
    box-shadow: 1px 1px 0 1px darken($color, 15%);
}

.button {
    @include shadow(#23abc1);
}
````

<a name="rwd-寫法參考"></a>
## RWD 寫法參考
1. 使用變數定義不同尺寸
2. 利用 `@mixin Name` 與 `@content` 兩個特性來達成
3. 使用 `@include Name` 來引用

````scss
$padWidth: 992px;
$phoneWidth: 415px;

@mixin tablet {
    @media screen and (max-width: $padWidth) {
        @content;
    }
}
@mixin phone {
    @media screen and (max-width: $phoneWidth) {
        @content;
    }
}

.back-top {
    position: fixed;
    right: 30px;
    bottom: 30px;

    @include tablet {
        right: 20px;
        bottom: 20px;
    }
    @include phone {
        right: 10px;
        bottom: 10px;
    }
}
````