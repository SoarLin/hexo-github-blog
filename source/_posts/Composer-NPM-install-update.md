---
layout: post
title: Composer與NPM指令 install 與 update 的差異
author: Soar Lin
cdn: header-off
header-img: ''
date: 2017-04-21 13:29:48
tags:
  - Composer
  - NPM
  - PHP
  - Node.js
categories:
  - PHP
---

> 其實這是一篇偽技術文，實際上是最近面試的心得文

前陣子接連不斷的面試，讓我也學到了不少，有些公司技術背景不錯的，就會由淺入深的問，也有面試官人很好的，類似聊天方式的相互交流技術資訊，整個面試完都沒發現其實自己很多答不出來的東西，都還是面試官經驗分享讓我學習不少，可惜沒有緣分一起合作。

面試找工作真的是一件勞心勞力的事，有些比較體恤求職者的，就會是一試定江山，有些比較謹慎找人的，就會有兩三次的面試流程，也因為這樣從投遞履歷到收到 Offer, 感謝函, 無聲卡等過程所經歷的時間實在是很難掌握，最後會到哪上班似乎也是種緣份！

這裡分享一下之前被問到的一點點東西，原因是自己真的沒弄懂，趁現在來紀錄一下，希望以後要是再被問到，不要又回答錯了。

<!-- more -->
# Composer 基本用法

這裡就不在寫啥是 Composer 了，簡單來說就是開發 PHP 專案時，一個用來方便安裝使用第三方套件的工具，使用上會有一個 `composer.json` 的相依套件描述檔案。並在安裝過套件後，會產生一份 `composer.lock`，如果有使用 Git 這類版本控管工具的話，建議這兩個檔案都要加入追蹤。

## Composer.lock

在安裝過相依套件後，會在專案底下額外產生一份 `Composer.lock` 檔案來鎖定目前安裝的相依套件版本與資訊，之後再執行 `install` 指令時，會先檢查這份 lock 檔案來安裝，所以當有版本變更或新增套件時，也是會更新這份資料

## Composer install

當 `composer install` 指令執行時，會依序執行以下行為

* 檢查 **composer.lock** 檔案是否存在
  * No, 檔案不存在，改以執行 `composer update` 來建立
  * Yes, 檔案存在，根據 lock 檔內描述安裝指定套件版本
    * 已存在套件可能會更新版本
    * 若有新增套件，安裝新套件

## Composer update

當執行 `composer update` 時，會依序執行以下行為

* 檢查 `composer.json` 檔案
* 根據 `composer.json` 內的套件版本規格，安裝最新一版
* 安裝後更新資訊到 `composer.lock` 檔案內

## 小結

當初開發的專案`composer.lock`被加到`.gitignore`內，導致後來每次使用 composer 安裝套件的時候，到別人的機器或 server 上就會問題重重，正確的作法應該是要保留`composer.lock`檔到 git repository 內，等其他人需要更新時，透過 `composer install` 來安裝每次變更的紀錄就好

# NPM 基本介紹

由於太多處理是要透過後端執行的 Node.js，所以也勢必要學一下 npm 這東西，透過 Node.js 官網提供的檔案安裝後，其實就會將 Node.js 與 NPM 一起裝好，而 NPM(Node Package Manager) 也就是 Node.js 的一些套件管理工具。

> 目前用自己最多的還是在使用前端自動化工具 Gulp 時，需要安裝許多套件來加速前端自動化處理的流程，在還不知道 Gulp 或是 Grunt 之前，我只能自己土炮 shell script 來跑一些 css, js comporess, concat 等行為。原本想學 Grunt 但是天資不夠聰穎，還沒學會前就跳槽到 gulp 了，沒想到還挺好上手的

使用 npm 來進行套件管理時，專案下可先透過 `npm init` 來產生一份 `package.json` 檔案，而之後安裝過的套件記得用 `--save` (or `--save-dev`) 的參數來將套件名稱與版號加入 `package.json` 內

## NPM 基本指令

````
# 顯示套件相關資訊
npm show <package>

# 安裝相關套件
npm install

# 安裝指定套件
npm install <package>

# 升級所有套件
npm update

# 升級指定套件
npm update <package>

# 刪除套件
npm uninstall <package>

# 套件清單
npm list
````

## npm install vs npm update

這裡可以參考 stack overflow 的一篇[精美解釋](http://stackoverflow.com/questions/12478679/npm-install-vs-update-whats-the-difference)

````
{
  "name":          "my-project",
  "version":       "1.0",                             // install   update
  "dependencies":  {                                  // ------------------
    "already-installed-versionless-module":  "*",     // ignores   "1.0" -> "1.1"
    "already-installed-semver-module":       "^1.4.3" // ignores   "1.4.3" -> "1.5.2"
    "already-installed-versioned-module":    "3.4.1"  // ignores   ignores
    "not-yet-installed-versionless-module":  "*",     // installs  installs
    "not-yet-installed-semver-module":       "^4.2.1" // installs  installs
    "not-yet-installed-versioned-module":    "2.7.8"  // installs  installs
  }
}
````

以上可以看出，`npm install` 基本上就是將尚未安裝過的 module 安裝進去，而 `npm update` 除了安裝 module 外，還會將已經安裝過的 module，根據版號描述去更新最新版本

## 小結

記得面試時，面試官問了這幾個指令的差異，但因為我印象中 npm 與 composer 在各自的 install 與 update 行為上似乎是相反的(※正確來說應該是 install 針對已安裝套件有些微不同處理)，但當時聽完說明後又有點不清楚，所以決定花點時間查詢並且做一下記錄



# Reference

[Composer基本用法](https://getcomposer.ycnets.com/doc/01-basic-usage.md)

[Composer: It’s All About the Lock File](https://blog.engineyard.com/2014/composer-its-all-about-the-lock-file)

[[Node.js]Node.js & NPM 安裝(建立開發環境)](http://blog.johnsonlu.org/node-jsnode-js安裝建立開發環境/)

[npm install vs. update - what's the difference?](http://stackoverflow.com/questions/12478679/npm-install-vs-update-whats-the-difference)
