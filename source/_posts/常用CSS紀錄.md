---
layout: post
title: 常用CSS紀錄
author: Soar Lin
cdn: header-off
header-img: ''
date: 2017-11-05 21:16:43
tags:
  - CSS
  - SCSS
  - mixin
  - flexbox
categories:
  - Frontend
---

已經兩個月沒更新 blog 了，感覺再不寫都快忘光 hexo, Travis CI 跟 elasticsearch 的使用了，不過先前已經將大部分的工作都自動化了，所以現在省事很多，只要 git push 後沒出問題的話

最近一兩個月下來，本來有想說寫一下怎麼做 FB 產品目錄，不過感覺這個找相關文件看好像就好了，加上寫文章動力大減，就一直荒廢中，而工作也幾乎都是切版，套程式，雖然有花一點時間摸索一下 docker 跟 golang 可是礙於工作需完成的進度很趕，所以實在沒太多時間好好深入這兩個東西，覺得非常可惜！希望之後可以跟得上大家的進度，不要扯後腿。

<!-- more -->

之所以寫這篇只是記錄一下最近幾次的切版習慣跟用法，以及一些常用的 mixin 函式

## SCSS 慣用目錄結構

雖然我是寫 scss 語法，可是我好像都把目錄命名成 sass，不曉得當初怎麼想的，反正就參考吧！

````
./sass
├── main.scss
├── modules
│   ├── _common.scss
│   ├── _component.scss
│   ├── _mixins.scss
│   ├── _normalize.scss
│   └── _variables.scss
└── partials
    ├── _auth.scss
    ├── _blog.scss
    ├── _button.scss
    ├── _category.scss
    ├── _footer.scss
    ├── _header.scss
    ├── _list.scss
    ├── _login.scss
    ├── _modal.scss
    ├── _order.scss
    └── _smartbanner.scss
````

主要就用 main.scss 來 import 其他檔案來編譯， modules 裡面放些比較通用的資源，如： normalize (不過有另外用 bootstrap 的話應該不用在 import 了)、網站 CSS 通用變數、mixin 函式等等，而另一個 partials 就可能依照頁面名稱、功能來撰寫相關 CSS

所以 main.scss 的檔案大概就只會像這樣，這裡我還多了 body 的樣式，主要是用來控制全站頁面 body 的 padding

````
@import 'modules/normalize';
@import 'modules/variables';
@import 'modules/mixins';
@import 'modules/common';
@import 'modules/component';

@import 'partials/button';
@import 'partials/list';
@import 'partials/smartbanner';
....
@import 'partials/login';
@import 'partials/modal';

body {
    padding-top: 70px;
}
````

## 常用 mixin function

### 清除 float
後來少用了，大多用 flexbox 排版了

````
@mixin clearfix {
    &::after {
        content: "";
        display: table;
        clear: both;
    }
}

// 使用上
.my-container {
    @include clearfix;
    padding: 10px 20px;
    ....
}
````


### 過長文字結尾省略
多行的用法不是每個瀏覽器都適用

````
@mixin ellipsis($line:1) {
    text-overflow: ellipsis;
    overflow: hidden;

    @if $line == 1 {
        white-space: nowrap;
    } @else {
        display: -webkit-box;
        -webkit-line-clamp: $line;
        -webkit-box-orient: vertical;
    }
}

// 使用上, 標題過長省略(一行), 描述第三行後省略
.card {
    .title {
        font-size: 1em;
        line-height: 1.4;
        width: 100%;
        @include ellipsis;
    }
    .description {
        font-size: .8em;
        line-height: 1.2;
        @include ellipsis(3);
    }
}
````

### 容器, flexbox 排版(預設置中)

````
@mixin size($w, $h:$w, $bdrs:0) {
    width: $w;
    height: $h;
    border-radius: $bdrs;
}
@mixin flex($jc:center, $ai:center) {
    display: flex;
    justify-content: $jc;
    align-items: $ai;
}

// 範例: 按鈕內文字置中
.redeem-btn {
    @include size(80, 50, 6);
    border: 1px solid #ccc;
    font-size: 1em;
    line-height: 1.3;
    @include flex;
}
````

### 空背景
方便替換圖片

````
@mixin no-image-bg {
    background-color: rgba(255,255,255, .1);
    background-position: center center;
    background-repeat: no-repeat;
    background-size: cover;
}

// 範例: 某封面圖
.cover {
    @include size(160, 120, 10);
    @include flex;
    @include no-image-bg;
}

// HTML 內搭配背景圖片使用
<div class="cover" style="background-image:url('path-to-cover-image')">
  <h3 class="title">封面標題</h3>
</div>
````

### RWD 使用
這個之前好像有寫過，這裡詳細列出

````
/* 尺寸變數 */
$desktop-lg-min: 1200px;
$desktop-max:    1199px;
$tablet-max:      991px;
$mobile-max:      767px;
$mobile-min:      480px;

@mixin lg-desktop {
    @media screen and (min-width: $desktop-lg-min) {
        @content;
    }
}

@mixin desktop {
    @media screen and (max-width: $desktop-max) {
        @content;
    }
}

@mixin tablet {
    @media screen and (max-width: $tablet-max) {
        @content;
    }
}
@mixin phone {
    @media screen and (max-width: $mobile-max) {
        @content;
    }
}
@mixin phoneV {
    @media screen and (max-width: $mobile-min) {
        @content;
    }
}

// 使用範例
.swiper-slide {
    width: calc(33.33% - 10px);

    @include tablet {
        width: calc(50% - 10px);
    }

    @include phone {
        width: calc(75% - 10px);
    }

    @include phoneV {
        width: 100%;
    }
}
````

### 捲軸隱藏, 非支援所有瀏覽器
有時候覺得捲軸有點醜，可以在 Chrome 瀏覽器內隱藏起來，只是使用時要小心，使用者因此不曉得可以捲動，反而造成使用上的困擾

````
.my-dropdown-list {
    max-height: 300px;
    overflow-x: hidden;
    overflow-y: scroll;

    &::-webkit-scrollbar {
        display: none;
    }
}
````

另外最近幫網站切版，發現幾乎大量使用到 [Swiper](http://idangero.us/swiper/) 這套件，而開始用這套件時，還是 3.4.2 版，而現在時過境遷，都更新到 4.0.1 版了，查閱的 API 資料也開始不適用了...感覺有點糟糕，要是全站套件更新，感覺是個大工程，只能先繼續使用舊版，而相關參數應該不會差太多，目前已知的是左右切換的按鈕參數寫法改變了

這裡也記錄一下最常用的幾個參數

````
// 必要 DOM
<div class="swiper-container">
  <div class="swiper-wrapper">
    <div class="swiper-slide">Slide 1</div>
    <div class="swiper-slide">Slide 2</div>
    <div class="swiper-slide">Slide 3</div>
    ....
  </div>

  <div class="swiper-button-prev"></div>
  <div class="swiper-button-next"></div>
</div>

// JS
new Swiper ('.swiper-container', {
    freeMode: false,
    freeModeSticky: false,
    freeModeMomentumRatio: 5,
    threshold: 50,
    slidesPerView: 'auto',
    spaceBetween: 30,
    paginationClickable: true,
    touchReleaseOnEdges: true,
    prevButton: '.swiper-button-prev',
    nextButton: '.swiper-button-next',
    breakpoints: {
        991: {
            spaceBetween: 10,
        },
        1199: {
            spaceBetween: 15,
        }
    }
});
````

* `freeMode` 預設 false，如果設定成 tree, 在手機上滑動的時候，會非常平順，不過也不好定下來
* `freeModeSticky` 在 free mode 下設定 true 好讓 slide 可以再鬆開滑動時，停在某一 slide 下
* `freeModeMomentumRatio` 滑動釋放時的動量
* `threshold` 行動裝置上, touch 時移動的容錯距離，在這範圍內不觸法 slider 滑動
* `slidesPerView` 指定每一頁 slider 要放幾個，當有給定 swiper-slide 寬度時，使用 auto 可自行排序，但是畫面會等 js 處理
* `spaceBetween` 每個 slide 中間的間距，在 `slidesPerView` 設定 auto 時，可以明顯感受出來
* `paginationClickable` 顧名思義，當有 pagination 時，可點擊下方小圓點來切換
* `touchReleaseOnEdges` 有點忘了當初為何有用這個，好像是可以讓滑到 slider 邊緣時，繼續滑動吧？！
* `breakpoints` 很好用，但是不一定常用，用來指定在不同螢幕寬度下，要變化的參數

大概就先這樣吧！其實最近還有用到一個套件是 [jquery.dotdotdot](http://dotdotdot.frebsite.nl/) 的樣子，不過才剛使用沒多久，馬上就版本更新，害我後來想找舊版文件超難找，還好一開始有寫好一個版本可以參考，不然真的就 GG 了