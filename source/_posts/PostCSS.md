---
layout: post
title: PostCSS筆記
author: Soar Lin
date: 2016-08-28 18:26:47
tags:
  - mixins
  - postcss
  - RWD
  - color
  - css-post-processor
categories:
 - Frontend
---
<!-- MarkdownTOC -->

- [PostCSS](#postcss)
  - [搭配 Plugin](#搭配-plugin)
  - [變數](#變數)
  - [計算](#計算)
  - [顏色處理](#顏色處理)
  - [mixins 混入](#mixins-混入)
  - [RWD 寫法參考](#rwd-寫法參考)

<!-- /MarkdownTOC -->

<a name="postcss"></a>
# PostCSS

<a name="搭配-plugin"></a>
## 搭配 Plugin
* 需搭配安裝
  * `postcss-import`
  * `postcss-mixins`
  * `postcss-nested`
  * `postcss-nextcss`
  * <del>`autoprefixer`</del>, 由於 `postcss-next` 已經自動加入這項功能，因此需要移除 <del>`autoprefixer`</del>

<a name="變數"></a>
## 變數
* 定義在 `:root { }` 裡面
* 使用時透過 `var(變數)` 來使用

````css
:root {
    --mainColor: #4fc5cf;
    --fontColor: #eee;
}

body {
    background-color: var(--mainColor);
    color: var(--fontColor);
}
````

<a name="計算"></a>
## 計算
* 使用function `calc`

````css
:root {
    --spaceUnit: 10px;
}
.mt-20 {
    margin-top: calc(var(--spaceUnit) * 2);
}
````

<a name="顏色處理"></a>
## 顏色處理
* `color( [ <color> | <hue> ] <color-adjuster>* )`
* color-adjuster
  * `[red( | green( | blue( | alpha( | a(] ['+' | '-']? [<number> | <percentage>] )`
  * 色調值 HSL中的H `hue( | h(] ['+' | '-' | '*']? <angle> )`
  * 飽和度 HSL中的S `saturation( | s(] ['+' | '-' | '*']? <percentage> )`
  * 亮度 HSL中的L `lightness( | l(] ['+' | '-' | '*']? <percentage> )`
  * 調白 `whiteness( | w(] ['+' | '-' | '*']? <percentage> )` or `tint( <percentage> )`
  * 調黑 `blackness( | b(] ['+' | '-' | '*']? <percentage> )` or `shade( <percentage> )`

````css
whatever {
    color: color(red a(10%));

    background-color: color(red lightness(50%));
    /* == color(red l(50%)); */

    border-color: color(hsla(125, 50%, 50%, .4) saturation(+ 10%) w(- 20%));
}
````

<a name="mixins-混入"></a>
## mixins 混入
* 需安裝 `postcss-mixins`
* 定義 `@define-mixin 名稱 $param1, $param2(有預設值)`
* 使用 `@mixin 名稱 $param1` or `@mixin 名稱 $param1 $param2`

````scss
@define-mixin icon $network, $color: blue {
    .icon.is-$(network) {
        color: $color;
        @mixin-content;
    }
    .icon.is-$(network):hover {
        color: white;
        background: $color;
    }
}

@mixin icon twitter {
    background: url(twt.png);
}
@mixin icon youtube, red {
    background: url(youtube.png);
}
````

<a name="rwd-寫法參考"></a>
## RWD 寫法參考
* 定義不同尺寸 `@custom-media --tablets (max-width: 992px);`
* 使用時 `@media (--tablets) { ... }`

````scss
@custom-media --phone (width < 768px);
@custom-media --tablets (width <= 992px);

.banner {
    width: 666px;

    @media(--tablets) {
        width: 100%;
        max-width: 550px;
    }
    @media(--phone) {
        width: 100%;
    }
}
````
