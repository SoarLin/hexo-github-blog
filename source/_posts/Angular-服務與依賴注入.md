---
layout: post
title: Angular 服務與依賴注入
author: Soar Lin
cdn: header-off
header-img: ''
date: 2022-02-21 23:25:40
tags:
  - Angular
  - dependency injection
categories:
  - Frontend
---

今天在解掉了工作上遇到的問題後，也順便加深了對 Angular 的瞭解，主要是在 Service 以及 Dependency injection 的處理應用上。

雖然官方文件上都寫得清清楚楚，不過當初上手開發的時候，只有買一個線上課程，花一個週末的時間上完課就硬上了，不然公司有任務要做，沒有太多時間讓我慢慢熟悉這個新的前端開發框架，所以在同事的推薦下，花了一些錢買了 Udemy 上的課程 「[Angular 開發實戰：從零開始](https://www.udemy.com/course/angular-zero/)」，這是業界有名的保哥開的課程，很快的讓我就能夠上手，剩下的就是參考目前專案內其他類似的程式碼了。

<!-- more -->

而這次遇到的問題，再花了很久時間 debug 後發現是使用到的某個服務，在某些情況下會保留前一次某列表的搜尋參數資料，然後在下次到另一個列表時，會再把先前的參數帶入，造成不必要的 filter，而 query 不出原本預期的結果。一開始先使用 workaround 的方式在每次要進行 query 前，重新把不必要的參數清空，確實可以解決問題，但是這樣無法滿足人類想探求真理的心。

因為這種會多帶參數的情況，在某頁面的五個 tab 下，有三個頁面的列表會出現這情況，另外兩個則不會。所以就根據這樣的線索來找差異性。後來發現似乎在 `@Component` 裡面，兩者差了一個 `providers`，在試著把有問題的三個列表用同樣的方式加上 `providers` 就可以解決問題。

所以底下就來介紹一下 Service 以及 Dependency injection 的關聯。

> 官方文件：[服務與依賴注入簡介](https://angular.tw/guide/architecture-services)

### 開發 Service 註冊與使用方式

在 Angular 下，如果要將一個 Class 撰寫成可以被重複使用的 Service，那就在撰寫的時候，將這個 Class 上方加入 `@Injectable()` 這個裝飾器，然後在特定的 NgModule 內註冊使用，這樣就可以在其他 Component 中透過在 `constructor` 內加入這 Service 就能夠注入使用。

```typescript
// hero.service.ts
@Injectable()
export class HeroService {
  private heroes: Hero[] = [];

  constructor() { }

  getHeroes() {
    return this.heroes;
  }
}
```

```typescript
@NgModule({
  providers: [
    HeroService,
  ],
  // ...
})
```

```typescript
// hero-list.component.ts
export class HeroListComponent implements OnInit {
  constructor(private heroService: HeroService) { }

  ngOnInit() {
  }
}

```

這種寫法，會讓 Server 在還沒初始化時，新增一個 instance 後回傳給 component 來使用。如果已經初始化過了，就會回傳已經存在的 instance。所以當不同 Component 都使用這樣的方式來注入 Service 時，就會用到 Service 內**相同的 heros 屬性**。

```typescript
// if heroService is not existed, it will new an instance of HeroService
// if heroService is exist, it will use the same instance of HeroService
constructor(private service: HeroService) { }
```

### 每個 Component 使用新的 Service instance

如果在不同的 Component 中，要注入一個新的 Service 的 instance，就要在 `@Component()` 裡面使用 `providers` 屬性來註冊 Service，這時候就會替這個 Component 產生一個新的 Service instance。

```typescript
// hero-list.component.ts
@Component({
  selector:    'app-hero-list',
  templateUrl: './hero-list.component.html',
  providers:  [ HeroService ] // force to new an instance of HeroService
})
export class HeroListComponent implements OnInit {
  constructor(private heroService: HeroService) { }

  ngOnInit() {
  }
}
```

### 建立 Singleton Service

另外，如果 Service 需要使用到 Singelton 模式，就是在 `@Injectable()` 裡面加入 `providedIn: 'root'`，這樣就會在 App Module 中生成一個 Singelton instance，並且在其他 Component 中也可以直接使用。

```typescript
// hero.service.ts
@Injectable({
  providedIn: 'root'
})
export class HeroService {
  private heroes: Hero[] = [];

  constructor() { }

  getHeroes() {
    return this.heroes;
  }
}
```

至於如果已經在 `@Injectable` 裡面加上 `providedIn: 'root'`，而在 Component 使用時，又用上 `providers` 屬性，我目前還沒這樣做過，不過我猜 Singleton 應該就失效了，畢竟強迫要新增一個 instance 了。
