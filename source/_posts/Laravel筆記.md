---
layout: post
title: Laravel筆記
date: 2016-08-27 19:12:59
update: 2016-08-27 19:19:59
tags:
 - Laravel
 - artisan
 - elixir

categories:
 - PHP

---
<!-- MarkdownTOC -->

- [Artisan 操作](#artisan-操作)
  - [建立 Controller](#建立-controller)
  - [建立 Model](#建立-model)
  - [建立 Migration \(建立資料表格\)](#建立-migration-建立資料表格)
  - [建立 Seeder \(表格初始資料\)](#建立-seeder-表格初始資料)
  - [使用 Elixir](#使用-elixir)
- [取出最後一筆Query](#取出最後一筆query)
  - [Laravel 5](#laravel-5)
  - [Laravel 4](#laravel-4)

<!-- /MarkdownTOC -->


<a name="artisan-操作"></a>
# Artisan 操作
<a name="建立-controller"></a>
### 建立 Controller
* `php artisan make:controller 目錄/檔案名稱`

<a name="建立-model"></a>
### 建立 Model
* `php artisan make:model Model/TableName(單數) -m`
  * make:model 後面接著的 Model/TableName 會在 app 目錄下建立 Model 資料夾，然後再產生 XXXX 的 Model 檔案
  * 最後的 -m 為 Optional，使用的話可以同時產生 migration 檔案來建立表格

<a name="建立-migration-建立資料表格"></a>
### 建立 Migration (建立資料表格)
* `php artisan make:migration init_transfer_tool`
  * migration 檔案名稱常用小寫英文[a-z]與底線[_]來命名
  * 建立出來的檔案 class 名稱則為首字大寫英文銜接 e.g. InitTransferTool
* 執行全部未執行過的 migration `php artisan migrate`
* 回朔最後一筆 migration `php artisan migrate:rollback`
* 回朔所有 migration `php artisan migrate:reset`
* 回朔所有 migration 並且重新執行 migrate `php artisan migrate:refresh`
  * 附帶執行 seeder，最後加上 --seed，`php artisan migrate:refresh --seed`
* 檢查目前 migration 狀態 `php artisan migrate:status`

<a name="建立-seeder-表格初始資料"></a>
### 建立 Seeder (表格初始資料)
* `php artisan make:seeder UsersTableSeeder`
  * 建立 Seeder 的名稱慣用首字大寫英文銜接
  * 記得到 DatabaseSeeder 裡執行呼叫剛剛建立的 Seeder
* 執行建立的 Seeder
  * 單個執行 `php artisan db:seed --class=UsersTableSeeder`
  * 全部執行 `php artisan db:seed`

<a name="使用-elixir"></a>
### 使用 Elixir
* 安裝 Gulp
  * `npm install --global gulp`
  * 個人使用經驗，只裝 global 似乎不行，所以又裝在目錄下的 node_modules/
    * `npm install --save gulp`
* 安裝 Elixir
  * `npm install`
  * 初始目錄下的 package.json 內已經有 laravel-elixir 等必須套件
* babel 使用遇到問題
  * 安裝 babel-preset-es2015 與 babel-preset-react, `npm install --save-dev babel-preset-es2015 babel-preset-react`
* 使用 eslint 檢查
  * 安裝 laravel-elixir-eslint 與 eslint-plugin-react (因為之前的 eslintrc 內有寫到)
  * `npm install --save-dev laravel-elixir-eslint eslint-plugin-react`
  * 增加 .eslintrc.json 檔案

````json
{
    "env": {
        "browser": true,
        "commonjs": true,
        "es6": true,
        "jquery": true
    },
    "extends": ["eslint:recommended", "plugin:react/recommended"],
    "parserOptions": {
        "ecmaFeatures": {
            "experimentalObjectRestSpread": true,
            "jsx": true,
            "globalReturn": true
        },
        "sourceType": "module"
    },
    "plugins": [
        "react"
    ],
    "rules": {
        "indent": [
            "error",
            4
        ],
        "linebreak-style": [
            "error",
            "unix"
        ],
        "quotes": [
            "error",
            "single"
        ],
        "semi": [
            "error",
            "always"
        ],
        "react/no-danger": 0,
        "no-console": ["error", { "allow": ["log", "warn", "error"] }]
    },
    "globals": {
        "API": true
    }
}
````


<a name="取出最後一筆query"></a>
# 取出最後一筆Query

<a name="laravel-5"></a>
### Laravel 5
1. (!) In Laravel 5 you should enable do `DB::enableQueryLog();` first.
2. Then after placing your final statement:
3. `DB::table('users')->where('name', '=', 'Aknavi')->get();` just run:
4. __`dd(DB::getQueryLog());`__ - it will return the SQL and the bindings of the last queries that were executed.

<a name="laravel-4"></a>
### Laravel 4
In Laravel 4 queryLogging is enabled by default, so you should just do:
`dd(DB::getQueryLog());`