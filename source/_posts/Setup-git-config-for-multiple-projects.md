---
layout: post
title: 替不同專案設定Git Config
author: Soar Lin
cdn: header-off
header-img: ''
date: 2021-08-20 11:19:31
tags:
  - Git
  - zsh
  - bash
categories:
  - Workflow
---

今天看到公司同仁分享針對不同專案設定 git config，覺得非常的受用，所以記錄一下。

開發環境描述：
1. 專案一使用的 Git 設定單純就只有 `user.name` 和 `user.email`，沒有其他額外的設定。
專案路徑：`/path/to/project1`
gitconfig 路徑: `/Users/soar/.gitconfig-project1`
gitconfig 內容
```
[user]
	name = Soar Lin
	email = soar.lin@gmail.com
[core]
	editor = vim
[color]
	ui = true
```

<!-- more -->

2. 專案二使用的 Git 設定除了上述的 `user.name` 和 `user.email` 外還有額外的設定，例如： `init.templatedir`與 `commit.template`。
專案路徑：`/path/to/project2`
gitconfig 路徑: `/Users/soar/.gitconfig-project2`
gitconfig 內容
```
[user]
	name = Soar Lin
	email = soar.lin@gmail.com
[core]
	editor = vim
[color]
	ui = true
[init]
    templatedir = /Users/soar/.git-templates
[commit]
    template = /Users/soar/.gitmessage.txt
```

# Method 1: 使用 Git 的 includeIf 設定

## Git版本需求
* git version: v2.13+

透過使用 git 本身提供的功能來根據專案目錄判斷選擇使用的 gitconfig 檔案。首先也是先寫好 `.gitconfig` 檔案，其中包含兩個不同專案的路徑與對應使用的 gitconfig 檔案。
這邊要注意的是 `.gitconfig` 檔案跟 `.gitconfig-project1` 和 `.gitconfig-project2` 檔案的路徑要一致。而這裡我都是放在我的使用者跟目錄(`/Users/soar`)下。

```
[includeIf "gitdir:/path/to/project1/"]
path = .gitconfig-project1

[includeIf "gitdir:/path/to/project2/"]
path = .gitconfig-project2
```
## 注意事項
這裡有個很重要的部分就是，在使用 includeIf 的時候，路徑的最後一定要加上 `/` 這個符號。來確定在 Linux 系統中能正確運作，如果是 Windows 系統，路徑最後一定要加上 `\` 這個符號。

這樣設定成功的話，之後在 Project 1 開發時，使用到的就會是基本的 git config 設定，而在 Project 2 開發時，在 commit 的時候就會把 `.gitmessage.txt` 設定的內容輸出到檔案中。

# Method 2: ZSH 下的解決方法

## 基本需求
* 有安裝 ZSH

解決方式是透過新增指令讓使用者可以在快速的在 Console 中輸入新增的指令來切換使用的 git config。而指令就是先將不同的 gitconfig 檔各自寫好，每次透過指令來複寫 global 的 gitconfig 檔，其實有點暴力，但也不失為一種方法。
打開編輯 `.zshrc`，在最後面加上以下指令：
```
function setproject1() {
alias cdw="cd /path/to/project1/"
cp -p ~/.gitconfig-project1 ~/.gitconfig
}

function setproject2() {
alias cdw="cd /path/to/project2/"
cp -p ~/.gitconfig-project2 ~/.gitconfig
}
```
## 注意事項
這裡要**注意**的是，在 function 裏面的 `alias` 與 `cp` 前面不要有任何空白，不然執行指令時會出現 `command not found` 的錯誤。

然後套用更新後的 `.zshrc`
```
> source ~/.zshrc

// 檢查你新增的指令
> which setproject1
function setproject1() {
alias cdw="cd /path/to/project1/"
cp -p ~/.gitconfig-project1 ~/.gitconfig
}

// 套用 project1 設定後檢查
> setproject1
> git config --list

// 檢查你新增的指令
> which setproject2
function setproject2() {
alias cdw="cd /path/to/project2/"
cp -p ~/.gitconfig-project2 ~/.gitconfig
}

// 套用 project2 設定後檢查
> setproject2
> git config --list
```

# Mothod3: 使用 bash shell 的解決方式
最原始的解決方法，也是最~~粗暴~~基本的方式，使用的方式跟先前 zsh 的解法很類似，在 `.bashrc` 中加入以下方法：

```
function setproject1() {
  set cdw='cd /path/to/project1/'
  cp -p ~/.gitconfig-project1 ~/.gitconfig
}

function setproject2() {
  set cdw='cd /path/to/project2/'
  cp -p ~/.gitconfig-project2 ~/.gitconfig
}
```
接著再套用更新後的 `.bashrc`來執行
```
// 套用 .bashrc
> source ~/.bashrc

// 執行剛才新增的方法1 & 檢查 git config
> setproject1
> git config --list

// 檢查宣告的方法1
> which setproject1
> declare -f setproject1
function setproject1() {
  set cdw='cd /path/to/project1/'
  cp -p ~/.gitconfig-project1 ~/.gitconfig
}

// 執行剛才新增的方法1 & 檢查 git config
> setproject1
> git config --list

// 檢查宣告的方法1
> which setproject1
> declare -f setproject1
function setproject2() {
  set cdw='cd /path/to/project2/'
  cp -p ~/.gitconfig-project2 ~/.gitconfig
}
```

以上大概是這次公司內部同仁分享的三種做法，真是讓我豁然開朗，之前還傻傻地透過撰寫 `alias` 來重新設定需要的參數跟移除(unset)參數，但是這做法就是久了會出現許多垃圾在 gitconfig 裏面，如下面顯示的 `init` 與 `commit`

```
> vim .zshrc

// add alias
alias setproject1="git config --global init.templatedir \"/Users/soar/.git-templates\" && git config --global commit.template \"/Users/soar/.gitmessage.txt\""
alias setproject2="git config --global --unset commit.template && git config --global --unset init.templatedir"

// apply zsh setting
> source .zshrc

// check .gitconfig
> vim .gitconfig

[user]
	name = Soar Lin
	email = soar.lin@gmail.com
[core]
	editor = vim
[color]
	ui = true
[init]
[commit]
[init]
[commit]
[init]
[commit]
```
