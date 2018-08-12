---
layout: post
title: Vue.Js 專案開發紀錄 Part 2
author: Soar Lin
cdn: header-off
header-img: ''
date: 2018-07-22 15:01:49
tags:
  - vuejs
  - vuex
  - webpack
  - i18n
categories:
  - Frontend
---

## mixin 內容
這裡是以前的習慣養成的，其實不一定是個好作法，我會將某些 .vue 裡面，可以共用的 method 或是某些比較獨立的 method 抽出來另外做成 mixin 然後在 import 來用，雖然立意良好，但實際執行上，有時會變成把一個很大的 .vue 檔抽出部分 method 放去 mixin 來使用。

## pages 內容
這裡才是放我主要網站頁面架構的 vue 元件，目前分成四個目錄以及一個 Home.vue 與 App.vue 檔

### App.vue
這是原本專案建立時產生的 vue 檔，基本上所有內容都在從這裡面產生，底下的範例雖然會透過判斷 `getLoading` 來切換 loading 與顯示畫面，不過我後來實際開發時，把每個頁面或是每個區塊 loading 又另外做處理，所以最外層這個 loading 就沒再用了
````
<template>
  <div v-if="getLoading" class="ui active inverted dimmer">
    <div class="ui text loader">Loading</div>
  </div>
  <router-view class="body" />
</template>

<script>
import { mapGetters } from 'vuex'

export default {
  name: 'App',
  data () {
    return {
    }
  },
  computed: {
    ...mapGetters([
      'getLoading'
    ])
  },
  created () {
    console.log('App created')
  },
  mounted () {
  }
}
</script>

<style lang="sass">
.body
  margin: 0
  padding: 0
  width: 100%
  height: 100%
</style>
````

整個 App.vue 裡面主要就放一個 `<router-view />`，讓 vue-router 來處理要渲染的內容，一開始的頁面是根目錄 `/`，所以會依據 routes 裡設定 path 為 `/` 來載入頁面，而這頁就是 Home.vue，所以簡單來說 App.vue 就是包住整個 route 要渲染的內容，而一開始渲染 `/` 這個路徑的檔案

## router 內容
這部分才是重點之一，畢竟過去開發 vue.js 的經驗都是某個頁面內需要複雜操作的時候，才將該區塊改寫成 vue.js，然後載入頁面的時候一起把 build 好的 js 載入使用，而這次真的要靠 vue.js 來架構整個網站的路徑，所以也是第一次學習怎麼寫前端 route

使用 [vue-router](https://router.vuejs.org/) Vue.js 官方的路由管理器，底下例子會用到
* HTML5 History Mode
* Nested Routes 嵌套路由
* Route Meta Fields(路由元信息) 用來判斷是否需要驗證用戶登入狀態
* Navigation Guards 的 Global Guards，用來作用戶登入檢查

````
import Vue from 'vue'
import Router from 'vue-router'

import store from '../store/index'

import Home from '@/pages/Home'
　　　
// Auth: Login, ResetPassword
import Login from '@/pages/auth/login'
　　　
// Product Page
import Products from '@/pages/products/products-root'
import ProductsWeekly from '@/pages/products/products-weekly'
import ProductsMonthly from '@/pages/products/products-monthly'
　　　
Vue.use(Router)
　　　
const router = new Router({
  mode: 'history',
  routes: [
    {
      path: '/',
      name: 'Home',
      component: Home,
      meta: { requiresAuth: true },
      children: [
        {
          path: 'products',
          name: 'Products',
          component: Products,
          meta: { requiresAuth: true },
          children: [
            {
              path: 'weekly',
              name: 'ProductsWeekly',
              component: ProductsWeekly,
              meta: { requiresAuth: true }
            },
            {
              path: 'monthly',
              name: 'ProductsMonthly',
              component: ProductsMonthly,
              meta: { requiresAuth: true }
            }
          ]
        }
      ]
    },
    {
      path: '/login',
      name: 'Login',
      component: Login,
      meta: { requiresAuth: false }
    },

    // 當 url path 不符合 router 表的時候，預設轉址到
    // 順序一定要最後面
    { path: '/*', redirect: '/login' }
  ]
})

const isLogged = function () {
  let storeLoggedIn = store.getters.getLoggedIn
  let sessionLoggedIn = sessionStorage.getItem('LoggedIn')
  return storeLoggedIn || sessionLoggedIn
}

router.beforeEach((to, from, next) => {
  console.log('to=', to.fullPath, '| from=', from.fullPath)
  if (to.matched.some(record => record.meta.requiresAuth) && !isLogged()) {
    // 如果 router 轉跳的頁面需要驗證 requiresAuth: true
    // 尚未登入時，導向 login 頁面, 網址帶入 redirect，以便登入後重新導向
    next({
      path: '/login',
      query: { redirect: to.fullPath }
    })
  } else {
    next() // 往下繼續執行
  }
})

export default router
````

## store 內容
這也是主要重點之一，Vue.js 的狀態管理模式 [vuex](https://vuex.vuejs.org/zh/) 相關的檔案都放在這邊了，開發過程中需要搭配 [devtools extension](https://github.com/vuejs/vue-devtools) 的 Chrome 插件來使用，包保事半功倍

### 目錄結構
目前的目錄結構如下，為了功能細分，所以有拆出 modules，以及 root.js 來放切換語系等功能
````
src/store
├── index.js
├── modules
│   ├── auth.js
│   ├── notify.js
│   ├── orders.js
│   ├── products.js
│   ├── resources.js
│   └── token.js
└── root.js
````

### index.js
index.js 的內容大致如下：
````
import Vue from 'vue'
import Vuex from 'vuex'
　　　
// root
import { state, actions, mutations, getters } from './root.js'
　　　
// modules
import auth from './modules/auth'
import products from './modules/products'
　　　
Vue.use(Vuex)
　　　
const debug = process.env.NODE_ENV !== 'production'
　　　
export default new Vuex.Store({
  // root
  state,
  actions,
  mutations,
  getters,
  // 整理過的 modules
  modules: {
    auth,
    products,
  },
  strict: debug
})

````

### root.js
而 root.js 放了些 global 使用的 state 與比較重要的語系切換設定，這裡只列出切換語言的相關程式碼
````
// 為了設定語系引入 Vue
import i18n from '@/i18n'
　　　
export const types = {
  SET_LANGUAGE: 'SET_LANGUAGE',
}
　　　
export const state = {
  lang: localStorage.getItem('LANGUAGE') || 'zh-TW'
}
　　　
export const getters = {
  getLanguage: state => state.lang,
}
　　　
export const actions = {
  setLanguage ({ commit }, lang) {
    commit(types.SET_LANGUAGE, lang)
  },
}
　　　
export const mutations = {
  [types.SET_LANGUAGE] (state, setlang) {
    state.lang = setlang
    localStorage.setItem('LANGUAGE', setlang)
    // 改變全域語系設定
    i18n.locale = state.lang
  }
}
````

所以在 vue component 切換語系時，只要呼叫 `setLanguage` 就好
````
changeLanguage (value) {
  this.$store.dispatch('setLanguage', value)
}
````

### modules
而其他 store 模組，大致上如下:
````
const state = {
  payload: null
}
　　　
const getters = {
  getPayload: state => state.payload
}
　　　
const actions = {
  acitonName ({ commit }, payload) {
    commit(mutationFunc, payload)
  }
}
　　　
const mutations = {
  mutationFunc (state, payload) {
    state.payload = payload
  },
}
　　　
export default {
  state,
  getters,
  actions,
  mutations
}
````

雖然看起來都只是把寫過的 code 貼上來，畢竟也是當初花了不少時間寫的，雖然有資料可以參考，參考的資料都是比較精簡的，真的要應用到專案裡，還是有很多需要自己調整的部分，做這個紀錄也只是為了之後有跡可循可以自己參考用

未完...待續....