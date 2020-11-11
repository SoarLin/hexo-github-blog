---
layout: post
title: Webpack Note
author: Soar Lin
cdn: header-off
header-img: ''
date: 2016-09-04 10:52:31
categories:
 - Frontend
tags:
 - webpack
 - npm
---

<!-- MarkdownTOC -->

- [Webpack Note](#webpack-note)
  - [npm 安裝套件](#npm-安裝套件)
  - [npm 的 packages.json](#npm-的-packagesjson)
  - [webpack.confing.js](#webpackconfingjs)
  - [webpack Product vs Developer](#webpack-product-vs-developer)
  - [Config 檔內使用 path 套件](#config-檔內使用-path-套件)
  - [多個 bundles 檔案封裝](#多個-bundles-檔案封裝)
  - [載入 CSS](#載入-css)
    - [分離出 CSS 檔案](#分離出-css-檔案)
    - [Auto Prefixer](#auto-prefixer)
  - [加入圖片](#加入圖片)
  - [Webpack build with React](#webpack-build-with-react)

<!-- /MarkdownTOC -->


<a name="webpack-note"></a>
# Webpack Note

<a name="npm-安裝套件"></a>
## npm 安裝套件

* webpack, webpack-dev-server
* babel-core, babel-loader
* jshint, jshint-loader : JS 語法檢查，後續再研究如何替換成 eslint
* node-libs-browser : unknow
* strip-loader : 可用於 production 情況下，將 console.log 的訊息忽略掉
* css-loader, style-loader, (sass-loader), less-loader

<a name="npm-的-packagesjson"></a>
## npm 的 packages.json

* 修改 scripts 內容
  * `"start": "webpack-dev-server"`
  * 接著回到 command line
  * 輸入 `npm start`, 開始執行 webpack-dev-server 的指令

<a name="webpackconfingjs"></a>
## webpack.confing.js

* devtool : 產生 source-map 方便開發中除錯
* entry 可以用陣列傳入多個js檔
    * 也可以用 object 得方式建立多個 key: value
* output is objects
* module is objects
  * loaders is object array, each loader setting is object
    * test 是正規表示式
    * exclude 略過不處理的目錄(以設定檔為起始路徑)
    * loader 使用的 loader
    * 搭配 resolve 來擴充讀取的副檔名
      * extensions is 副檔名陣列
  * preLoaders is object array, each pre-loader setting is object
    * test 正規表示式
    * exclude 略過不處理的目錄(以設定檔為起始路徑)
    * loader loader名稱

````javascript
module.exports = {
  devtool: 'eval-source-map',
  entry: ['./utils', '/app.js'],
  output: {
    filename: "bundle.js"
  },
  module: {
    preLoaders: [
      {
        test: /\.js$/,
        exclude: 'node_modules',
        loader: 'jshint-loader'
      }
    ],
    loaders: [
      {
        test: /\.es6$/,
        exclude: /node_moduel/,
        loader: "babel-loader"
      }
    ]
  }
  resolve: {
    extensions: ['', '.js', '.jsx', '.es6']
  }
}
````


<a name="webpack-product-vs-developer"></a>
## webpack Product vs Developer

* webpack -p : product 模式，輸出檔案壓縮最佳化
  * 可使用另一個 config 檔案, webpack-production.config.js
  * `webpack --config webpack-production.config.js -p`

````javascript
var WebpackStrip = require('strip-loader');
var devConfig = require('./webpack.config.js');
var stripLoader = {
  test: [/\.js$/, /\.es6$/],
  exclude: /node_modules/,
  loader: WebpackStrip.loader('console.log');
}
devConfig.module.loaders.push(stripLoader);
module.exports = devConfig;
````

<a name="config-檔內使用-path-套件"></a>
## Config 檔內使用 path 套件

* 修改過得目錄結構
![修改過得目錄結構](/images/webpack/path.jpg)

````javascript
var path = require('path');

module.exports = {
  context: path.resolve('js');
  entry: ['./utils', '/app.js'],
  output: {
    path: path.resolve('build/js/'),
    publicPath: '/public/assets/js/',
    filename: "bundle.js"
  },

  devServer: {
    contentBase: 'public'
  }

  module: {
    preLoaders: [
      {
        test: /\.js$/,
        exclude: 'node_modules',
        loader: 'jshint-loader'
      }
    ],
    loaders: [
      {
        test: /\.es6$/,
        exclude: /node_moduel/,
        loader: "babel-loader"
      }
    ]
  }
  resolve: {
    extensions: ['', '.js', '.jsx', '.es6']
  }
}
````

<a name="多個-bundles-檔案封裝"></a>
## 多個 bundles 檔案封裝

* 多個 js 檔與多個 html 頁面
* <img src="https://i.imgur.com/p28LVfs.png" width="200">
* 在 config 檔內使用 webpack 套件來載入共用 js 區塊
    * `var commonsPlugin = new webpack.optimize.CommonsChunkPlugin('shared.js');`
* entry 由原本陣列換成 objects 方式撰寫
    * 使用 key : value 方式撰寫每個 html 頁面 entry 的 key
    * output 的部分在 filename 將改成 `[name]` 的方式來依據 entry 內的 key 做輸出

````javascript
var path = require('path');
var webpack = require('wabpack');
var commonsPlugin = new webpack.optimize.CommonsChunkPlugin('shared.js');

module.exports = {
    context: path.resolve('js');
    entry: {
        about: './about_page.js',
        home: './home_page.js',
        contact: './contact_page.js'
    },
    output: {
        path: path.resolve('build/js/'),
        publicPath: 'public/assets/js/',
        filename: "[name].js"
    },
    plugins: [commonsPlugin,
    devServer: {
        contentBase: 'public'
    },
    ......
}
````

<a name="載入-css"></a>
## 載入 CSS

* loader 載入順序：由右往左，以 less 那組為例
    * less-loader -> css-loader -> style-loader 來處理
* 需安裝 css-loader, style-loader 兩套件
    * 使用 SASS，需要再安裝 sass-loader
    * 使用 Less，需要再安裝 less-loader
* 在 config 檔裡面，利用`!` 來將兩個 loader 連接
* js 檔內使用`require('css-file-path');`的方式來載入 CSS (scss or less) 檔案
    * 原本 html 頁面內的 head 裡面不需要另外寫 css 載入
    * 可透過 html 頁面引入的 js 檔案內 require css 檔案自動在頁面載入時加載

````javascript
module.exports = {
    module: {
        loaders: [
            {
                test: /\.css$/,
                exclude: /node_modules/,
                loader: "style-loader!css-loader"
            },
            {
                test: /\.less$/,
                exclude: /node_modules/,
                loader: "style-loader!css-loader!less-loader"
            }
        ]
    }
}
````

<a name="分離出-css-檔案"></a>
### 分離出 CSS 檔案
* 讓 CSS 可放置在 head 標籤間被 include
* `npm install extract-text-webpack-plugin --save-dev`
* html 檔的 head tag 內加入
    * `<link rel="stylesheet" href="/public/assets/styles.css">`
* config 檔內需要引入 `extract-text-webpack-plugin` 套件
* 改寫 loaders 的內容

````javascript
var ExtractTextPlugin = require('extract-text-webpack-plugin');
module.exports = {
    context: path.resolve('js');
    entry: ["./app"];
    output: {
        path: path.resolve('build/'),
        publicPath: 'public/assets/',
        filename: "bundle.js"
    }
    plugins: [
        new ExtractTextPlugin("styles.css")
    ],
    devServer: {
        contentBase: 'public'
    },
    module: {
        loaders: [
            {
                test: /\.css$/,
                exclude: /node_modules/,
                loader: ExtractTextPlugin.extract("style-loader", "css-loader")
            },
            {
                test: /\.less$/,
                exclude: /node_modules/,
                loader: ExtractTextPlugin.extract"style-loader", "css-loader!less-loader")
            }
        ]
    }
}
````

<a name="auto-prefixer"></a>
### Auto Prefixer
* `npm install autoprefixer-loader --save-dev`
* config 檔內的 loader 中，增加 autoprefixer-loader 在 css-loader 之後，less-loader 之前

````javascript
module.exports = {
    module: {
        loaders: [
            {
                test: /\.css$/,
                exclude: /node_modules/,
                loader: "style-loader!css-loader!autoprefixer-loader"
            },
            {
                test: /\.less$/,
                exclude: /node_modules/,
                loader: "style-loader!css-loader!autoprefixer-loader!less-loader"
            }
        ]
    }
}
````

<a name="加入圖片"></a>
## 加入圖片

* npm 安裝 `url-loader` 套件
    * `npm install url-loader --save-dev`
    * packages.json 內會增加 url-loader 與 file-loader 兩個套件
* config 中增加 loader 設定至 loaders 內
    * url-loader 加入 limit 限制圖片大小，限制內圖片被轉為 base64 編碼 inline 載入，超過限制以原本圖片載入

````javascript
module.exports = {
    module: {
        loaders: [
            {
                test: /\.css$/,
                exclude: /node_modules/,
                loader: "style-loader!css-loader"
            },
            {
                test: /\.(png|jpg)$/,
                exclude: /node_modules/,
                loader: "url-loader?limit=100000"
            }
        ]
    }
}
````

````javascript
app.js

var img = document.createElement('img');
img.style.height = "25%";
img.style.width = "25%";
img.src = require('../images/webpack_logo.png');

document.getElelentById('img_container').appendChild(img);
````

<a name="webpack-build-with-react"></a>
## Webpack build with React

 * 安裝套件
     * react, babel-preset-es2015, babel-preset-react
 * 增加 .babelrc 設定檔

 ````
 {
     "presets" : ["es2015", "react"]
 }
 ````
 * 或直接寫在原本得 config.js 檔裡面

 ````javascript
 module.exports = {
  entry: ['/app'],
  output: {
    filename: "bundle.js"
  },
  module: {
    loaders: [
      {
        test: /\.es6$/,
        exclude: /node_moduel/,
        loader: "babel-loader",
        query: {
          "presets" : ["es2015", "react"]
        }
      }
    ]
  }
  resolve: {
    extensions: ['', '.js', '.jsx', '.es6']
  }
}
````