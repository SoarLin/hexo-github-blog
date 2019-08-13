---
layout: post
title: "MacOS 遇到 dyld: Library not loaded問題處理"
author: Soar Lin
cdn: header-off
header-img: ''
date: 2019-08-13 09:14:23
tags:
  - gettext
  - msgfmt
  - otool
  - install_name_tool
categories:
  - macOS
---


最近在處理 PHP 翻譯檔的問題，好不容易將所有翻譯的資料放到 Onesky 上後，發現下載下來的 .po 檔，要轉成 .mo 檔時，遇到了奇怪的動態庫載入問題。後來迫不得已努力的去找相關資料來解決，好不容易找到一篇教學是我可以看得懂的了。

我遇到的情況是在使用 `msgfmt` 指令將 gettext 使用到的翻譯檔 PO 轉成 MO 時，碰到下面的情況
```
$> msgfmt zoek.po -o zoek.mo
dyld: Library not loaded: /usr/local/lib/libgettextsrc-0.19.8.dylib
  Referenced from: /usr/local/bin/msgfmt
  Reason: image not found
[1]    89445 abort      /usr/local/bin/msgfmt zoek.po -o zoek.mo
```

簡單的說就是 `msgfmt` 在運行時，有些相依的動態庫檔案找不到了，而第一個遇到的是 libgettextsrc 這個檔案，因為先前透過 homebrew 安裝 gettext 時，似乎已經更新到 0.20.1 的版本，而舊的 0.19.8 的動態庫檔案可能就因為這樣失效了，所以最簡單的作法就是把 `msgfmt` 相依的動態庫黨，路徑替換成 homebrew 安裝的新版本上。

## 使用 otool 工具檢查相依性
針對一個要執行的應用程式，macOS 本身似乎提供了一個工具可以檢查所有相依的檔案位置，那就是 `otool` 關於這工具的使用方式太多了，這邊只說我會用到的部分！

檢查應用程式使用到的 libraries 檔案，指令 `otool -L <ApplicationName>`
所以用來檢查 msgfmt 後可發現使用到了不少 dylib 檔案
```
$> otool -L /usr/local/bin/msgfmt
/usr/local/bin/msgfmt:
    /System/Library/Frameworks/CoreFoundation.framework/Versions/A/CoreFoundation (compatibility version 150.0.0, current version 1454.90.0)
    /usr/local/lib/libgettextsrc-0.19.8.dylib (compatibility version 0.0.0, current version 0.0.0)
    /usr/local/lib/libgettextlib-0.19.8.dylib (compatibility version 0.0.0, current version 0.0.0)
    /usr/lib/libxml2.2.dylib (compatibility version 10.0.0, current version 10.9.0)
    /usr/lib/libncurses.5.4.dylib (compatibility version 5.4.0, current version 5.4.0)
    /usr/local/opt/libunistring/lib/libunistring.2.dylib (compatibility version 4.0.0, current version 4.0.0)
    /usr/local/lib/libintl.9.dylib (compatibility version 11.0.0, current version 11.4.0)
    /usr/lib/libiconv.2.dylib (compatibility version 7.0.0, current version 7.0.0)
    /usr/lib/libSystem.B.dylib (compatibility version 1.0.0, current version 1252.50.4)
```

而一開始遇到的 libgettextsrc-0.19.8.dylib 這連結已經失效，所以需要手動替換成 homebrew 安裝 gettext 0.20.1 版本下的檔案，而透過 homebrew 安裝的程式，路徑大多位於 `/usr/local/Cellar/` 下面，所以在下面找一下 gettext 後可以再看到裡面有 lib 的資料夾，而資料夾下應該就是這次所需要的相關的 dylib 檔案了

## 使用 install_name_tool 修正 dylib 路徑

```
install_name_tool <OldPath> <NewPath> <ApplicationPath>
```
這時候我們可以使用 `install_name_tool` 這個指令來手動更換 dylib 檔案路徑，使用的方式大致上如上

```
/usr/local/lib/libgettextsrc-0.19.8.dylib
/usr/local/lib/libgettextlib-0.19.8.dylib
/usr/local/lib/libintl.9.dylib
```
而在修正 `msgfmt` 遇到的問題時，前後總共發現了上面三個 dylib 路徑遺失

```
install_name_tool -change /usr/local/lib/libgettextsrc-0.19.8.dylib /usr/local/Cellar/gettext/0.20.1/lib/libgettextsrc-0.20.1.dylib /usr/local/bin/msgfmt
install_name_tool -change /usr/local/lib/libgettextlib-0.19.8.dylib /usr/local/Cellar/gettext/0.20.1/lib/libgettextlib-0.20.1.dylib /usr/local/bin/msgfmt
install_name_tool -change /usr/local/lib/libintl.9.dylib /usr/local/Cellar/gettext/0.20.1/lib/libintl.8.dylib /usr/local/bin/msgfmt
```
所以使用 install_name_tool 修正的指令，大概就像上面這樣

在替換完這些 dylib 後，就可以正常的使用 `msgfmt` 來轉換 po 檔成 mo 檔了

```
msgfmt oooo.po -o xxxx.mo
```

沒想到 blog 隔了快一年才更新這麼一篇文章，好慘！從每月一篇到每季一篇，現在直接升級到每年一篇....XD