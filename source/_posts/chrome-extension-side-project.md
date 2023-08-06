---
layout: post
title: 自製 Chrome Extension - 英文單字本
author: Soar Lin
cdn: header-off
header-img: ''
date: 2023-08-06 13:47:35
tags:
  - Chrome Extension
  - React
  - OpenAI
categories:
  - Frontend
---

最近又開始在用單字 App 在被單字，所以每每遇到一些容易忘記的單字，會想再找個地方記錄下來，即使之後再回顧的可能性不高，但是透過多做一次紀錄也可以增加一點印象。
![ChatGPT_Vocabulary](https://i.imgur.com/oLEhae3.png)

<!-- more -->
原本是利用 ChatGPT 來幫忙產生單字表，包含了基本的單字、解釋以及例句。然後再把這次的表格丟到 Notion 的筆記裡面記錄下來，但是使用了一陣子後，還是覺得有些不方便。有時候時間久了會記錄到重複的單字，以及每次都要切換到 ChatGPT 問完後，再把表格複製到 Notion 上貼上有些繁瑣。

![Notion_Vocabulary](https://i.imgur.com/ALuQz24.png)

想到之前參加過 [VUE.JS FORGE 3](https://vuejsforge.com/episode-3) 的活動，雖然活動在半夜沒有辦法所有內容都看完，不過也從中學到一些不錯的知識。其中印象最深刻的大概就是怎麼使用 OpenAI 的 API 吧！雖然這是可以自己去 OpenAI 的官方文件上找來看，不過在完全沒概念的情況下，藉由活動的幫助來學習，有個完整的範例程式以及有人手把手線上教學，確實可以比較快進入狀況。

所以就想說自己來做一個 Chrome 插件吧！讓我遇到記不住的英文單字時，可以很方便地透過這個插件來查詢並且記錄下來。類似原本的做法，不過是更便捷的操作流程，並且將這些單字整理到同一份表格裡，有了基本概念後，就開始想著要怎麼實踐這構想。

## Tools
要實作這個插件，除了產生單字表內容需要使用 OpenAI 的 API 外，基本上會有幾個要考慮的點，一個是這些資料最終想存放在哪，是否有打算發布這個插件給大眾使用，實作上要用到哪些技術。從有了構想後，就會三不五時開始思考，假日有空就會開始做些相關研究。底下列出這次 side project 所用到的一些資訊。
* 學習如何製作 Chrome Extension - [Development 文件](https://developer.chrome.com/docs/extensions/mv3/getstarted/)
* 建立專案前端工具 - [Vite](https://vitejs.dev/)
* 前端專案框架 - React，剛好那陣子的工作是協助 React 專案的一些需求開發
* 前端元件庫 - [Meterial UI](https://mui.com/material-ui/getting-started/)
* 資料儲存 - [Firebase](https://firebase.google.com/docs/database/web/start?hl=zh-tw&authuser=0)
* 查詢單字以及產生例句 - [OpenAI](https://platform.openai.com/docs/api-reference/introduction)

全部列出來看起來還不少東西要摸索學習，不過好在有些東西不是很複雜，加上我也沒有要做很複雜的功能，很多照著基本的 Getting Started Guide 就可以完成大部分工作了，剩下的自己在觸類旁通、舉一反三後，大致上也都可以很快解決，只是整個開發過程中，花費我最多時間的應該是 Firebase 的部分吧！

一開始想用 Firestore 來存取資料，但是照著教學文件實作了一陣子後，發現光是存取資料我就搞好久，不曉得是不是腦袋卡到陰還是怎麼了，花了不少時間在看文件以及嘗試，後來放棄了改用 Realtime Database，雖然文件也是讓我研究了許久，不過至少在讀取、寫入這基本的範例上可以順利操作，總算可以再繼續下去了。

先花了一個下午摸索如何製作 Chrome Extension 後，就決定還是該使用某個前端框架來開發，原本的工作主要負責專案是用 Vue.js，不過想多摸索一下 React，所以後來決定用 React + Meterial UI 來開發，因為這比較接近當時要協助公司其他專案的開發，而專案建置就選用 Vite 這個方便的工具，可以快速幫忙建立一個 React 專案，而且後續開發、編譯也都很方便。

而在查詢單字，反饋單字解釋以及給一個例句這部分，其實用到 OpenAI 的 API，也只用到基本的 Create completion 功能就可以達到我的要求了，只是要給出好的問句需要花些時間嘗試，而拿到的 response 也需要做些處理，但都還算是有跡可循，所以都比在 Firebase 上花的時間還少。

開發到後來想到了一些問題，Firebase 的使用其實是需要付費的，不過因為個人測試開發的使用量很低，通常不會到達要收費的門檻，加上可以透過一些 Local Cache 的方式來減少 request 的次數，進而在降低使用量。而使用 OpenAI 的 API 也是要收費的，用 OpenAI 來查單字這也是會累計 API 呼叫次數來產生費用，所以到目前雖然開發完成基本功能了，但是自己用到的次數也不高(想到要付錢就摳門的人)，基於以上兩個服務都可能會產生費用，加上當初設計時 Firebase 的 Realtime database 沒有區分不同表格，所以完全沒想將插件上架到 Chrome Extension Store 上，就單純自己做給自己用就好。

### Firebase - Realtime Database sample code
這裡將這次 side project 用到跟 Firebase 相關的部分程式碼，簡單分享說明一下。專案裡在連到 Firebase Realtime Database 時用了一個檔案來讀取 config 檔案，之後就將整個 export 給後續需要呼叫 API 的程式使用。

```javascript
// src/plugins/firebase.ts
import { getAuth, signInWithEmailAndPassword } from 'firebase/auth'
import { getDatabase } from 'firebase/database'

const apiKey = import.meta.env.VITE_FIREBASE_API_KEK
const firebaseConfig = {
  apiKey: apiKey,
  authDomain: 'chrome-extension-vocabulary.firebaseapp.com',
  databaseURL: 'https://chrome-extension-vocabulary-default-rtdb.asia-southeast1.firebasedatabase.app',
  projectId: 'chrome-extension-vocabulary',
  storageBucket: 'chrome-extension-vocabulary.appspot.com',
  messagingSenderId: '198515381620',
  appId: '1:198515381620:web:1202d73cd95bd03eeb0821',
  measurementId: 'G-KL9L2QB335'
}

// Initialize Firebase
const app = initializeApp(firebaseConfig)
export const db = getDatabase(app)
```

這裡希望單字可以依照加入的順序反向排序後回傳，所以新增資料時，加入了 timestamp，但是讀取資料時，找不到可以反向排序的讀取方式，所以才再後續做反向的處理再回傳，大致程式碼如下:

```javascript
import { db } from '../plugins/firebase'
import { ref, push, set, onValue, query, orderByChild } from 'firebase/database'
import { Vocabulary } from '../types'

const ROOT_PATH = 'Dictionary/'

export const writeData = (word: string, meaning: string, sentence: string) => {
  const vocabulary: Vocabulary = {
    word, meaning, sentence,
    timestamp: (new Date()).getTime()
  }
  const newWordRef = push(ref(db, ROOT_PATH))
  set(newWordRef, vocabulary)
}
export const readAllWords = async (): Promise<Vocabulary[]> => {
  return new Promise((resolve, reject) => {
    const dbRef = query(ref(db, ROOT_PATH), orderByChild('timestamp'))
    onValue(dbRef,
      (snapshot) => {
        const records: Array<Vocabulary> = []
        const data: Array<Vocabulary> = Object.values(snapshot.val())
        data.forEach(item => { records.unshift(item) })
        resolve(records)
      },
      (error) => {
        reject(error)
      }
    )
  })
}
```

### OpenAI sample code
這邊是跟 OpenAI 有關的部分程式碼，簡單分享說明，專案裡在連到 OpenAI 時用了一個檔案來讀取 config 檔案，之後就將整個 export 給後續需要呼叫 API 的程式使用。

```javascript
// src/plugins/openai.ts

import { Configuration, OpenAIApi } from 'openai'

const configuration = new Configuration({
  apiKey: import.meta.env.VITE_OPENAI_API_KEY
})

export default new OpenAIApi(configuration)
```

呼叫 API，只用到一個基本的 createChatCompletion
```javascript
import openai from '../plugins/openai'

export const lookUpWord = async (word: string) => {
  const content = `我要查詢個單字'${word}'`
  const { data } = await openai.createChatCompletion({
    model: 'gpt-3.5-turbo',
    messages: [
      { role: 'system', content: 'You are an English dictionary'},
      { role: 'user', content }
    ],
  })
  return data
}
```

而回傳的資料結構大致像這樣，實際會用到的是 `choices[0].message.content` 的內容，所以還是要花點時間確認資料結果。
```json
{
  "id": "chatcmpl-123",
  "object": "chat.completion",
  "created": 1677652288,
  "choices": [{
    "index": 0,
    "message": {
      "role": "assistant",
      "content": "\n\nHello there, how may I assist you today?",
    },
    "finish_reason": "stop"
  }],
  "usage": {
    "prompt_tokens": 9,
    "completion_tokens": 12,
    "total_tokens": 21
  }
}
```
最後會附上這次專案的 Github 位置，詳細的內容可以再上去查看。

這裡附上幾個截圖
* 基本 extension 點開時的畫面
![Extension View](https://i.imgur.com/xOBQWLzh.png)
* 查詢單字時，連帶篩選既有的單字庫
![Extension with filter](https://i.imgur.com/B9UQPVDh.png)
* 查詢單字後，回傳解釋與例句，使用者可以做基本調整並決定是否加入生字簿
![Extension Vocabulary](https://i.imgur.com/dghQ22Bh.png)
* 新增單字後畫面，在單字書上多了剛剛新增的結果
![Extension View 2](https://i.imgur.com/GaqL9cth.png)

## Github Repo
* [Chrome Extension - Vocabulary](https://github.com/SoarLin/chrome-extension-vocabulay)