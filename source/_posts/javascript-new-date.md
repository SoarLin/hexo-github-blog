---
layout: post
title: 使用JavaScript Date轉換時間要小心
author: Soar Lin
cdn: header-off
header-img: ''
date: 2024-04-13 15:22:19
tags:
  - javascript
  - Date
categories:
  - Frontend
---

最近在工作上遇到的一個特殊的問題，當時為了找這個 bug 花了很久時間一直找不到，一直到同事發現透過 Chrome 開發者工具切換時區後才出現；只能說 Chrome dev tool 真的好用。

<!-- more -->

簡單描述一下問題狀況：

在使用了某個 3rd party library 的 DateRangePicker 來封裝成自己要使用的 component, 而選取後的日期以字串的格式回傳給上一層 component, 而上層 component 也可以傳入已選取的日期區間，所以需要可以解析日期區間的字串成為開始與結束兩個時間。

```
DateRange String: 03/01/2024 - 03/31/2024

Start Date: 03/01/2024
End Date: 03/31/2024
```

但因為 DateRangePicker 接受的 value 格式是一個有 start, end 的物件
```javascript
{
  start: Date | undefined
  end: Date | undefined
}
```

所以需要把上層傳入的字串，轉換成開始與結束日期的字串，再透過 `new Date()` 轉換為 **Date** 格式。但是我個人很不習慣美國的時間格式 `mm/dd/yyyy`，所以還是喜歡轉成 `yyyy-mm-dd` 的字串格式來處理。結果就因為這樣做，出現了奇怪的 bug。
```javascript
value = 03/01/2024 - 03/31/2024
startDate = 2024-03-01
endDate = 2024-03-31

{
  start: new Date(startDate),
  end: new Date(endDate),
}
```

## Bug 重現的影片

{% youtube kuUsnaxp3dA %}

## Bug 的原因

最主要的原因是，當使用 `new Date()` 傳入 dateString 轉換時，遇到 `yyyy-mm-dd` 的格式，會再根據使用者當地的 timezone 在轉換對應的時間。

```javascript
// e.g. 2024-03-01
> new Date('2024-03-01')
> Fri Mar 01 2024 08:00:00 GMT+0800 (台北標準時間)

// Location switches to San Francisco
> new Date('2024-03-01')
> Thu Feb 29 2024 16:00:00 GMT-0800 (Pacific Standard Time)
```

這樣可以發現，當使用者時區在 GMT -01:00 ~ -11:00 的時候，轉換後的日期會少一天。
1. 父元件傳入的日期，轉換後少一天且設定到 DateRangePicker 元件上
2. 觸發了 DateRangePicker 元件上 change 的事件
3. 將少了一天的 date range 在傳給父元件
4. 父元件收到新的 date range value 後，又更新日期區間再次傳入子元件
5. 又回到步驟 1 的情況
所以在這樣的無窮迴圈下，可以看到日期不斷地倒數，似乎生命也在倒數了....XD

可以到 [stackblitz](https://stackblitz.com/edit/react-uf6nmy) 上查看範例，或是直接看 [preview](https://react-uf6nmy.stackblitz.io/)，只是需要透過 Chrome Dev Tool 的 Sensor 來更換 Location，然後重整一下頁面檢查一下自己的 location 是否有切換成功。可以透過 `new Date().getTimezoneOffset()` 來檢查回傳的 timezone offset 如果大於 0，就表示切換成功可以來重現問題。
![Chrome Dev Tool - Sensor](https://i.imgur.com/GYyH0K7.png)

## 結論：

轉換時間的處理，可以的話再找個第三方套件來吧！不然就是使用 `new Date()` 時，乖乖地使用美國日期格式 `MM/dd/yyyy` 比較能避免意外狀況發生。
