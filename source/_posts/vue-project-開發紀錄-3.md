---
layout: post
title: Vue.Js 專案開發紀錄 Part 3
author: Soar Lin
cdn: header-off
header-img: ''
date: 2018-08-12 09:44:28
tags:
  - vuejs
  - vuex
  - axios
categories:
  - Frontend
---

距離上次寫這個開發紀錄，已經過了快一個月，都忘了當初寫的感覺，以及要記錄的東西有哪些了

## axios

存取 API 的部分，基本上就是用 axios 來做 ajax，不過這次參考了某篇文章的做法，把 API 在傳送前跟接收後都做了一層共同的處理，因為在處理 CROS 的時候，每次 API 的 header 都有些相同的資訊要傳送，所以就另外抽出來實作，而接收端的話，就一起針對錯誤情況做些簡單的處理。

所以另外寫了一個 interceptor.js 來處理，另外在發起 POST 的 request 時，如果 Content-Type 不是 `application/x-www-form-urlencoded`、`multipart/form-data`或`text/plain`，會變成 `Preflighted` 請求，變成在 POST 前會先有個 OPTION 的請求，後端在寫 Allow Methods 裡面，記得把 OPTIONS 加進去
````
import i18n from '@/i18n'
import axios from 'axios'
// 判斷目前環境，來決定 API 網址
import { getAPIBaseUrl } from './helpers'
　　
/**
 * Config
 */
axios.defaults.baseURL = getAPIBaseUrl()
axios.defaults.timeout = 10000
axios.defaults.transformRequest = (data) => { return JSON.stringify(data) }
// header 資訊帶 cookie，但是後端不能設置 Access-Control-Allow-Origin: '*',
axios.defaults.withCredentials = true
axios.defaults.headers = {
  'Accept': 'application/json',
  'Content-Type': 'application/json;charset=UTF-8',
  'Accept-Language': i18n.locale
}
　　
/**
 * 發送前處理
 */
axios.interceptors.request.use(config => {
  return config
}, error => {
  console.group('[Axios][Interceptor] Request Error')
  console.log(error)
  console.groupEnd()
  return Promise.reject(error.response)
})
　　
/**
 * 發送後處理
 */
axios.interceptors.response.use(data => {
  return data.data
}, error => {
  console.group('[Axios][Interceptor] Response Error')
  console.log(error)
  console.groupEnd()
  let errorMsg = error.message
  if (error.response !== undefined) {
    errorMsg = error.response.data.message
  }
  return Promise.reject(errorMsg)
})

export default axios
````

## main.js

整個專案最先被載入的檔案，基本上就是把所有該 package 起來的檔案都先 import 進來

````
import Vue from 'vue'
// 最外層頁面的 vue 檔
import App from './pages/App'
// router
import router from './router'
// Vuex
import Vuex from 'vuex'
// Vue-axios
import axios from 'axios'
import VueAxios from 'vue-axios'
　　
// Semantic UI，這次專案用到的 CSS Framework
import 'semantic-ui-css/semantic.min.css'
import 'semantic-ui-css/semantic.min.js'
import 'semantic-ui-calendar/dist/calendar.css'
// custom semantic-ui-calendar js file
import './assets/semantic-ui-calendar/calendar.js'
　　
// vuex-store
import store from './store'
// i18n
import i18n from './i18n'
// Swiper
import VueAwesomeSwiper from 'vue-awesome-swiper'
// Firebase Cloud Messaging
import firebase from 'firebase/app'
import 'firebase/messaging'
　　
Vue.use(Vuex)
// Vue-axios
Vue.use(VueAxios, axios)
// Swiper
Vue.use(VueAwesomeSwiper)
　　
Vue.config.productionTip = false
　　
// init Firebase
firebase.initializeApp(process.env.FIREBASE_CONFIG)
// 為了方便使用，把 firebase messaging 寫到 Vue 的 prototype
// Retrieve Firebase Messaging object, assign to Vue Object
Vue.prototype.$messaging = firebase.messaging()
// Add the public key generated from the Firebase console
Vue.prototype.$messaging.usePublicVapidKey(process.env.VAPID_KEY)
// Change server-worker.js register path
navigator.serviceWorker.register('/static/firebase-messaging-sw.js')
  .then((registration) => {
    Vue.prototype.$swRegistration = registration
    Vue.prototype.$messaging.useServiceWorker(registration)
  }).catch(err => {
    console.log(err)
  })
　　
new Vue({
  el: '#app',
  i18n,
  router,
  store,
  render: h => h(App)
})
````

# test

其實有點猶豫該不該寫測試的東西，因為我的測試有點胡亂寫，想到啥寫啥，也沒有詳細的 unit test，似乎就只是針對 component 裡面的畫面跟 method 盡可能地把測試寫一輪，還沒有把所有情況都寫進去，感覺就是有寫有交代...XD，所以還滿想有人可以來指導一下，測試的部分該怎麼規劃跟實作才能算是比較完善的測試。

## unit

專案的測試當初在建立的時候，選用 jest，使用的套件應該是 `vue-jest`，為了把測試的環境改到可以順利執行，當初也是花了好一番功夫，因為有用到 `window.localStorage` 以及 jquery 用法與 i18n 設定

**unit/setup.js**
````
import Vue from 'vue'
import $ from 'jquery'
import 'mock-local-storage' // 算是實作 localStorage 的行為並且複寫 global 與 window
// 載入 jQuery
global.$ = global.jQuery = $
　　
// 模擬 window.localStorage
global.window = {}
window.localStorage = global.localStorage
// 預設用中文語系測試
global.localStorage.setItem('LANGUAGE', 'zh-TW')
　　
Vue.config.productionTip = false
````

**jest.conf.js** 這隻只有稍微調整一些東西
````
const path = require('path')
　　
module.exports = {
  rootDir: path.resolve(__dirname, '../../'),
  moduleFileExtensions: [
    'js',
    'json',
    'vue'
  ],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
    '\\.(css)$': '<rootDir>/node_modules/jest-css-modules'
  },
  transform: {
    '^.+\\.js$': '<rootDir>/node_modules/babel-jest',
    '.*\\.(vue)$': '<rootDir>/node_modules/vue-jest'
  },
  testPathIgnorePatterns: [
    '<rootDir>/test/e2e'
  ],
  snapshotSerializers: ['<rootDir>/node_modules/jest-serializer-vue'],
  setupFiles: ['<rootDir>/test/unit/setup'],
  // --> Option "mapCoverage" has been removed, as it's no longer necessary.
  // mapCoverage: true,
  coverageDirectory: '<rootDir>/test/unit/coverage',
  collectCoverageFrom: [
    'src/**/*.{js,vue}',
    '!src/assets/**/*.js',  // 這裏用來避免自己客製化的檔案被算入
    '!src/main.js',
    '!src/router/index.js',
    '!**/node_modules/**'
  ]
}
````

然後進入測試 component 的部分，也是慢慢摸索出怎麼寫，先不管是否符合單元測試或整合測試，我還是先以能夠個別測試過 xxx.vue 的檔案為主，而測試的撰寫，可以參考[Vue Test Unit](https://vue-test-utils.vuejs.org/zh/guides/)

**XXXXX.sepc.js**
````
import { shallow, createLocalVue } from '@vue/test-utils'
import Vuex from 'vuex'
import VueI18n from 'vue-i18n'
import i18n from '@/i18n'
import router from '@/router'
import moment from 'moment'
　　
import 'semantic-ui-css/semantic.min.js'
import '@/assets/semantic-ui-calendar/calendar'
　　
// Component
import Component from '@/pages/<path-to-component>.vue'　　
// Mixin
import tools from '@/mixin/tools'
// Stubs
import TimePicker from '@/components/time-picker'

const localVue = createLocalVue()
localVue.use(Vuex)
localVue.use(VueI18n)
localVue.use(router)
localVue.mixin(tools)
　　
describe('Login.vue', () => {
  let getters
  let actions
  let store
  let wrapper
　　
  beforeEach(() => {
    // 元件內使用到 store 內的 getter
    getters = {
      getXXXXXXX: () => 'ooxxxx'
    }
    // 元件內使用到 store 內的 actions
    actions = {
      setOOXXXX: jest.fn()
    }
    store = new Vuex.Store({
      state: {
        loading: false,
        lang: 'zh-TW'
      },
      getters,
      actions
    })
    stubs = {
      'time-picker': TimePicker
    }
    wrapper = shallow(Component, { i18n, router, store, stubs, localVue })
  })
　　
  it('mounted & computed test', () => {
    ......
  })
})
````

寫到最後，已經不曉得該怎麼寫了，總而言之就先把目前專案開發的一些事項筆記下來，雖然可能過兩年就不能再使用了，畢竟前端的技術推陳出新，一直有新工具跑出來，讓學習的人覺得困擾，很難再學一次吃好幾年了。