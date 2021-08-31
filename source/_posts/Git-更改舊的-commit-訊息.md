---
layout: post
title: Git 更改舊的 commit 訊息
author: Soar Lin
cdn: header-off
header-img: ''
date: 2021-08-31 16:47:46
tags:
  - Git
categories:
 - Server
---

記錄一下怎麼使用 git 指令來修改舊的 commit 訊息。

# 修改當前 commit 訊息

這應該是最基本的指令，透過 `--amend` 來修改當前的 commit 訊息。
可以一行指令來直接更新成新的 commit 內容

```bash
$ git commit --amend -m "New commit message."
```
<!-- more -->

或是執行下面的指令來進入 git 編輯模式更改原本的 commit 訊息
```bash
git commit --amend
```

# 修改歷史 commit 訊息
如果目前的情況是，想要修改之前某一筆 commit 的訊息，就得用 `git rebase -i HEAD~N` 的方式來修改了。其中的 N 是要修改的 commit 數量，所以如果要改的是之前的第四筆資料，就是 `git rebase -i HEAD~4`。這時會出現類似下面的畫面：
這時會將 {% label success@HEAD~4 %} 到 {% label success@HEAD %} 的訊息列出，就是{% label danger@最後四筆 commit 倒序列出來%}。
```bash
$ git rebase -i HEAD~4
pick 873dfac Rename file name
pick f7f3f6d Change my name a bit
pick 310154e Update README formatting and add blame
pick a5f4a0d Add cat-file

# Rebase 710f0f8..a5f4a0d onto 710f0f8
#
# Commands:
# p, pick <commit> = use commit
# r, reword <commit> = use commit, but edit the commit message
# e, edit <commit> = use commit, but stop for amending
# s, squash <commit> = use commit, but meld into previous commit
# f, fixup <commit> = like "squash", but discard this commit's log message
# x, exec <command> = run command (the rest of the line) using shell
# b, break = stop here (continue rebase later with 'git rebase --continue')
# d, drop <commit> = remove commit
# l, label <label> = label current HEAD with a name
# t, reset <label> = reset HEAD to a label
# m, merge [-C <commit> | -c <commit>] <label> [# <oneline>]
# .       create a merge commit using the original merge commit's
# .       message (or the oneline, if no original merge commit was
# .       specified). Use -c <commit> to reword the commit message.
#
# These lines can be re-ordered; they are executed from top to bottom.
#
# If you remove a line here THAT COMMIT WILL BE LOST.
#
# However, if you remove everything, the rebase will be aborted.
#
# Note that empty commits are commented out

```

接著找到要修改的 commit 訊息後，將前方的 pick 更換成 reword，後存檔離開。

> pick 873dfac Rename file name
> {% label primary@reword %} f7f3f6d Change my name a bit
> pick 310154e Update README formatting and add blame
> {% label primary@reword %} a5f4a0d Add cat-file
>

然後就會依序出現被選出來修改的 commit 的編輯畫面，這時候再進行修改即可。

```bash
Change my name a bit

# Please enter the commit message for your changes. Lines starting
# with '#' will be ignored, and an empty message aborts the commit.
#
.....
```
```bash
Add cat-file

# Please enter the commit message for your changes. Lines starting
# with '#' will be ignored, and an empty message aborts the commit.
#
.....
```

# 參考資料
* [How to Change a Git Commit Message](https://linuxize.com/post/change-git-commit-message/)
* [7.6 Git Tools - Rewriting History](https://git-scm.com/book/en/v2/Git-Tools-Rewriting-History)
