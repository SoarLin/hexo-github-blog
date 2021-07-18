---
layout: post
title: 前端樣板結合Gulp處理流程
author: Soar Lin
cdn: header-off
header-img: ''
date: 2016-12-26 16:50:07
tags:
  - gulp
  - sass
  - ejs
  - bower
  - eslint
categories:
  - Frontend
---

<!-- MarkdownTOC -->

- [前端樣板結合Gulp處理流程](#前端樣板結合gulp處理流程)
  - [專案位置](#專案位置)
  - [用到的技術](#用到的技術)
  - [開發環境](#開發環境)
  - [工具安裝](#工具安裝)
  - [目錄架構](#目錄架構)
    - [基本概念](#基本概念)
  - [Command](#command)
    - [gulp](#gulp)

<!-- /MarkdownTOC -->


<a name="前端樣板結合gulp處理流程"></a>
# 前端樣板結合Gulp處理流程

由於最近要做個純前端切版的案子，所以慢慢的建立一些規則，把一些處理流程交給gulp來執行，也順便整理一下希望日後還可以重複利用，不過前端技術變化日新月異，我到現在還不是用webpack而是gulp，其實不是不想用，只是試著要建立webpack設定檔時候，一直遇到問題，乾脆還是回來用比較習慣的gulp好了。等日後更有空再來慢慢研究好了

使用的技術也都不是很新，不過只要可以讓自己在前端切版這個案子方便好用，就會想辦法拿來使用。

<a name="專案位置"></a>
## 專案位置
[https://github.com/SoarLin/f2e-template](https://github.com/SoarLin/f2e-template)

<a name="用到的技術"></a>
## 用到的技術

* Gulp : 前端自動化流程工具，唯一一個花比較多時間研究與實作的技術，webpack 雖然有研究過，但這次專案開始的時候，一直弄不起來，火大之下就放棄了
* Sass : CSS preprocessor，雖然最早學會的是 Less，公司專案因為前人使用 postCSS(CSS後處理器)，但後來學了 Sass 後，暫時跳槽來這個最多人使用的前處理器
* EJS : JavaScript Templates，雖然使用了這個樣版引擎，可是是用來處理滿 low 的事情，單純只是為了把 HTML 的重複區塊獨立抽出來，然後在每個頁面利用 include 的方式載入會重複使用的區塊（其實最習慣的還是 Laravel 內用的 blade 樣板）
* Bower : 前端套件管理工具，雖然已經宣告中止開發了，也被很多人詬病，但對於我目前做的前端切版專案而已，其實滿夠用了

<a name="開發環境"></a>
## 開發環境

紀錄一下當前的開發環境，避免日後工具版本太新潮，現在這些東西又跟不上潮流，不能使用

* node v4.2.2
* npm 3.9.2
* bower 1.8.0
<!-- more -->
<a name="工具安裝"></a>
## 工具安裝

基本配備當然就是 node.js 與 npm 了，其他東西也都是透過 npm 在慢慢安裝上去的，如果連 node.js 都還沒安裝，請上[官網](https://nodejs.org/en/)下載適合自己電腦設備的檔案來安裝

1. `npm install -g bower gulp` 安裝 bower 與 gulp 到全域環境下
2. `npm install` 安裝此專案所需要套件
3. `bower install` 安裝此專案所需要前端第三方套件

<a name="目錄架構"></a>
## 目錄架構

````
目錄結構
.
├── .bowerrc
├── .eslintrc.json
├── .gitignore
├── README.md
├── assets/
│　　├── css/
│　　├── images/
│　　├── js/
│　　└── sass/
│　　　　├── main.scss
│　　　　├── modules/
│　　　　└── partials/
├── bower.json
├── bundle-vendor.config.js
├── gulpfile.js
├── package.json
├── public/
│　　├── bower/
│　　└── img/
├── templates/
│   ├── index.ejs
│   └── partials/
└── views/
````
<a name="基本概念"></a>
### 基本概念

* CSS 前端處理器使用 Sass
* HTML 樣板使用 EJS
* 自動化流程使用 Gulp
* 基本 stylesheet, javascript, images 檔案先放在 assets 下，編譯後放到 public 目錄下
* html檔案先以 ejs 格式存放在 templates 下，編譯後放到 views 目錄下
* 前端套件使用 bower 進行管理, 預設目錄放在 public/bower 下

#### assets 目錄

* sass : scss 樣式檔依據模組 or 區塊再分成兩個資料夾放，透過 main.scss 將所有檔案載入一起編譯
* css : sass編譯後產生的 css 暫存檔存放區
* js : 頁面內的 javascript 抽離至這裡撰寫, 最後編譯成單一檔案
* images : 理想中圖片都先丟到這個目錄, 壓縮後才放到 public 目錄下

#### templates 目錄

* index.ejs : 基本html檔範例, 注意上方變數 title 用來命名每個頁面標題
* partials : HTML檔部分區塊存放處

#### views 目錄

* views : ejs 產生的 html 檔存放處

#### public 目錄

* js : assets/js 編譯串接後的檔案存放處
* css : assets/sass 編譯後檔案存放處
* img : assets/image 下圖片壓縮後存放處

#### 單一檔案說明

* .bowerrc : bower 設定檔, 指定下載的套件存放目錄
* .eslintrc.json : eslint 設定檔, 用來檢查 js 語法
* .gitignore : git 要忽略的檔案設定
* bower.json : bower 安裝套件與版本
* bundle-vendor.config.js : 指定第三方套件 js 檔編譯成單一檔案，用來減少 request 數量
* gulpfile.js : gulp 指令檔案
* package.json : npm 安裝套件與版本

<a name="command"></a>
## Command

<a name="gulp"></a>
### gulp


指令       |   用途
--------- | -------------
gulp clean | 清除文件, 包含js,css,html檔
gulp html  |  建立html檔, 將ejs檔轉換成html檔案輸出
gulp styles | 建立CSS檔, 將Sass檔案轉換為單一CSS檔
gulp scripts | 建立JS檔, 將多個js檔案合併成單一JS檔案
gulp images  | 處理圖片檔, 將圖片檔進行壓縮輸出
gulp bundle-vendor | 將前端所用 3rd 套件 JS 整合成單一檔案
gulp watch | 自動偵測 scss, js, ejs 檔案變化, 執行對應動作
gulp (default) | 預設執行動作, clean -> images, bundle-vendor, styles, scripts, html
gulp **--env=production** | 輸出壓縮過的css與js檔
