---
layout: post
title: 工作筆記之PHP PSR-4 autoload
author: Soar Lin
cdn: header-off
header-img: ''
date: 2017-05-14 20:53:14
tags:
 - slim
 - autoload
 - composer
 - psr-4
categories:
 - PHP
---

# 前情提要

最近手上的工作接手了一個很精簡的 PHP 專案，但是收到的消息是之後要針對這個站台增加許多功能、版面大改，因為是個以前沒碰過的 PHP 框架做成的專案(Slim Framework)，所以一開始花了很多時間在看 Framework 的使用，以及了解前人使用這框架開發的架構。

原本有幾度想整個換成熟悉的 Laravel，但是又覺得整個打掉重練不曉得要花多久，雖然內心是覺得原本站台還不複雜應該可以在一週內換框架重建，最後還是放棄這個誘人的想法，決定好好在熟悉新環境的開發模式。

一開始將前端的開發，建立起一些自動化處理的流程，透過 bower 來管理 3rd 套件，導入 Scss 來替以後切版做打算，利用 Gulp 來將 js/css 等檔案打包以及加上亂數版號，等這一切都處理得差不多其實也花了約兩天了，接著先開始研究增加登入(FB註冊登入)等流程，目前專案內並不直接存取資料庫，所有的資料存取行為全都是透過 API 的方式來實現，讓我有點突發奇想的乾脆全部頁面都用前端框架 Vue framework 來做好了，可是這樣會增加太多技術債，這兩天已經增加的夠多了。

為了記住登入的使用者資訊，還是先從簡單的 PHP 寫 Session or Cookie 開始吧！因為考量到還沒開始使用 redis 來存取 Session，而正式部署的機器不只一台的情況，就先放棄 Session 這個方式，改以 Cookie 的方式來著手，可是花了一天的時間不段的嘗試，只要我在 Controller 內將 cookie 存好，透過 route 切換到新頁面，cookie 就會神秘的消失，即使後來看到 Slim Framework 官網上建議使用 [FIG Cookies](https://github.com/dflydev/dflydev-fig-cookies)，還是一直搞不清處為何 Request, Response 兩邊都去寫 cookie 了，透過 route 導向新頁面一樣無效...XD，最後經過一天的努力，宣告不治，放棄治療

後來在找資料的同時有看到一個 Slim Framework 的教學影片，看著裡面逐步用一個精簡的框架打造成小有規模的架構，覺得很感動，所以隔天一早就開始了把現有的結構調整一下，看著目錄架構慢慢接近熟悉的 laravel 有點小感動，而且在電腦上運行都很正常，直到我把 code push 上去接著到測試機器上面測試後，發現糟糕了...出事了！

# 釐清問題

由於將整個 Namespace 下的程式目錄名字更換了，所以特別記得要執行 `composer dump-autoload`，甚至在 Jenkins build 上也多加了這條指令，確保 build 完打包起來的程式碼是有引用到更換目錄名稱的 class，為了確定編譯後的程式碼，還特地把 jenkins 編譯後的檔案整包抓回本機測試，依然可以正常運行，但是上了測試機，就一直出現 Class not found 的錯誤訊息

後來真的沒辦法，只好請同事幫忙找找看問題，最後同事土法煉鋼的慢慢抽絲剝繭發現，我的目錄名稱跟寫在程式碼裡面的 Namespace 大小寫不一樣....WTF。原本的 namespace 幾乎都是用小寫的，後來我把幾個字眼的首字改成大寫，如: Controller, Models, ... 等，但是原本資料夾都還是維持全部小寫的名稱，而這是因為在 Mac 的作業系統下，引用檔案時會忽略大小寫，而在 Linux 下的 Apache 可是有區分大小寫的，所以這起慘案就在神隊友的幫助下，順利解決了！

# 重點

這次更改整個程式目錄架構的過程中，其實也學到不少東西，一個是PHP PSR-4 的 Autoload 機制，因為 namespace 目錄名稱換掉的關係，所以了解到要去 Composer.json 裡面把 autoload 下面 psr-4 的對應目錄做更換，而且還需要執行 `composer dump-autoload` 來重新產生 autoload 的所指定的檔案路徑

另一個是 Mac 跟 Linux 環境針對大小寫的判斷，原本印象中 Linux 上是沒有特別區分大小寫的，不過看來真的是自己記錯了，希望以後不要再被大小寫這問題給陰了(印象中以前好像已經有過一次了)

# Reference

原文參考：
[PSR-4: Autoloader](http://www.php-fig.org/psr/psr-4/)

中文參考：
[PHP PSR-4 Autoloader 機制](http://blog.tonycube.com/2016/09/php-psr-4-autoloader.html)

其他參考：
[代碼、原始碼寫作風格 PSR-4 - PHP編碼規範](http://blog.webgolds.com/view/230#PSR-4)
[Apache 設定忽略檔案字母大小寫](https://www.phpini.com/apache/apache-case-insensitive-mod_speling)