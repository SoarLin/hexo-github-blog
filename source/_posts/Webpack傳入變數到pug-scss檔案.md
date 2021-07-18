---
layout: post
title: '透過 Webpack 傳入變數到 pug, scss 檔案內'
author: Soar Lin
cdn: header-off
header-img: ''
date: 2021-04-09 22:08:57
categories:
  - Frontend
tags:
  - webpack
  - pug
  - sass
---

最近在做前端切版的時候，遇到了一個以前沒注意到的問題，就是在本機端開發時，存取圖片或其他檔案都預設從根目錄開始找 (e.g. `/images/...`)，可是當專案開發完，要發佈到其他位置時，圖片等檔案的位置就會有所變更，這時候圖片的路徑就會找不到檔案了，必須要再手動調整過，當然不可能每次都手動一個一個改路徑。

所以開始著手研究怎麼把路徑的變數，透過 webpack 編譯階段判斷目前是開發環境，還是 production 環境，來改變圖片等檔案的前綴路徑。底下就以 [pug-sass-template](https://github.com/SoarLin/pug-sass-template) 專案來說明幾個重要的步驟。

## Step 1 - Webpack Get Environment Variables
> 參考： https://webpack.js.org/guides/environment-variables/

上面網址提供的範例在傳入參數時，一個與多個在接收時，其實有所不同，這邊也是踩了雷才注意到
**Webpack 版本 : 4.43.0**

```
// 傳入兩組 env 時
npx webpack --env NODE_ENV=local --env production --progress

// 在 webpack 內
module.exports = (env) => {
  console.log('env:', env); // [ 'NODE_ENV=local', 'production' ]
  console.log('Production: ', env.production); // true

  return {
    entry: './src/index.js',
    output: {
      filename: 'bundle.js',
      path: path.resolve(__dirname, 'dist'),
    },
  };
};
```
傳入兩組 env 值的時候，所收到的 env 其實是一組陣列，各別是 `--env XXXXX` 裡面的 `XXXXX`，但是當傳入的只有一組 env 時，例如：`--env production`這時候 env 就是 `production` 這個值，就**不再是陣列了**

<!-- more -->

```
// 傳入一組 env 時
npx webpack --env production --progress

// 在 webpack 內
module.exports = (env) => {
  console.log('env:', env); // 'production'

  return {
    entry: './src/index.js',
    output: {
      filename: 'bundle.js',
      path: path.resolve(__dirname, 'dist'),
    },
  };
};
```
雖然目前 webpack 參考的頁面是 v5.31.0 版，可是沒特別寫出這個差異，讓我一直踩雷踩到懷疑人生了...

另外，可以也使用 mode 來傳入環境變數
```
npx webpack --mode production --progress

module.exports = (env, options) => {
  console.log('options.mode:', options.mode); // 'production'

  return {
    entry: './src/index.js',
    output: {
      filename: 'bundle.js',
      path: path.resolve(__dirname, 'dist'),
    },
  };
};
```

## Step 2 - Pass Variables Into PUG files
> 參考： https://www.npmjs.com/package/pug-html-loader

根據這個套件的說明，可以簡單地透過在 `options` 裡面加入 `data` 來將要傳入 pug 的變數傳進去即可。而 data 的格式，寫成 JSON 即可。結合一下上面的步驟一，就可以來調整圖片的前綴網址。

```
// package.json 內的 scripts
webpack --env production --mode production --config webpack.config.js

// webpack.config.js
module.exports = (env, options) => {
  const _VARIABLES = {
    IMG_PREFIX_URL: (options.mode === 'production') ? 'https://soarlin.github.io/' : '/'
  };

  let config = {
    context: path.resolve(__dirname, 'src'),
    entry: {
      index: './js/index.js'
    },
    output: ....,
    module: {
      rules: [
        {
          test: /\.pug$/,
          use: [
            {
              loader: 'html-loader',
              options: {
                minimize: (options.mode === 'production') ? true : false
              }
            },
            {
              loader: 'pug-html-loader',
              options: {
                data: _VARIABLES,
                pretty: (options.mode === 'production') ? false : true
              }
            }
          ]
        },
        ....
      ]
    },
    plugins: [
      ...
    ]
  }

  return config;
};
```
而到時候 pug 檔內，就可以讀到傳入的變數了
```
// 接收變數
- var imgPrefixUrl = IMG_PREFIX_URL

// 套用在圖片上
img.rounded-circle(src=imgPrefixUrl+'images/soarlin-avatar.jpg', alt="avatar")
```

## Step 3 - Pass Variables Into Sass/SCSS files
> 參考： https://www.npmjs.com/package/sass-loader#additionaldata

雖然在 [stack overflow](https://stackoverflow.com/questions/60058352/pass-webpack-environment-variable-to-scss-file) 上也有找到解答，可是上面的解答實際使用時有問題，後來是在 sass-loader npm 的頁面上找到正確的參數，可能是版本的關係產生的不同吧！

在 sass-loader 的 `options` 加入 `additionalData` 來傳入參數到 Sass/SCSS 檔內。而 additionalData 可使用字串或是函示，使用的方式在上述參考網址也有了，所以我就以我自己的範例來寫就好
```
// package.json 內的 scripts
webpack --env production --mode production --config webpack.config.js

// webpack.config.js
module.exports = (env, options) => {
  const _VARIABLES = {
    IMG_PREFIX_URL: (options.mode === 'production') ? 'https://soarlin.github.io/' : '/'
  };

  let config = {
    context: path.resolve(__dirname, 'src'),
    entry: {
      index: './js/index.js'
    },
    output: ....,
    module: {
      rules: [
        ...,
        {
          test: /\.s[ac]ss$/i,
          use: [
            'style-loader',
            'css-loader',
            {
              loader: 'sass-loader',
              options: {
                sourceMap: true,
                additionalData: "$imgPrefix: '" + _VARIABLES.IMG_PREFIX_URL + "';"
              }
            }
          ]
        },
        ....
      ]
    },
    plugins: [
      ...
    ]
  }

  return config;
};
```

這樣似乎會將 additionalData 放在所有 Sass/SCSS 的最前方，讓它以變數的方式直接帶入 Sass/SCSS 內，所以就可以直接使用變數
```
// 傳入 $imgPrefix: _VARIABLES.IMG_PREFIX_URL
.item-bg {
  background-image: url($imgPrefix+'images/background-0.jpg');
  background-repeat: no-repeat;
  background-position: center center;
  background-size: cover;
}
```

以上大概就是這在切版遇到的問題，為了找這些方法花了不少時間，所以非得好好紀錄一下，以供後人參考，減少走冤枉路。也讓自己以後可以拿來抄。

而文中寫到的範例程式，都可以到 Github 上的 [pug-sass-template](https://github.com/SoarLin/pug-sass-template) 專案上找到，歡迎大家幫忙按顆星星。