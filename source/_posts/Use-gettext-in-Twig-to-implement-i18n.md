---
layout: post
title: Slim 3 + Twig 實作多語系版本(i18n)
author: Soar Lin
cdn: header-off
header-img: 'https://soarlin.github.io/images/php/twig_i18n.png'
date: 2017-06-22 07:58:35
tags:
  - i18n
  - twig
  - slim 3
  - gettext
categories:
  - PHP
---

# 前<del>廢</del>言

原本就認為做個多語系，應該不會太簡單，先撇除掉翻譯的問題，以前使用的 Laravel 裡面，已經有相關套件以及預留好的語系檔存放路徑了，要實作的話應該不會是太大問題，但是換了 Slim 3 這個極其精簡的框架後，想要什麼功能，就得自己找出方法加進去，雖然大部分都有相關模組或套件可以使用，不過還是得花上一些學習成本上去，較為費時，但也可以多學一些東西。

這篇也不是要從頭教學，畢竟網路上相關的教學文章已經很多了，我只是記錄一下學習過程中，一些基本的步驟以及該注意的小東西。

# 實作步驟

網路上搜尋關於 slim 3 + i18n，出現的文章其實都有段時間了，有時候跟著做到後來，發現似乎不合用，所以這裡記錄一下，希望能夠幫助到其他有需要的人(或是兩個月後的自己)

其實歸納到最後，是使用 PHP 推薦的 [gettext](http://php.net/manual/en/book.gettext.php) 的方式來實踐多語系版本，而 slim 3 搭配的樣版引擎 Twig，本身也有提供 Extension 套件(i18n)來實作，所以找到 gettext 的教學文章，看懂基本原理後，再搭配 twig i18n 的套件來實作，底下收錄我後來覺得最實用的參考文章

## 參考資料

* [Easy Multi-Language Twig Apps with Gettext](https://www.sitepoint.com/easy-multi-language-twig-apps-with-gettext/)
* [Twig-extensions - The i18n Extension](http://twig-extensions.readthedocs.io/en/latest/i18n.html)

其實可以多找幾篇看，不過第一篇應該已經是精華的集大成者了。

## 步驟記錄

* 安裝 Twig Extension - i18n
  * `composer require twig/extensions`
* 在自己專案內新增要放多國語系檔的目錄 `./resource/lang`

````
# 專案路徑
PROJECT
├── app            # 主要 PHP 程式目錄
├── bootstrap
│   └── app.php    # 程式起始檔案
├── resources
│   ├── assets     # js/css/font/images 等資源目錄
│   ├── lang       # 多國語言檔案目錄
│   └── views      # twig 樣板目錄
├── vendor
├── ...
└── ...

````

* 建立一份語言範本檔 (.pot)  `./resource/lang/message.pot`，

````
# SOME DESCRIPTIVE TITLE.
# Copyright (C) YEAR THE PACKAGE'S COPYRIGHT HOLDER
# This file is distributed under the same license as the PACKAGE package.
# FIRST AUTHOR <EMAIL@ADDRESS>, YEAR.
#
#, fuzzy
msgid ""
msgstr ""
"Project-Id-Version: PACKAGE VERSION\n"
"Report-Msgid-Bugs-To: \n"
"POT-Creation-Date: 2016-04-10 10:44+0000\n"
"PO-Revision-Date: YEAR-MO-DA HO:MI+ZONE\n"
"Last-Translator: FULL NAME <EMAIL@ADDRESS>\n"
"Language-Team: LANGUAGE <LL@li.org>\n"
"Language: \n"
"MIME-Version: 1.0\n"
"Content-Type: text/plain; charset=CHARSET\n"
"Content-Transfer-Encoding: 8bit\n"

#: public/i18n.php:13
msgid "HELLO_WORLD"
msgstr ""
````

* 使用 .pot 檔來建立不同語系的 .po 檔 (人類看得懂的語言包索引檔)
** 根據 gettext 的實作原則，多語系的目錄下，根據每個語系再產生類似 `語系/LC_MESSAGES` 的目錄, e.g. `en_US/LC_MESSAGES` or `zh_TW/LC_MESSAGES`

````shellscript
msginit --locale=en_US --output-file=resources/lang/en_US/LC_MESSAGES/message.po --input=resources/lang/message.pot

msginit --locale=zh_CN --output-file=resources/lang/zh_CN/LC_MESSAGES/message.po --input=resources/lang/message.pot

msginit --locale=zh_TW --output-file=resources/lang/zh_TW/LC_MESSAGES/message.po --input=resources/lang/message.pot
````

* 編輯 .po 檔裡的語言翻譯
* 編輯完成後，產生 .mo 檔 (給機器讀取的語言包檔案)

````shellscript
msgfmt -c -o resources/lang/en_US/LC_MESSAGES/message.mo resources/lang/en_US/LC_MESSAGES/message.po

msgfmt -c -o resources/lang/zh_CN/LC_MESSAGES/message.mo resources/lang/zh_CN/LC_MESSAGES/message.po

msgfmt -c -o resources/lang/zh_TW/LC_MESSAGES/message.mo resources/lang/zh_TW/LC_MESSAGES/message.po
````

* 這時候整個語言包的目錄大致上會長這樣，到這邊已經把基本架構做好了

````
./resource/lang
├── en_US               # english
│   └── LC_MESSAGES
│       ├── message.mo
│       └── message.po
├── zh_CN               # 简体中文语言
│   └── LC_MESSAGES
│       ├── message.mo
│       └── message.po
├── zh_TW               # 繁體中文語言
│   └── LC_MESSAGES
│       ├── message.mo
│       └── message.po
└── message.pot         # 語言包範本
````

* 接著才進入到 twig i18n 套件的使用

接下來其實就參考 [Twig-extensions - The i18n Extension](http://twig-extensions.readthedocs.io/en/latest/i18n.html) 這邊的方式，大致上應該就可以做出來啦！

# 注意事項

這個真的非常重要，因為我為了這奇怪的問題，鬼打牆一整天(絕對不是因為那陣子剛好在看鬼吹燈的關係)，由於 PHP 檔案在執行當下會編譯出機器碼並且快取起來，所以有時候語言包更新了，卻發現網頁上要顯示的翻譯文字出不來，只會顯示 .po 檔裡的 msgid 字串，而不是對映出來的 msgstr 的翻譯內容，這時候絕對不是你程式碼有寫錯(前提是你真的沒寫錯)，只是先前的翻譯資料被 cache 了，而我也找不到該去哪清理這 cache，後來找到的解決辦法是 **Apache 重啟**，我知道這招很爛，但是很管用

## 解決 gettext 無法正常顯示方法

````
# on Mac OS
sudo apachectl restart

# on Ubuntu
sudo service apache2 restart
````

但是有時候 Server 上的機器，可不是隨隨便便就可以將 web server 重啟，所以同事幫忙找了另一個解決辦法，雖然我實際測試後，效果不如預期，還是有可能會失敗，不過還是提供來參考

[How to clear php's gettext cache without restart Apache nor change domain?](https://stackoverflow.com/questions/13625659/how-to-clear-phps-gettext-cache-without-restart-apache-nor-change-domain)

原理是，在語言目錄下，建立一個虛擬目錄連結(nocache)，指向原本目錄(.)

````
cd resource/lang
ln -s . nocache
````

然後在 bindtextdomain 的時候，先指向 nocache 目錄，再指向正確目錄

````
bindtextdomain('message', './resources/lang/nocache');
bindtextdomain('message', './resources/lang/');
````

## 翻譯語言內，增加變數(動態資料)顯示

根據 [twig extension - i18n](http://twig-extensions.readthedocs.io/en/latest/i18n.html) 的教學文件提到，可以在翻譯的文字內使用 %name% 之類的方式來插入變數

舉個例子

* 「Congratulations! You get xxx points」
* 「恭喜你！獲得 xxx 分」

當中的 xxx 就是要替換的變數，確定好 PHP 程式從 Controller 傳給 View (twig template) 的變數名稱，比方說是 `score`，那麼在 .po 檔裡面大概長這樣

````
msgid "Congratulations! You get %score% points"
msgstr "恭喜你！獲得%score%分"
````

在 Controller 裡，要將變數 `$score` 傳給 View，而到了 .twig 檔裡面，使用雙括號來顯示變數 `{{ score }}`，大致如下所示：

````
<p>
  {% trans %}
    Congratulations! You get {{ score }} points
  {% endtrans %}
<p>
````

# 後記

原本以為都改好可以正常運作了，程式碼 deploy 到 server 上才發現更可怕的事實，辛辛苦苦做好的多語系功能完全無法執行...WTF。好在有另外寫一個測試的檔案，可以很快看出是 setlocale 這個 function 無法順利執行，上網查了一些解決方法，提供以下兩個連結。

[PHP setlocale has no effect](https://stackoverflow.com/questions/10909911/php-setlocale-has-no-effect)
[setlocale() returns false](https://stackoverflow.com/questions/3694294/setlocale-returns-false)

我看完這兩篇後，大概就是以下幾個步驟：

* 先檢查 server 上可設定的語系

````
locale -a

# 原本只能看到以下幾個
C
C.UTF-8
en_US.utf8
POSIX
````

而我需要有zh_TW, zh_CN, ja_JP，所以需要自行在安裝這幾個語系的檔案

*備註: 這是在 Ubuntu 14.04 環境下*
````
sudo /usr/share/locales/install-language-pack zh_TW
sudo /usr/share/locales/install-language-pack zh_CN
sudo /usr/share/locales/install-language-pack ja_JP
````

如果是 *Ubuntu 16.04* ，在 zh_TW 與 zh_CN，就需要換成 `zh_TW.UTF-8` 與 `zh_CN.UTF-8`，所以指令會變成下面這樣
````
sudo /usr/share/locales/install-language-pack zh_TW.UTF-8
sudo /usr/share/locales/install-language-pack zh_CN.UTF-8
sudo /usr/share/locales/install-language-pack ja_JP
````

其實都到這裡了，應該要可以跑吧！**但是**還是沒那麼簡單，因為 Mac OSX 的系統與 Ubuntu 系統內的名稱還是不太一樣


MAC OSX下的`locale -a`可以看到，語系種類非常多種，跟剛剛在 server 上看到那兩三個相差甚遠
````
en_US
en_US.ISO8859-1
en_US.ISO8859-15
en_US.US-ASCII
en_US.UTF-8

...

ja_JP
ja_JP.eucJP
ja_JP.SJIS
ja_JP.UTF-8

...

zh_CN
zh_CN.GB2312
zh_CN.GBK
zh_CN.UTF-8

zh_TW
zh_TW.Big5
zh_TW.UTF-8
````

而要注意的是，原本程式內寫的 `setlocale(LC_ALL, 'zh_TW');` 到了 server 上就要跟著調整成 `setlocale(LC_ALL, 'zh_TW.utf8');` 大概做完這些動作，我辛辛苦苦做好的多語系版本總算可以運作了，就甘心！

P.S. 有時候 server 需要更新一下 locale，指令是 `sudo dpkg-reconfigure locales`