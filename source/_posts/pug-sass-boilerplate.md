---
layout: post
title: 使用 Webpack 製作前端樣板 (以 Pug 與 Sass 開發)
author: Soar Lin
cdn: header-off
header-img: '/images/pug_sass/pug_sass_webpack.jpg'
date: 2020-07-18 16:21:27
tags:
  - webpack
  - pug
  - sass
categories:
  - Frontend
---

<!-- TOC -->

- [前端樣板使用 Webpack 產生](#前端樣板使用-webpack-產生)
    - [專案位置](#專案位置)
    - [用到的技術](#用到的技術)
    - [開發環境](#開發環境)
    - [工具安裝](#工具安裝)
    - [目錄架構](#目錄架構)
    - [Webpack 設定](#webpack-設定)
        - [webpack 基本設定檔](#webpack-基本設定檔)
        - [進入點和上下文](#進入點和上下文)
        - [輸出檔案](#輸出檔案)
        - [DevServer](#devserver)
        - [Pug 轉 HTML](#pug-轉-html)
        - [Sass rule](#sass-rule)
        - [CSS rule](#css-rule)
        - [JS rule](#js-rule)
        - [images 相關處理](#images-相關處理)
        - [靜態檔案處理與其他設定](#靜態檔案處理與其他設定)
- [參考文章](#參考文章)

<!-- /TOC -->

<a id="markdown-前端樣板使用-webpack-產生" name="前端樣板使用-webpack-產生"></a>
# 前端樣板使用 Webpack 產生

由於之前做過的前端樣板實在是太過時了，除了 node 版本幾跟目前已經差太多了外(當時 v4.x，現在 v12.x)，前端流程的處理工具 gulp 現在也越來越少人知道了，時代的眼淚啊！前端真的是日新月異，每過一陣子，學過的東西就漸漸被淘汰，當時還用了一個現在幾乎沒人知道的 bower 前端套件管理工具，現在大家應該都只知道 npm 這東西吧！

大概從去年就開始有在想要再弄一個新的前端樣板，以便日後有切版需求的時候可以使用。無奈自己懶惰加上也沒有任何切版的案子，所以就一直停滯沒動作，最近看到女友去接了一個友情外包案，就是要使用 pug + sass 來做切版。

<!-- more -->

不過在我完成這個小工具之前，其實網路上應該也很多類似的專案了，甚至還有很多好用的前端開發工具，如： [CodeKit](https://codekitapp.com/)、[Prepros](https://prepros.io/)、[Fire.app](http://fireapp.kkbox.com/)...等工具可以達到這些要求。

不過這次就當作是練功，順便熟悉一下 Webpack 的一些設定，雖然大部分也是到處複製貼上後，拼湊出來的產物，不過...我也是花了不少時間先理解再~~抄襲~~效仿，底下紀錄一下這次的內容。


<a id="markdown-專案位置" name="專案位置"></a>
## 專案位置

[https://github.com/SoarLin/pug-sass-template](https://github.com/SoarLin/pug-sass-template)

<a id="markdown-用到的技術" name="用到的技術"></a>
## 用到的技術

- Webpack : 一個強大的前端打包工具，雖然版本在從 2 -> 4 的過程中，許多設定過程不一定能相容，甚至要重學，但是我想應該也趨近於穩定了吧！
- Sass : CSS preprocessor，雖然是叫 Sass，不過實際上我是用 SCSS 的語法來寫啦！如果看不順眼的其實可以自行把 scss 改成 sass
- Pug : HTML 的樣板語言，前身是 Jade，寫起來很精簡，但是...我跟它還很不熟，只是現在要我繼續寫 EJS 可能也忘得差不多了

<a id="markdown-開發環境" name="開發環境"></a>
## 開發環境

紀錄這次專案開發時的環境，避免之後每個套件版本差異太多，忘了該回到哪個版本來執行。

- node v12.18.2
- npm 6.14.5
- webpack 4.43

<a id="markdown-工具安裝" name="工具安裝"></a>
## 工具安裝

基本上一定要先安裝 node.js 與 npm，這部分就麻煩大家自己先在電腦上安裝吧！[Node.js 官網](https://nodejs.org/en/) 然後版本盡可能不要與上述的相差太多，不然很有可能無法運作...XD

1. `npm i -D webpack webpack-cli` 先安裝 `webpack` 與 `webpack-cli`
2. `npm install` 安裝專案所需要的套件

<a id="markdown-目錄架構" name="目錄架構"></a>
## 目錄架構

```
目錄結構
.
├── README.md
├── package-lock.json
├── package.json
├── src
│ ├── assets
│ ├── css
│ ├── images
│ ├── js
│ ├── pug
│ └── sass
└── webpack.config.js
```

專案目錄下的 README.md 與 package.json 都不是本次討論的重點，主要開發的檔案都放在 `src` 目錄下，而 webpack 的打包設定都寫在 `webpack.config.js` 裡面

大概介紹一下 src 目錄下的結構

- **assets** : 用來放置一些靜態文件，可用來放字形檔(fonts), SVG 檔案或其他非圖片的檔案
- **images** : 切版時偶爾會需要一些圖片檔案，就可以用來放這邊，如：jpg, png, gif 等
- **css** : 一些額外的 css 檔案，這次專案使用到 Bootstrap 的範例，懶得自己重頭寫 css, 就把下載下來的範例 css 放這邊，並且在頁面內載入
- **js** : 主要的程式進入點 `index.js` 放在這裡，另外如果需要自行客製化 js 檔，也可以放這邊，但是記得在 index.js 內 import
- **sass** : 用來放切版用的 sass 檔，你可以自行管理裡面的目錄結構
- **pug** : HTML 樣板檔案，可以自行設置不同的 layout 來繼承，也能製作共用的區塊來 include 等等，熟悉 pug 開發的人員應該比我還懂的怎麼使用

<a id="markdown-webpack-設定" name="webpack-設定"></a>
## Webpack 設定
這裡我就只針對這次專案調整的部分說明，如果想知道更多細節，還是要去翻 webpack 上的說明。

<a id="markdown-webpack-基本設定檔" name="webpack-基本設定檔"></a>
### webpack 基本設定檔
webpack 在安裝後，需要自己產生一個設定檔，通常會是在專案目錄下新建一個 `webpack.config.js` 的檔案，而基本的內容會寫上如下：

```
module.exports = {
  entry: '',
  output: '',
  module: {
    rules: []
  },
  plugins: []
};
```

<a id="markdown-進入點和上下文" name="進入點和上下文"></a>
### 進入點和上下文
這裡介紹一下 entry 與 context，entry 顧名思義就是 webpack 要處理的 js 進入點，通常會在這裡開始把需要的套件再逐一 import 進來，而 context 是用來指定入口所處目錄的絕對路徑，之後可以給 entry 與 loader 套用。

舉例來說：原本的 entry 路徑為 `<專案目錄>/src/js/indes.js`，但是因為我幾乎把所有開發用到的檔案都放到 src 目錄下，所以我可以使用 context 來指定以後再寫道 entry 或是 loader 的檔案路徑時，都從一個共同的絕對路徑再開始找，也就是 `<專案目錄>/src`

所以再加入這兩項後，webpack 設定會變成如下：這裏使用到 `path.resolve` 來指定到專案目錄下 src 的目錄

```
const path = require('path');
　　　
module.exports = {
  context: path.resolve(__dirname, 'src'),
  entry: {
    index: './js/index.js'
  },
  // ....
}
```

<a id="markdown-輸出檔案" name="輸出檔案"></a>
### 輸出檔案
指定這次的 bundle 後，輸出的檔案該如何配置。這邊透過 `path` 指定檔案輸出的絕對路徑，而 filename 用來指定輸出的檔名結構。經過調整後變成
```
const path = require('path');
　　　
module.exports = {
  // ...
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: './js/[name].js?[hash:8]'
  },
  // ....
}
```

<a id="markdown-devserver" name="devserver"></a>
### DevServer
開發的過程中，還是需要一個可以即時預覽的 server 來顯示目前狀況，所以這裡使用 `webpack-dev-server` 這套件，所以需要手動安裝 `npm install --save-dev webpack-dev-server` 接著再到 webpack 設定內增加 devServer 的設定

```
const path = require('path');
　　　
module.exports = {
  // ....
  devServer: {
    compress: true,
    port: 3000
  },
  // ....
}
```

<a id="markdown-pug-轉-html" name="pug-轉-html"></a>
### Pug 轉 HTML
這次的重點之一，不過我這邊的解法也是去網路上找來的。主要是參考底下參考文章的第二篇，需要安裝三個套件 `html-loader`、`pug-html-loader`和`html-webpack-plugin`。
```
npm install --save-dev html-loader pug-html-loader html-webpack-plugin
```

接著再 webpack.config.js 裡面設定調整如下：

```
const path = require('path');
// 引入 html-webpack-plugin 套件
const HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = {
  // ...
  module: {
    rules: [
      {
        test: /\.pug$/,
        use: [
          {
            loader: 'html-loader',
            options: { minimize: false }
            // 不壓縮 HTML
          },
          {
            loader: 'pug-html-loader',
            options: { pretty: true }
            // 美化 HTML 的編排 (不壓縮HTML的一種)
          }
        ]
      },
    ]
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: './pug/index.pug',
      filename: 'index.html',
      inject: true,
      chunks: ['index'],  // 根據 entry 的名字而定
      minify: {
        sortAttributes: true,
        collapseWhitespace: false, // 折疊空白字元就是壓縮Html
        collapseBooleanAttributes: true, // 折疊布林值属性，例:readonly checked
        removeComments: true, // 移除註釋
        removeAttributeQuotes: true // 移除屬性的引號
      }
    }),
  ]
}
```

以上是只有一個 index.pug 檔需要轉換時，但實際上在切版時，肯定不會這麼簡單。當遇到多個 pug 檔需要轉換，這裡建議將要轉換為 html 的 pug 集中放到 `/src/pug/` 下的第一層目錄，並且透過 glob 這工具抓取目錄下第一層的 pug 檔案後再用 forEach 的方式去撰寫 plugins 裡面的內容。所以可以改成下方這樣。

```
const path = require('path');
const glob = require('glob');
const HtmlWebpackPlugin = require('html-webpack-plugin');
// 將原本 module.exports 後的內容改寫道 config 變數內
var config = {
  context: path.resolve(__dirname, 'src'),
  entry: {
    index: './js/index.js'
  },
  output: { //... },
  devServer: { // ... },
  module: {
    rules: [
      {
        test: /\.pug$/,
        use: [ // ... ]
      }
    ]
  },
  plugins: [
    // 將原本的 new HtmlWebpackPlugin 刪除
  ]
};

// 透過 glob 找出所有 pug 檔後用 for 迴圈寫入 plugins 裡面
glob.sync('./src/pug/*.pug').forEach((path) => {
  const start = path.indexOf('/pug/') + 5;
  const end = path.length - 4;
  const name = path.slice(start, end);
  config.plugins.push(
    new HtmlWebpackPlugin({
      template: './pug/' + name + '.pug',
      filename: name + '.html',
      inject: true,
      chunks: ['index'],
      minify: {
        sortAttributes: true,
        collapseWhitespace: false,
        collapseBooleanAttributes: true,
        removeComments: true
      }
    })
  );
});

module.exports = config;
```

<a id="markdown-sass-rule" name="sass-rule"></a>
### Sass rule
為了讓 sass 能順利轉換成 css 並且可以在畫面上顯示，需要安裝至少三個 loader 插件與 `node-sass`、`sass-loader`、`css-loader`與`style-loader`，然後再設定檔內的 module 增加一個 rule

```
npm install --save-dev node-sass sass-loader css-loader style-loader
```

```
const path = require('path');
// ...
var config = {
  // ...
  module: {
    rules: [
      {
        test: /\.pug$/,
        use: // ...
      },
      {
        test: /\.s[ac]ss$/i,
        use: [
          'style-loader', // Creates `style` nodes from JS strings
          'css-loader', // Translates CSS into CommonJS
          'sass-loader' // Compiles Sass to CSS
        ]
      }
    ]
  }
};
// ...
module.exports = config;
```

<a id="markdown-css-rule" name="css-rule"></a>
### CSS rule
因為這次專案用了 Bootstrap 4 的範例，所以直接把範例提供的 css 檔拿來用，所以會有外部 css 需要被載入與顯示，所以需要在 module 內的 rule 增加這個 loader

```
const path = require('path');
// ...
var config = {
  // ...
  module: {
    rules: [
      {
        test: /\.pug$/,
        // ...
      },
      {
        test: /\.s[ac]ss$/i,
        // ...
      },
      {
        test: /\.css$/i,
        use: [
          'style-loader', // Creates `style` nodes from JS strings
          'css-loader' // Translates CSS into CommonJS
        ]
      },
    ]
  }
};
// ...
```

<a id="markdown-js-rule" name="js-rule"></a>
### JS rule
開發時如果在撰寫 js，相信大部分的人應該都會開始寫 ES6 甚至是 ES7 的一些語法了，所以需要多個 babel 來將這些語法轉回 ES5 讓瀏覽器能順利解析，所以會多上這個 rule，不過需要先安裝 `@babel/core`、`babel-loader`與`@babel/preset-env`
```
npm install --save-dev @babel/core @babel/preset-env babel-loader
```

```
// ...
var config = {
  // ...
  module: {
    rules: [
      {
        test: /\.pug$/,
        // ...
      },
      {
        test: /\.s[ac]ss$/i,
        // ...
      },
      {
        test: /\.css$/i,
        // ...
      },
      {
        test: /\.js$/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: ['@babel/preset-env']
          }
        }
      },
    ]
  }
};
// ...
```

<a id="markdown-images-相關處理" name="images-相關處理"></a>
### images 相關處理
圖片的處理，也是參考別人的教學，依樣畫葫蘆的使用，不過因為是做樣板，所以實際上沒用到圖片，不過還是可以列出來讓有需要的人參考。需要安裝`url-loader`與`image-webpack-loader`

```
npm install --save-dev url-loader image-webpack-loader
```

```
// ...
var config = {
  // ...
  module: {
    rules: [
      {
        test: /\.pug$/,
        // ...
      },
      {
        test: /\.s[ac]ss$/i,
        // ...
      },
      {
        test: /\.css$/i,
        // ...
      },
      {
        test: /\.js$/,
        // ...
      },
      {
        test: /\.(jpe?g|png|gif)$/,
        use: [
          {
            loader: 'url-loader',
            options: {
              limit: 8192,
              name: '[path][name].[ext]?[hash:8]'
            }
          },
          {
            loader: 'image-webpack-loader',
            options: {
              mozjpeg: {
                progressive: true,
                quality: 65
              },
              optipng: {
                enabled: false
              },
              pngquant: {
                quality: '65-90',
                speed: 4
              },
              gifsicle: {
                interlaced: false
              }
            }
          }
        ]
      }
    ]
  }
};
// ...
```

<a id="markdown-靜態檔案處理與其他設定" name="靜態檔案處理與其他設定"></a>
### 靜態檔案處理與其他設定
寫到這邊已經寫了好幾個小時，所以有點累了，最後一口氣寫完好了，剩下的幾個設定有
* 靜態檔案搬移，使用 `copy-webpack-plugin` 插件
* 每次 build 前的目錄清空，使用 `clean-webpack-plugin`
* 加載 jQuery : 因為用到了 Bootstrap 4，所以還是需要 jQuery，這裡使用 webpack 本身的 `ProvidePlugin`

需要先安裝`copy-webpack-plugin`、`clean-webpack-plugin`、`jquery`與`bootstrap`
```
npm install --save-dev copy-webpack-plugin clean-webpack-plugin
npm install --save jquery bootstrap
```

所以設定檔會變成：
```
// ...
// 增加 webpack 方便之後取得 webpack.ProvidePlugin 插件
const webpack = require('webpack');
// 清除目錄插件
const { CleanWebpackPlugin } = require('clean-webpack-plugin');
// 資料搬移插件
const CopyPlugin = require('copy-webpack-plugin');

var config = {
  // ...
  plugins: [
    // 每次先清除前一次 build 的資料
    new CleanWebpackPlugin(),
    // 搬移靜態檔案
    new CopyPlugin({
      patterns: [
        { from: 'css', to: 'css' },
        { from: 'images', to: 'images' },
        { from: 'assets', to: 'assets' }
      ]
    }),
    // 載入 jQuery
    new webpack.ProvidePlugin({
      $: 'jquery',
      jQuery: 'jquery'
    })
  ]
};
// ...
```

大致的設定內容都介紹一輪，完整的 webpack.config.js 可以去我的專案內查看，相差沒太多，但是怕日後忘記每個設定的內容再做什麼，所以趁著記憶猶新的時候，先記錄下來。


<a id="markdown-參考文章" name="參考文章"></a>
# 參考文章

1. [如何用 Webpack 來打包 JavaScript、SCSS/CSS、HTML 網頁和任意檔案？](https://magiclen.org/webpack/)
2. [在webpack中使用Pug產生Html](https://medium.com/%E5%B0%8F%E5%BD%A5%E5%BD%A5%E7%9A%84%E5%89%8D%E7%AB%AF%E4%BA%94%E5%9B%9B%E4%B8%89/%E5%9C%A8webpack%E4%B8%AD%E4%BD%BF%E7%94%A8pug%E7%94%A2%E7%94%9Fhtml-24eb9fec22c7)
3. [如何設定 webpack 筆記](https://www.vialley.com/555/%E5%A6%82%E4%BD%95%E8%A8%AD%E5%AE%9A-webpack-%E7%AD%86%E8%A8%98)
4. [Vue-cli 透過 webpack 來加載使用 pug/scss 及 BootStrap4](https://guahsu.io/2017/12/vue-cli-webpack-pug-scss-bootstrap4/)
