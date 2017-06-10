---
layout: post
title: CSS筆記
author: Soar Lin
cdn: header-off
header-img: ''
date: 2016-08-27 16:51:17
tags:
 - background
 - animation
 - transform
 - transition
categories:
 - Frontend
---
<!-- MarkdownTOC -->

- [CSS](#css)
  - [Background 背景](#background-%E8%83%8C%E6%99%AF)
  - [Animation 動畫效果](#animation-%E5%8B%95%E7%95%AB%E6%95%88%E6%9E%9C)
  - [Transform 變化](#transform-%E8%AE%8A%E5%8C%96)
  - [Transition 轉場](#transition-%E8%BD%89%E5%A0%B4)

<!-- /MarkdownTOC -->


<a name="css"></a>
# CSS

<a name="background-%E8%83%8C%E6%99%AF"></a>
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

<a name="animation-%E5%8B%95%E7%95%AB%E6%95%88%E6%9E%9C"></a>
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

<a name="transform-%E8%AE%8A%E5%8C%96"></a>
## Transform 變化

**transform: transform-functions**

* scale(x,y), scale3d(x,y,z), scaleX(x), scaleY(y), scaleZ(z)
* skewX(angle), skewY(angle)
* translate(x,y), translate3d(x,y,z), translateX(x), translateY(y), translateZ(z)
* rotate(angle), rotate3d(x,y,z,angle), rotateX(angle), rotateY(angle), rotateZ(angle)
* matrix(n,n,n,n,n,n), matrix3d(n,n,n,n,n,n,n,n,n,n,n,n,n,n,n,n)
* perspective()

<a name="transition-%E8%BD%89%E5%A0%B4"></a>
## Transition 轉場

**transition: name | duration | (timing function) | (delay) {, name | duration};**

* name: keyframes 的名稱
* duration: 轉場時間
* 動畫轉變時時間的加速曲線
* 元素讀取完畢到動畫開始的延遲時間
* 可以設定多組轉場

