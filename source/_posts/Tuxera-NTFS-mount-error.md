---
layout: post
title: Tuxera NTFS mounting error - kDAReturnExclusiveAccess
author: Soar Lin
cdn: header-off
header-img: 'https://i.imgur.com/0zWnvlQ.jpg'
date: 2023-07-28 19:37:15
tags:
  - NTFS
  - Tuxera
categories:
  - macOS
---

最近幾週開始發現之前花錢買的 **MICROSOFT NTFS FOR MAC** 這套軟體，常常掛載了外接硬碟後，卻變成只能讀取無法寫入，之前試著重新下載安裝程式重裝＋重開機，確實有恢復過幾次，不過最近幾次想寫入外接硬碟就發現怎麼試都無效了。

<!-- more -->

本來想去官網上的 Support 找看看有沒有答案或著有沒有售後服務的方式可以聯繫請對方幫忙處理，好歹當初也是花錢買的軟體，為了裝這軟體還得先學會怎麼重開機近入開機選項去調整系統安全性後才能順利安裝軟體

How to install Microsoft NTFS for Mac by Tuxera 2021 (with macOS Monterey support)
Youtube: https://youtu.be/J8rn0skFJfs

在試著重新卸載外接硬碟 -> 重新掛載外接硬碟後，這時候就會出現類似底下的錯誤訊息
```
Error while mounting disk6s1: kDAReturnExclusiveAccess
```
拿著關鍵字去查了 google，也只是知道了這是 Apple Developer 裡面寫道的一個 function

![tuxera-mounting-error](https://i.imgur.com/aK2Bh9S.png)

好在找到一篇一樣使用 Tuxera NTFS 遇到問題的文章，雖然問題不同，不過情況很相似，都是掛載外接硬碟時會報錯。

> [系统更新后，无法在 macOS Catalina 上挂载 NTFS 卷](https://tp.miaosuwulimi.cn/w/383.html)

## Solution
雖然不確定原因是否也是因為 MacOS 更新了之後造成的問題，不過根據該篇文章的方式實際操作後，外接硬碟掛載後又可以寫入了，也算是解決的目前的問題。

### Manually mount the disk
請先透過 Tuxera 的 Disk Manager 將外接硬碟卸載，接著打開終端機(Terminal)，手動建立掛載點
```bash
sudo mkdir /Volumes/MyDisk
```
接著可使用 `diskutil list` 來找出目前掛在硬碟的標示號，我的目前是 **disk6s1**

![diskutil list](https://i.imgur.com/IWDskfC.png)

最後，透過 Tuxera 的程式手動掛載硬碟到剛剛新增的掛載點 (記得更換掉 **disk6s1** 成自己的硬碟標示號)
```bash
sudo /Library/Filesystems/tuxera_ntfs.fs/Contents/Resources/mount_tuxera_ntfs -o nodev -o noowners -o nosuid /dev/disk6s1 /Volumes/MyDisk
```

接下來就可以透過 Finder 讀寫這個外接硬碟了

如果有多個外接硬碟，那就...自己新增多個掛載點，然後一個一個手動掛載過去
另外，最好將這些操作另外寫一個 shell script 檔，好讓你每次發現無法寫入外接硬碟時可以快點操作的


```bash
> vi automount.sh

# 底下為參考的 shell script 內容，如果有多個就重複 mkdir 以及 mount 的指令吧
------------------------------------------------
#!/bin/sh
mkdir mkdir /Volumes/MyDisk
/Library/Filesystems/tuxera_ntfs.fs/Contents/Resources/mount_tuxera_ntfs -o nodev -o noowners -o nosuid /dev/disk6s1 /Volumes/MyDisk
------------------------------------------------

# 將 .sh 檔改為可執行權限
> chmod a+x automount.sh

# 執行時，記得加上 sudo 並且輸入 Administration 的密碼
> sudo sh automount.sh
```

當然還是希望 Tuxera 團隊可以早點解決這問題，不然也不是每個買這軟體的人都還會操作終端機，做這些工程化的操作。

## Reference
* [系统更新后，无法在 macOS Catalina 上挂载 NTFS 卷](https://tp.miaosuwulimi.cn/w/383.html)