---
layout: post
title: Style Hover and Disabled in React component
author: Soar Lin
cdn: header-off
header-img: ''
date: 2022-12-23 22:02:07
tags:
  - react
  - antd
  - css
categories:
  - Frontend
---

今天處理了一個有點意思的東西，目前開發中的專案，由於按鈕顏色可以被使用者客製化，所以原本寫好的 hover, focus 與 disabled 的 CSS 樣式就無用武之地了。

## Original SCSS for button
原本用 SCSS 寫的按鈕，大概會有像下面的樣式設定:
```scss
$orange-color: #ec7100;
$white-color: #fff;

.ant-btn.orange-btn {
  border-width: 0;
  background-color: $orange-color;
  color: $white-color;
  transition: .5s;

  &:hover, &:focus {
    border-width: 0;
    background-color: darken($orange-color, 10%);
    color: $white-color;
  }
  &:disabled, &[disabled], &[disabled]:hover, &[disabled]:focus {
    border-width: 0;
    background-color: lighten($orange-color, 30%);
    color: $white-color;
  }
}
```

但是因為按鈕的背景色會從元件外再傳入使用者設定後的顏色，所以如果直接用 inline style 的方式覆蓋按鈕的背景色，這樣會讓原本辛辛苦苦寫的 hover, focus 以及 disabled 狀態的顏色變化都失效。

<!-- more -->

身為一個前端工程師，對於這種小小狀態變化還是會計較的，所以上網查了一下有沒有方法可以在 inline style 的寫法下，還可以有 hover 的效果，果然找到了這篇 [How to Style Hover in React](https://stackabuse.com/how-to-style-hover-in-react/) 教學，所以我就舉一反三再去找到另一篇教怎麼用 js 來模擬 Sass/SCSS 中的 darken 與 lighten 的效果([Lighten or Darken Hex Color in JavaScript](https://natclark.com/tutorials/javascript-lighten-darken-hex-color/))。雖然計算出來的數值可能不太一樣，不過已經可以達到想要的效果了。

## Detect hover in React Button
處理的專案使用了 Ant Design 這套元件庫，所以接下來的範例也會同樣使用 antd 來製作範例。

基本上需要新增一個參數來記錄 hover 狀態，接著再到按鈕上添加 {% label info@onMouseEnter %} 與 {% label info@onMouseLeave %} 來偵測並改變 hover 的狀態，大致會有下面的 code

```javascript
const App = ({ bgColor = "#8d86c9" }) => {
  const [isHover, setIsHover] = useState(false);

  return (
    <Button
      onMouseEnter={() => setIsHover(true)}
      onMouseLeave={() => setIsHover(false)}
    >
      Click me
    </Button>
  )
}
```

## Lighten and Darken Hex Color
這邊要改變顏色就會用到剛剛另一個網頁的教學，我沒有仔細研究到底怎麼把 hexColor 轉乘 RGB 後再怎麼處理，不過大致上就是希望原本顏色變暗，第二個參數就用負數，希望顏色變亮，第二個參數就用正數
```javascript
const shadeColor = (hexColor, magnitude) => {
  hexColor = hexColor.replace(`#`, ``);
  if (hexColor.length === 6) {
    const decimalColor = parseInt(hexColor, 16);
    let r = (decimalColor >> 16) + magnitude;
    r > 255 && (r = 255);
    r < 0 && (r = 0);
    let g = (decimalColor & 0x0000ff) + magnitude;
    g > 255 && (g = 255);
    g < 0 && (g = 0);
    let b = ((decimalColor >> 8) & 0x00ff) + magnitude;
    b > 255 && (b = 255);
    b < 0 && (b = 0);
    return `#${(g | (b << 8) | (r << 16)).toString(16)}`;
  } else {
    return hexColor;
  }
};
```

## Display hover effect
能夠正確取得 hover 狀態後，就在要寫入的 inline style 加入判斷來改變按鈕背景顏色。
而我希望 mouse hover 時，按鈕的背景色能加深一些些，所以用 {% label success@shadeColor(bgColor, -30) %}

```javascript
const shadeColor = (hexColor, magnitude) => {
  // ...
}

const App = ({ bgColor = "#8d86c9" }) => {
  const [isHover, setIsHover] = useState(false);
  const buttonStyle = {
    color: "#FFFFFF",
    borderWidth: 0,
    backgroundColor: isHover ? shadeColor(bgColor, -30) : bgColor
  };

  return (
    <Button
      onMouseEnter={() => setIsHover(true)}
      onMouseLeave={() => setIsHover(false)}
      style={buttonStyle}
    >
      Click me
    </Button>
  )
}
```

## Display disabled status
既然都能夠顯示 hover 效果了，遇到按鈕需要 disable 就可以依此類推的方式來寫。
在 disabled 狀態下，我希望按鈕背景色變淺變亮，所以用 {% label success@shadeColor(bgColor, 70) %}

```javascript
const shadeColor = (hexColor, magnitude) => {
  //...
};

const App = ({ bgColor = "#8d86c9" }) => {
  const isDisabled = true;
  const [isHover, setIsHover] = useState(false);
  const buttonStyle = {
    color: "#fff",
    borderWidth: 0,
    backgroundColor: isDisabled
      ? shadeColor(bgColor, 70)
      : isHover
      ? shadeColor(bgColor, -30)
      : bgColor
  };

  return (
    <Button
      disabled={isDisabled}
      onMouseEnter={() => setIsHover(true)}
      onMouseLeave={() => setIsHover(false)}
      style={buttonStyle}
    >
      Click me
    </Button>
  )
}
```

## Demo
上面寫的程式碼只是部分而已，需要比較完整的範例可以到這裡來看 [demo](https://codesandbox.io/s/react-button-hover-diabled-inline-style-m2lil0?file=/src/App.js)(請耐心等候畫面產生)

{% iframe https://codesandbox.io/embed/react-button-hover-diabled-inline-style-m2lil0?fontsize=14&hidenavigation=1&theme=dark 100% 500px %}


## Reference
* [How to Style Hover in React](https://stackabuse.com/how-to-style-hover-in-react/)
* [Lighten or Darken Hex Color in JavaScript](https://natclark.com/tutorials/javascript-lighten-darken-hex-color/)
