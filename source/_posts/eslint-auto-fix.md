---
layout: post
title: 使用 ESLint 自動修正 Vue 專案語法
author: Soar Lin
cdn: header-off
header-img: 'https://soarlin.github.io/images/eslint/eslint-bg.png'
date: 2020-07-05 14:40:37
tags:
  - eslint
categories:
  - Frontend
---

昨天在當工具人的時候，幫忙處理一個 vue 的前端專案，但是發現雖然對方有使用 eslint，但是似乎沒人遵守語法檢查的建議，都非常的隨性，實在是很沒一制性的專案。

後來想到之前在開發 Nuxt.js 專案時，似乎會自動產生 eslint 修正的語法在 package.json 裡面，所以可以透過 npm 執行某個包含 eslint 自動修正的 script 來將一些語法檢查的錯誤做修正，不過我猜應該能修正的部分會有限制，有些可能還是需要人工介入判斷吧！但是至少可以先一些基本的語法修正。

<!-- more -->

後來研究了一下 eslint 本身有提供 `--fix` 的參數可使用，不過不過這似乎主要針對 .js 檔的修正，如果是在開發 vue 專案時的 .vue 專案，就需要額外安裝套件了，基本可額外安裝 `eslint-plugin-vuefix` 這個套件，並且在 .eslintrc.js 檔裡面的 plugins 加上 `vuefix`

操作步驟 :

- 原本的 package.json 內，新增一個有自動修正的 script `lint-fix`

```json
{
  "scripts": {
    // ....
    "lint": "eslint --ext .js,.vue src test/unit test/e2e/specs",
    "lint-fix": "eslint --fix --ext .js,.vue src test/unit test/e2e/specs",
    // ...
  }
}
```

- 安裝自動修正套件 `eslint-plugin-vuefix`

```
npm install --save eslint-plugin-vuefix
```

- 在 .eslintrc.js 檔內新增使用插件名稱，如果 vue 專案本身有安裝 `eslint-plugin-html` 並且載入 .eslintrc.js，這會影響自動修正的插件執行，所以可以將該插件註解或是試著放到 `vuefix` 插件後面看看

```javascript
module.exports = {
  // ...
  plugins: [
    'vuefix',
    // 'html'    // comment this plugin
  ],
  // ...
}
```

- 接著執行新增的 script 來修正， `npm run lint-fix` 執行後，就大功告成了，不放心的可以在使用原本的 `npm run lint` 檢查是否還有語法需要修正

我拿了目前電腦裡面，以前開發的專案來測試，一開始先執行 `npm run lint`，可以看到一堆語法有問題的提示，大多是字串用了雙引號(Strings must use singlequote)或是多了最後的逗號(Extra semicolon)的問題，以及一些其他問題
![eslint-check](/images/eslint/eslint-01.png)

接著透過修正的語法 `npm run lint-fix` 進行修正後，在使用 `npm run lint` 檢查，果然語法的問題都修正了！
![eslint-autofix](/images/eslint/eslint-02.png)

最後，開發 vue 專案的話，推薦可以使用 `eslint-plugin-vue`，對於 vue 專案的 Code Style 規範可以根據不同嚴謹程度來規範，當然也包含自動修正的功能，想知道更多細節，可以參考這篇介紹 : [[Vue] 整合 Vue style guide, eslint-plugin-vue 和 VSCode](https://pjchender.blogspot.com/2019/07/vue-vue-style-guide-eslint-plugin-vue.html)
