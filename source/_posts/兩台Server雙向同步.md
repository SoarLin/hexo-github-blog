---
layout: post
title: 兩台Server雙向同步
author: Soar Lin
cdn: header-off
header-img: ''
date: 2016-08-29 00:14:49
tags:
 - linux
 - sync
 - unison
 - inotifywait
categories:
 - Linux
---
<!-- MarkdownTOC -->

- [兩台 Server 雙向同步](#兩台-server-雙向同步)
    - [使用排程來同步](#使用排程來同步)
    - [偵測檔案變化來同步](#偵測檔案變化來同步)
    - [停止偵測](#停止偵測)

<!-- /MarkdownTOC -->



<a name="兩台-server-雙向同步"></a>
# 兩台 Server 雙向同步

- 同步工具 - unison ([參考連結](http://xmodulo.com/synchronize-files-between-two-servers.html))
- 排程工具 - crontab
- 目錄偵測工具 - inotifywait ( inotify-tools )

* 請先安裝 unison

````bash
sudo apt-get install unison
````
* 撰寫副檔名為 .prf 的設定檔(e.g. sync.prf)，請在自己的家目錄下新增 .unison 資料夾來放設定檔 ($HOME/.unison)
* 下面是網站上提供的範例，感覺很夠用了

````bash
# Two root directories to sync.
# You can use ssh:// to sync over SSH
root = /home/alice/sync_folder
root = ssh://dev@192.168.1.10//home/alice/sync_folder

# If you want one-way mirroring from one replica to the other, specify the source replica using "force" as follows.
# force = /home/alice/sync_folder

# If you want Unison to run without any user input, try "batch" mode.
batch = true

# If you don't want to be prompted, and just accept Unison's recommendation:
auto = true

# Optionally, you can sync specific sub directories only (under the root).
# path = dir1
# path = dir2

# Optionally, you can ignore specific files or directories that are matched with regular expressions.
# ignore = Name *.o
# ignore = Name *~
# ignore = Path */temp/archive_*

# If you want to ignore difference in file props:
perms = 0
````

* 確定兩台主機都可以使用 SSH 連到對方，中間牽涉到一些問題，比如：
    * 登入帳號是否具備有同步目錄以及子目錄的操作權限
    * 若要排程同步就要注意帳號登入問題，最好是都將對方的 SSH public key 加到 authorize_keys，免密碼登入
* 執行雙向同步測試，檢查結果

````bash
unison sync
````

正常的結果如下：

````bash
Contacting server...
Connected [//local//home/alice/sync_folder -> //remote_host//home/alice/sync_folder]
Looking for changes
  Waiting for changes from server
Reconciling changes
new file -->            document1.pdf
         <-- new file   my.jpg
Propagating updates
UNISON 2.40.63 started propagating changes at 21:19:13.65 on 20 Sep 2013
[BGN] Copying document1.pdf from /home/alice/sync_folder to //remote_host//home/alice/sync_folder
[BGN] Copying my.jpg from //remote_host//home/alice/sync_folder to /home/alice/sync_folder
[END] Copying my.jpg
[END] Copying document1.pdf
UNISON 2.40.63 finished propagating changes at 21:19:13.68 on 20 Sep 2013
Saving synchronizer state
Synchronization complete at 21:19:13  (2 items transferred, 0 skipped, 0 failed)
````

* 如果出現一些什麼 Permission denied 的訊息，應該就是資料夾權限問題，因為我一直遇到，所以才會一直寫出來，希望別再犯傻

<a name="使用排程來同步"></a>
## 使用排程來同步

* 若要排程同步，可以使用 crontab，編輯排程工作

````bash
crontab -e

# 然後加上指令(下面範例為，每15分鐘同步一次)
*/15 * * * * /usr/bin/unison sync
````


<a name="偵測檔案變化來同步"></a>
## 偵測檔案變化來同步

* 覺得排程同步不夠直接，改用事件觸發，當目錄下有新增檔案，就觸發同步指令
* 監測目錄內檔案是否有新增，使用 inotifywait 指令，需要先安裝 inotify-tools

````
sudo apt-get install inotify-tools
````

* 撰寫偵測指令的 script 檔

````bash
vim watch.sh

# 檔案內容如下

#!/bin/bash
while true; do inotifywait -e create -e moved_to -r 監測目錄 && /usr/bin/unison sync; done
````

* 更改 script 檔權限為可執行 `chmod a+x watch.sh`
* 背景執行 script 來常駐偵測動作 `./watch.sh &`

<a name="停止偵測"></a>
## 停止偵測

* 注意事項，要停止偵測動作的時候，先停止 script 的執行，然後在停止偵測指令
* 先查詢 script 的 process id `ps aux | grep watch.sh`

````
ubuntu   29247  0.0  0.2  11028  1384 pts/0    S    10:13   0:00 /bin/bash ./watch.sh
````
* 刪除 script 的 process `kill 29247`
* 在查詢 inotifywait 的 process id `ps aux | grep inotifywait`

````bash
ubuntu   29466  0.0  0.1   6596   704 pts/0    S    10:15   0:00 inotifywait -e crea…
````
* 刪除偵測的 process `kill 29466`
