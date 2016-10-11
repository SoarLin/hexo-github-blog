---
layout: post
title: CSS筆記
date: 2016-08-27 16:51:17
updated: 2016-08-27 22:56:13
tags:
 - background
 - animation
 - transform
 - transition

categories:
 - Frontend

photos:
 - http://7xls5g.com1.z0.glb.clouddn.com/talk-about-css-preprocessor.png

---
<!-- MarkdownTOC -->

- [CSS](#css)
  - [Background 背景](#background-背景)
  - [Animation 動畫效果](#animation-動畫效果)
  - [Transform 變化](#transform-變化)
  - [Transition 轉場](#transition-轉場)

<!-- /MarkdownTOC -->


<a name="css"></a>
# CSS

<a name="background-背景"></a>
## Background 背景

**background: color image position/size repeat origin clip attachment initial|inherit;**

* position:
  * 水平(left, center, right, xpos)
  * 垂直(top, center, bottom, ypos)
* size: audo, percentage, cover, contain
* repeat: repeat|repeat-x|repeat-y|no-repeat
* origin: padding-box|border-box|content-box
* clip: border-box|padding-box|content-box (沒用過)
* attachment: scroll|fixed|local (沒用過)

<a name="animation-動畫效果"></a>
## Animation 動畫效果

**animation: @keyframes | duration | timing-function | delay | iteration-count | direction | fill-mode | play-state | name**

* @keyframes: 定義動畫, 另外寫

````css
@keyframes identifier {
    0% { top: 0; left: 0; }
    30% { top: 50px; }
    68%, 72% { left: 50px; }
    100% { top: 100px; left: 100%; }
}
````

* duration: 動畫一次週期的時間, e.g. 1s, 300ms
* timing-function: 動畫轉變時時間的加速曲線, e.g. linear, ease, ease-in, ease-in-out, ease-out
* delay: 定義元素讀取完畢到動畫開始的間隔時間
* iteration-count: 定義動畫重複的次數, e.g. 1, 2, infinite
* direction: 定義是否動畫播放完畢後將會反向播放, e.g. alternate(順,反,順,反)
* fill-mode: 定義元素在動畫播放外(動畫開始前及結束後)的狀態, e.g. forwards(停在最後)
* play-state: 控制動畫的播放狀態。有 pause 和 running 兩種值，後者為預設值。
* name: keyframes 的名稱

<a name="transform-變化"></a>
## Transform 變化

**transform: transform-functions**

* scale(x,y), scale3d(x,y,z), scaleX(x), scaleY(y), scaleZ(z)
* skewX(angle), skewY(angle)
* translate(x,y), translate3d(x,y,z), translateX(x), translateY(y), translateZ(z)
* rotate(angle), rotate3d(x,y,z,angle), rotateX(angle), rotateY(angle), rotateZ(angle)
* matrix(n,n,n,n,n,n), matrix3d(n,n,n,n,n,n,n,n,n,n,n,n,n,n,n,n)
* perspective()

<a name="transition-轉場"></a>
## Transition 轉場

**transition: name | duration | (timing function) | (delay) {, name | duration};**

* name: keyframes 的名稱
* duration: 轉場時間
* 動畫轉變時時間的加速曲線
* 元素讀取完畢到動畫開始的延遲時間
* 可以設定多組轉場

