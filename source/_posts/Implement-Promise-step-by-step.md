---
layout: post
title: Implement Promise step by step
author: Soar Lin
cdn: header-off
header-img: ''
date: 2022-07-28 13:07:33
tags:
  - promise
  - javascript
  - async
categories:
  - Frontend
---

在開始唸書後發現對於一些底層JS API的實現太不了解了，雖然已經會用這些API了，還是覺得需要多了解一下一些方法的實作方式。最近看到一篇在講如何逐步實現 Promise 這個物件。看了很久才開始慢慢理解，所以先來筆記，順便更新一下很久沒 update 的部落格文章。

接下來會用 JavaScript 來實現一個簡單的 Promise，且支援非同步(async)與 {% label info@then %} 的鏈式呼叫使用。

## 分析 Promise
> https://developer.mozilla.org/zh-TW/docs/Web/JavaScript/Reference/Global_Objects/Promise

透過MDN的文章，可以知道 Promise 物件用來表示一個即將完成(或失敗)的非同步操作，以及它所產生的值。
<!-- more -->
### Promise 狀態

* **pending**(擱置) : 初始狀態
* **fulfilled**(實現) : 表示操作成功完成
* **rejected**(拒絕) : 表示操作失敗

Promise 的狀態只能從 {% label info@pending %} 變成 {% label info@fulfilled %}，或者由 {% label info@pending %} 變成 {% label info@rejected %}，不會在 fulfilled 與 rejected 兩個狀態間變換，狀態一改變後就不會再改變了。

### Promise 建構函式中的參數

Promise 的建構函式接收一個函式(executor)以及兩個參數(resolve, reject):

* **resolve** : 成功完成後執行 {% label info@resolve %} 已完成 Promise，而狀態從 {% label info@pending %} 變為 {% label info@fulfilled %} 並且觸發 {% label info@then %} 方法中的 {% label info@onFulfilled %}
* **reject** : 失敗後執行 {% label info@reject %} 來結束 Promise，狀態由 {% label info@pending %} 變為 {% label info@rejected %} 並且觸發 {% label info@then %} 方法中的 {% label info@onRejected %}

### then 方法中的回呼函式參數

{% label info@then %} 方法接收兩個參數:

* onFulfilled : 成功的回呼函式，接收一個參數，即 {% label info@resolve %} 傳入的值
* onRejected : 失敗的回呼函式，接收的一個參數，即 {% label info@reject %} 傳入的值

如果 Promise 狀態變為 {% label info@fulfilled %}，就會執行成功的回呼函示 {% label info@onFulfilled %}；如果 Promise 狀態變成 {% label info@rejected %}，就會執行失敗的回呼函示 {% label info@onRejected %}。

## 實現 Promise

### 基礎 Promise
首先, {% label info@constructor %} 接收一個函式參數 {% label info@executor %}, 該函式又接收兩個參數，分別是 {% label info@resolve %} 與 {% label info@reject %}。
因此需要在 {% label info@constructor %} 中創建 {% label info@resolve %} 與 {% label info@reject %} 函數，並傳入 {% label info@executor %} 中:

```javascript
class MyPromise {
  constructor(executor) {
    const resolve = (value) => {};

    const reject = (value) => {};

    try {
      executor(resolve, reject);
    } catch (err) {
      reject(err);
    }
  }
}
```

接著，Promise 會根據狀態，執行對應的回呼函示。從最開始的 {% label info@pending %} 狀態，{% label info@resolve %} 時狀態變成 {% label success@fulfilled %}；當 {% label info@reject %} 時狀態變成 {% label success@rejected %}。

```javascript
class MyPromise {
  constructor(executor) {
    this.state = 'pending';
    this.value = null;

    const resolve = (value) => {
      if (this.state === 'pending') {
        this.value = value;
        this.state = 'fulfilled';
      }
    };

    const reject = (value) => {
      if (this.state = 'pending') {
        this.value = value;
        this.state = 'rejected';
      }
    };

    try {
      executor(resolve, reject);
    } catch (err) {
      reject(err);
    }
  }
}

```

Promise 狀態變更後，會觸發 {% label info@then %} 方法中對應的回呼函示。如果狀態由 {% label info@pending %} 變成 {% label info@fulfilled %}, 則會觸發 {% label success@onFulfilled %}並將接收的值傳入。如果狀態由 {% label info@pending %} 變成 {% label info@rejected %} 則會觸發 {% label success@onRejected %}並將失敗的結過傳入。


```javascript
class MyPromise {
  constructor(executor) {
    this.state = 'pending';
    this.value = null;

    const resolve = (value) => {
      if (this.state === 'pending') {
        this.value = value;
        this.state = 'fulfilled';
      }
    };

    const reject = (value) => {
      if (this.state = 'pending') {
        this.value = value;
        this.state = 'rejected';
      }
    };

    try {
      executor(resolve, reject);
    } catch (err) {
      reject(err);
    }
  }

  then(onFulfilled, onRejected) {
    if (this.state === 'fulfilled') {
      onFulfilled(this.value);
    }

    if (this.state === 'rejected') {
      onRejected(this.value);
    }
  }
}

```

接下來稍微測試一下目前的情況。

```javascript
const p1 = new MyPromise((resolve, reject) => {
  setTimeout(() => resolve('resolved'), 1000);
});

p1.then(
  (res) => console.log(res), // resolved
  (err) => console.log(err)
);

const p2 = new MyPromise((resolve, reject) => {
  setTimeout(() => reject('rejected'), 2000);
});

p2.then(
  (res) => console.log(res),
  (err) => console.log(err) // rejected
);

```
結果會發現什麼也沒有輸出。這是因為 Promise 在執行 {% label info@then %} 方法時，Promise 還處於 {% label info@pending %} 狀態。所以 {% label success@onFulfilled %} 與 {% label success@onRejected %} 的回呼函式都沒被執行。

### 支援非同步的 Promise
為了支援非同步，需要先將 {% label success@onFulfilled %} 與 {% label success@onRejected %} 保存，等待 Promise 狀態發生變化，立刻執行對應的回呼函式。
這裡需注意，因為 Promise 可能被呼叫多次，所以使用陣列來保存({% label primary@onFulfilledArray %}, {% label primary@onRejectedArray %})


```javascript
class MyPromise {
  constructor(executor) {
    this.state = 'pending';
    this.value = null;
    this.onFulfilledArray = [];
    this.onRejectedArray = [];

    const resolve = (value) => {
      if (this.state === 'pending') {
        this.value = value;
        this.state = 'fulfilled';

        this.onFulfilledArray.forEach((fn) => fn(value));
      }
    };

    const reject = (value) => {
      if (this.state = 'pending') {
        this.value = value;
        this.state = 'rejected';

        this.onRejectedArray.forEach((fn) => fn(value));
      }
    };

    try {
      executor(resolve, reject);
    } catch (err) {
      reject(err);
    }
  }

  then(onFulfilled, onRejected) {
    if (this.state === 'pending') {
      this.onFulfilledArray.push(onFulfilled);
      this.onRejectedArray.push(onRejected);
    }

    if (this.state === 'fulfilled') {
      onFulfilled(this.value);
    }

    if (this.state === 'rejected') {
      onRejected(this.value);
    }
  }
}

```

再來測試一下剛剛的程式碼

```javascript
const p1 = new MyPromise((resolve, reject) => {
  setTimeout(() => resolve('resolved'), 1000);
});

p1.then(
  (res) => console.log(res),  // -> 1s 後顯示 'resolved'
  (err) => console.log(err)
);

const p2 = new MyPromise((resolve, reject) => {
  setTimeout(() => reject('rejected'), 2000);
});

p2.then(
  (res) => console.log(res),
  (err) => console.log(err)  // -> 2s 後顯示 'rejected'
);

```

但是如果改執行下面測試，就會出錯了
```javascript
const p1 = new MyPromise((resolve, reject) => {
  setTimeout(() => resolve('resolved'), 1000);
});

p1.then(
  (res) => console.log(res),
  (err) => console.log(err)
).then(
  (res) => console.log(res),
  (err) => console.log(err)
); // Uncaught TypeError: Cannot read properties of undefined (reading 'then')
```
這是因為第一個 {% label info@then %} 方法並沒有返回任何值，卻又遭到第二次呼叫 {% label info@then %} 方法。

所以，接下來要來實現 {% label info@then %} 的鏈式呼叫。

### 支援 then 鏈式呼叫的 Promise
想要 Promise 支援 {% label info@then %} 鏈式呼叫，{% label info@then %} 方法需要返回一個新的 Promise。

所以需要調整一下 {% label info@then %} 方法，來回傳一個新的 Promise。等上一個 Promise 的 {% label success@onFulfilled %} 或是 {% label success@onRejected %} 回傳函式執行完，再執行新的 Promise 的 {% label info@resolve %} 或 {% label info@reject %} 函數。

```javascript
class MyPromise {
  constructor(executor) {
    // ...略
  }

  then(onFulfilled, onRejected) {
    return new MyPromise((resolve, reject) => {
      if (this.state === 'pending') {
        this.onFulfilledArray.push(() => {
          try {
            const fulfilledFromLastPromise = onFulfilled(this.value);
            resolve(fulfilledFromLastPromise);
          } catch (err) {
            reject(err);
          }
        });

        this.onRejectedArray.push(() => {
          try {
            const rejectedFromLastPromise = onRejected(this.value);
            reject(rejectedFromLastPromise);
          } catch (err) {
            reject(err);
          }
        });
      }

      if (this.state === 'fulfilled') {
        try {
          const fulfilledFromLastPromise = onFulfilled(this.value);
          resolve(fulfilledFromLastPromise);
        } catch (err) {
          reject(err);
        }
      }

      if (this.state === 'rejected') {
        try {
          const rejectedFromLastPromise = onRejected(this.value);
          reject(rejectedFromLastPromise);
        } catch (err) {
          reject(err);
        }
      }
    })
  }
}
```

接著使用下面的測試程式來測試

```javascript
const p1 = new MyPromise((resolve, reject) => {
  setTimeout(() => resolve('resolved'), 1000);
});

p1.then(
  (res) => {
    console.log(res); // -> 1s 後顯示 resolved
    return res;
  },
  (err) => console.log(err)
).then(
  (res) => console.log(res), // -> 接著再顯示 resolved
  (err) => console.log(err)
);

const p2 = new MyPromise((resolve, reject) => {
  setTimeout(() => reject('rejected'), 2000);
});

p2.then(
  (res) => console.log(res),
  (err) => {
    console.log(err); // ->  2s 後顯示 rejected
    throw new Error('rejected');
  }
).then(
  (res) => console.log(res),
  (err) => console.log(err) // -> 接著再顯示 Error: rejected
);
```

如果再將測試的程式改寫如下，會發現第二個 {% label info@then %} 無法順利輸出 'resolved'，而是輸出了上一個 {% label info@then %} 的 {% label success@onFulfilled %} 回傳函式返回的 Promise。

```javascript
const p1 = new MyPromise((resolve, reject) => {
  setTimeout(() => resolve('resolved 1'), 1000);
});

p1.then(
  (res) => {
    console.log(res); // resolved
    return new MyPromise((resolve, reject) => {
      setTimeout(() => resolve('resolved 2'), 1000);
    })
  },
  (err) => console.log(err)
).then(
  (res) => console.log(res), // MyPromise {state: "pending"}
  (err) => console.log(err)
);
```

因為 {% label success@onFulfilled %} / {% label success@onRejected %} 回呼函式執行後，只是簡單的將結果傳入 resolve / reject 中執行，沒有考慮 {% label success@onFulfilled %} / {% label success@onRejected %} 執行完會回傳一個新的 Promise 的情況，所以第二次的 {% label info@then %} 方法成功回呼函式直接輸出了上一次 {% label info@then %} 方法的成功回呼函式中返回的 Promise，因此接下來要再想辦法解決這個問題。

先將剛剛的測試換種寫法，來幫助後續理解
```javascript
const p1 = new MyPromise((resolve, reject) => {
  setTimeout(() => resolve('resolved 1'), 1000);
});

const p2 = p1.then(
  (res) => {
    console.log(res);

    const p3 = new MyPromise((resolve, reject) => {
      setTimeout(() => resolve('resolved 2'), 1000);
    })
    return p3;
  },
  (err) => console.log(err)
);

p2.then(
  (res) => console.log(res),
  (err) => console.log(err)
);
```

裡面有三個 Promise:
1. 第一個 Promise: 通過 new 建構出來的 p1
2. 第二個 Promise: 透過 p1 呼叫 then 方法回傳的 p2
3. 第三個 Promise: 在 p1.then 後成功回傳的參數中返回的 p3

現在遇到的問題是，在呼叫 p2.then 時，p3 還處於 pending 狀態。
所以如果想實現 p2.then 方法中的回傳函數能正確的輸出 p3 裡的 {% label info@resolve %}/{% label info@reject %} 之後的值，需要先等 p3 狀態變化後，才能將值回傳給 p2 中的 {% label info@resolve %}/{% label info@reject %}。換句話說，三個 Promise 的狀態改變先後順序應該是 p1 --> p3 --> p2。

所以再來調整 {% label info@then %} 裏針對 {% label success@onFulfilled %} 以及 {% label success@onRejected %} 後的處理，檢查 {% label success@onFulfilled %} 與 {% label success@onRejected %} 後回傳的值，是否還是 Promise 物件，是的話再將當前的 {% label info@resolve %} 與 {% label info@reject %} 傳入該 Promise 物件的 {% label info@then %} 方法中處理

```javascript
class MyPromise {
  constructor(executor) {
    // ...略
  }

  then(onFulfilled, onRejected) {
    return new MyPromise((resolve, reject) => {
      if (this.state === 'pending') {
        this.onFulfilledArray.push(() => {
          try {
            const fulfilledFromLastPromise = onFulfilled(this.value);

            if (fulfilledFromLastPromise instanceof MyPromise) {
              fulfilledFromLastPromise.then(resolve, reject)
            } else {
              resolve(fulfilledFromLastPromise);
            }
          } catch (err) {
            reject(err);
          }
        });

        this.onRejectedArray.push(() => {
          try {
            const rejectedFromLastPromise = onRejected(this.value);

            if (rejectedFromLastPromise instanceof MyPromise) {
              rejectedFromLastPromise.then(resolve, reject)
            } else {
              resolve(rejectedFromLastPromise);
            }
          } catch (err) {
            reject(err);
          }
        });
      }

      if (this.state === 'fulfilled') {
        try {
          const fulfilledFromLastPromise = onFulfilled(this.value);

          if (fulfilledFromLastPromise instanceof MyPromise) {
            fulfilledFromLastPromise.then(resolve, reject)
          } else {
            resolve(fulfilledFromLastPromise);
          }
        } catch (err) {
          reject(err);
        }
      }

      if (this.state === 'rejected') {
        try {
          const rejectedFromLastPromise = onRejected(this.value);

          if (rejectedFromLastPromise instanceof MyPromise) {
            rejectedFromLastPromise.then(resolve, reject)
          } else {
            resolve(rejectedFromLastPromise);
          }
        } catch (err) {
          reject(err);
        }
      }
    })
  }
}
```

### 最終版的 Promise

這樣就完成一個簡單的 Promise，且支援非同步以及 then 的鏈式呼叫處理。完整的程式碼如下：
```javascript
class MyPromise {
  constructor(executor) {
    this.state = 'pending';
    this.value = null;
    this.onFulfilledArray = [];
    this.onRejectedArray = [];

    const resolve = (value) => {
      if (this.state === 'pending') {
        this.value = value;
        this.state = 'fulfilled';

        this.onFulfilledArray.forEach((fn) => fn(value));
      }
    };

    const reject = (value) => {
      if (this.state = 'pending') {
        this.value = value;
        this.state = 'rejected';

        this.onRejectedArray.forEach((fn) => fn(value));
      }
    };

    try {
      executor(resolve, reject);
    } catch (err) {
      reject(err);
    }
  }

  then(onFulfilled, onRejected) {
    return new MyPromise((resolve, reject) => {
      if (this.state === 'pending') {
        this.onFulfilledArray.push(() => {
          try {
            const fulfilledFromLastPromise = onFulfilled(this.value);

            if (fulfilledFromLastPromise instanceof MyPromise) {
              fulfilledFromLastPromise.then(resolve, reject)
            } else {
              resolve(fulfilledFromLastPromise);
            }
          } catch (err) {
            reject(err);
          }
        });

        this.onRejectedArray.push(() => {
          try {
            const rejectedFromLastPromise = onRejected(this.value);

            if (rejectedFromLastPromise instanceof MyPromise) {
              rejectedFromLastPromise.then(resolve, reject)
            } else {
              resolve(rejectedFromLastPromise);
            }
          } catch (err) {
            reject(err);
          }
        });
      }

      if (this.state === 'fulfilled') {
        try {
          const fulfilledFromLastPromise = onFulfilled(this.value);

          if (fulfilledFromLastPromise instanceof MyPromise) {
            fulfilledFromLastPromise.then(resolve, reject)
          } else {
            resolve(fulfilledFromLastPromise);
          }
        } catch (err) {
          reject(err);
        }
      }

      if (this.state === 'rejected') {
        try {
          const rejectedFromLastPromise = onRejected(this.value);

          if (rejectedFromLastPromise instanceof MyPromise) {
            rejectedFromLastPromise.then(resolve, reject)
          } else {
            resolve(rejectedFromLastPromise);
          }
        } catch (err) {
          reject(err);
        }
      }
    })
  }
}
```

## 參考資料：
參考了好幾篇文章，但是最後選了一個來當程式碼的主要參照(~抄襲~)。
[循序渐进实现Promise](https://segmentfault.com/a/1190000040088835)
