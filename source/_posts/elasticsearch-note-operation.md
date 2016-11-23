---
layout: post
title: Elasticsearch Basic Operation
author: Soar Lin
cdn: header-off
header-img: ''
date: 2016-11-13 13:59:22
tags:
  - elasticsearch
  - index
  - query
  - koa
categories:
  - Server
---
<!-- MarkdownTOC -->

- [Elasticsearch 筆記\(基本操作\)](#elasticsearch-筆記基本操作)
  - [基本指令](#基本指令)
    - [檢查 Server 狀態](#檢查-server-狀態)
    - [列出所有 index](#列出所有-index)
    - [建立 index](#建立-index)
    - [刪除 index](#刪除-index)
    - [建立資料index\(基本單筆資料操作\)](#建立資料index基本單筆資料操作)
    - [取出資料 \(使用id\)](#取出資料-使用id)
    - [更新資料 \(使用id\)](#更新資料-使用id)
    - [刪除資料 \(使用id\)](#刪除資料-使用id)
  - [重要指令](#重要指令)
    - [建立資料index \(批次處理資料\)](#建立資料index-批次處理資料)
  - [搜尋指令](#搜尋指令)
    - [基本方法](#基本方法)
  - [後記](#後記)
    - [建立 Mapping](#建立-mapping)
    - [建立 Server 與 API](#建立-server-與-api)
    - [Refrence](#refrence)

<!-- /MarkdownTOC -->


<a name="elasticsearch-筆記基本操作"></a>
# Elasticsearch 筆記(基本操作)

<a name="基本指令"></a>
## 基本指令

<a name="檢查-server-狀態"></a>
### 檢查 Server 狀態

````
curl localhost:9200
------------------------------
正常運作的話會返回類似下面的 json
{
  "name" : "Apalla",
  "cluster_name" : "soar-local-es",
  "cluster_uuid" : "uBfjdJ-kSkCM8F6Bg7VNDg",
  "version" : {
    "number" : "2.4.1",
    "build_hash" : "c67dc32e24162035d18d6fe1e952c4cbcbe79d16",
    "build_timestamp" : "2016-09-27T18:57:55Z",
    "build_snapshot" : false,
    "lucene_version" : "5.5.2"
  },
  "tagline" : "You Know, for Search"
}
````

<a name="列出所有-index"></a>
### 列出所有 index

````
curl localhost:9200/_cat/indices?v
類似出現下面的畫面，顯示每個index的狀態跟資料筆數等資訊
--------------------------------------
health status index   pri rep docs.count docs.deleted store.size pri.store.size
green  open   quizfun   1   0       5417          301     11.9mb         11.9mb
green  open   soarlin   1   0         16            3    502.1kb        502.1kb
yellow open   blogs     5   1         17            2      255kb          255kb
````

<a name="建立-index"></a>
### 建立 index

````
curl -XPUT localhost:9200/[IndexName]?pretty
----------------------------
成功的話，回傳下面訊息
{
  "acknowledged" : true
}

----------------------------
失敗的話，通常是index已經存在，則是下面訊息
{
  "error" : {
    "root_cause" : [ {
      "type" : "index_already_exists_exception",
      "reason" : "already exists",
      "index" : "customer"
    } ],
    "type" : "index_already_exists_exception",
    "reason" : "already exists",
    "index" : "customer"
  },
  "status" : 400
}
````

<a name="刪除-index"></a>
### 刪除 index

````
curl -XDELETE localhost:9200/[IndexName]?pretty
----------------------------
成功的話，回傳下面訊息
{
  "acknowledged" : true
}
````

<a name="建立資料index基本單筆資料操作"></a>
### 建立資料index(基本單筆資料操作)

底下範例為官網提供，輸入一筆資料與回傳訊息

* index: customer,
* type: external,
* id: 1

````
curl -XPUT 'localhost:9200/customer/external/1?pretty' -d '
{
  "name": "John Doe"
}'
{
  "_index" : "customer",
  "_type" : "external",
  "_id" : "1",
  "_version" : 1,
  "created" : true
}
````

<a name="取出資料-使用id"></a>
### 取出資料 (使用id)

````
curl -XGET 'localhost:9200/customer/external/1?pretty'
{
  "_index" : "customer",
  "_type" : "external",
  "_id" : "1",
  "_version" : 1,
  "found" : true,
  "_source" : { "name": "John Doe" }
}
````

<a name="更新資料-使用id"></a>
### 更新資料 (使用id)

````
curl -XPOST 'localhost:9200/customer/external/1/_update?pretty' -d '
{
  "doc": { "name": "Jane Doe", "age": 20 }
}'

# 需要原本資料在更新 ctx._source.xxxx (實測失敗了)
curl -XPOST 'localhost:9200/customer/external/1/_update?pretty' -d '
{
  "script" : "ctx._source.age += 5"
}'
````

<a name="刪除資料-使用id"></a>
### 刪除資料 (使用id)

````
curl -XDELETE 'localhost:9200/customer/external/1?pretty'
````

<a name="重要指令"></a>
## 重要指令

<a name="建立資料index-批次處理資料"></a>
### 建立資料index (批次處理資料)

使用 bulk 方法將要處理的資料依次為

* 操作方法帶id, 如：建立index, 更新資料, 刪除資料
* 資料內容(刪除時不需要)

操作方法         | 資料內容
--------------- | -------------
建立index 資料 id | {"index":{"_id":"1"}}
建立index 資料內容 | {"name": "John Doe"}
更新資料 依據 id   | {"update":{"_id":"1"}}
更新資料 資料內容  | {"doc": {"name": "Mary Jane", "age": 23} }
建立index 資料id  | {"index":{"_id":"2"}}
建立index 資料內容 | {"name": "John Doe"}
刪除資料 資料id   | {"delete":{"_id":"2"}}


````
curl -XPOST 'localhost:9200/customer/external/_bulk?pretty' -d '
{"index":{"_id":"1"}}
{"name": "John Doe" }
{"update":{"_id":"1"}}
{"doc": {"name": "Mary Jane", "age": 23} }
{"index":{"_id":"2"}}
{"name": "Jane Doe" }
{"delete":{"_id":"2"}}
'
````

<a name="搜尋指令"></a>
## 搜尋指令

使用搜尋引擎(elasticsearch or solr)的好處就是，搜尋的結果，會將搜尋結果的資料，依據加權後總分列出來，一般關聯式資料庫使用 like %keyword% 的話，只能找出所有含有 keyword 的資料，無法根據搜尋字詞來找出關聯程度從高到低的排序過資料。

<a name="基本方法"></a>
### 基本方法

搜尋index下所有資料，回傳資料說明如下：

* took: 在 Elasticsearch 內搜尋所花費的時間(單位: milliseconds, 毫秒, 千分之一秒)
* timed_out: 這次搜尋是否有超時(需要設定超時時間)
* _shards: 搜尋了多少個片段，成功與失敗個數
* hits: 搜尋結果回傳
* hits.total: 搜尋回傳資料筆數
* hits.max_score: 搜尋結果最高分數

````
curl 'localhost:9200/customer/_search?q=*&pretty'

搜尋的結果類似下方資料
------------------------
{
  "took" : 2,
  "timed_out" : false,
  "_shards" : {
    "total" : 5,
    "successful" : 5,
    "failed" : 0
  },
  "hits" : {
    "total" : 2,
    "max_score" : 1.0,
    "hits" : [ {
      "_index" : "customer",
      "_type" : "external",
      "_id" : "1",
      "_score" : 1.0,
      "_source" : {
        "name" : "John Wang",
        "age" : 23
      }
    }, {
      "_index" : "customer",
      "_type" : "external",
      "_id" : "2",
      "_score" : 1.0,
      "_source" : {
        "name" : "Mary Wang"
      }
    } ]
  }
}
````

針對所有欄位搜尋同一關鍵字

````
curl 'localhost:9200/customer/_search?q=wang&pretty'
````

使用 query(Query DSL) 字串做比較精確的搜尋

````
curl -XPOST 'localhost:9200/customer/_search?pretty' -d '
{
  "query": { "match_all": {} },
  "size": 1
}'

curl -XPOST 'localhost:9200/blog/_search?pretty' -d '
{
  "query": { "match": { "content": "postcss" } }
}'

curl -XPOST 'localhost:9200/blog/_search?pretty' -d '
{
  "query": {
    "bool": {
      "must": [
        { "match": { "content": "server" } },
        { "match": { "tags": "linux" } }
      ]
    }
  }
}'
````

<a name="後記"></a>
## 後記

<a name="建立-mapping"></a>
### 建立 Mapping

因為在塞資料建立 index 前，還是得先確認一下之後資料的格式，寫好一個比較ＯＫ的資料 mapping，才能再塞資料的時候確保塞進去的資料格式能夠最佳化被處理，底下是之前找到別人針對 hexo blog 資料格式設定給 elasticsearch 的 mapping，分享給有需要的人參考，當然這是有安裝 ik 中文斷詞套件了

* index: blog
* type: article

````
{
    "settings": {
        "number_of_shards" :   1,
        "number_of_replicas" : 0
    },
    "_default_": {},
    "mappings": {
       "article": {
            "dynamic": false,
            "date_detection": false,
            "_all": {
                  "analyzer": "ik_max_word",
                  "search_analyzer": "ik_smart",
                  "term_vector": "no"
            },
            "properties": {
                "title": {
                    "type": "string" ,
                    "term_vector": "with_positions_offsets",
                    "include_in_all": true,
                    "analyzer": "ik_max_word",
                    "search_analyzer": "ik_smart",
                    "boost": 2
                },
                "slug": {
                    "type": "string",
                    "index": "no"
                },
                "date": {
                    "type": "date",
                    "format": "epoch_second"
                },
                "updated": {
                    "type": "date",
                    "format": "epoch_second"
                },
                "categories": {
                    "type": "string",
                    "index": "not_analyzed"
                },
                "tags": {
                    "type": "string",
                    "index": "not_analyzed"
                },
                "content": {
                    "type": "string",
                    "term_vector": "with_positions_offsets",
                    "include_in_all": true,
                    "analyzer": "ik_max_word",
                    "search_analyzer": "ik_smart",
                    "norms": { "enabled": false }
                }
           }
       }
    }
}
````


<a name="建立-server-與-api"></a>
### 建立 Server 與 API

一開始摸索 Elasticsearch 只是為了給自己 blog 做文章搜尋，所以還得弄一台 server 出來，然後把環境都弄好後，另外再用 node.js 來開發一個 API 介面，主要是為了避免 9200 這個 port 一直裸露在外，到時候被別人發現拿去玩。但是做個 API 介面，弄的很簡陋，似乎也有可能被別人拿去玩...XD。

我想一般人用 node.js 來做 RESTful API 介面的話，應該首選再搭配個 Express Framework 就可以很快搞定了吧！但是！！之前被__正豪__花言巧語騙去學 Koa Framework，結果只好硬著頭皮用 koa 來寫，真的快搞死自己了。

寫的過程才發現原來自己對於 ES6 的 Generator 還是很不熟練，在寫 API 的時候，一度快崩潰，因為有太多 non-blocking callback 要處理，只好還是乖乖地使用 Promise 這方法，雖然可以減少寫出波動拳語法，但還是覺得寫超過三個 promise 後，也是很可怕的事情。


附上部分自己連續五個 promise 的 code, 覺得慘不忍睹

````
yield check_db_json(tmpfile)
    .then(check_last_index_file)
    .then(get_last_index)
    .then(bulkArticles)
    .then(update_last_index_file, function(res){console.log(res.msg);})
    .then(function(res){
        if (res.status === 'ok' || res.status === 'done') {
            console.log(res.msg);
            RESULT.update = 'success';
        }
    }, function(res){
        console.log(res.msg);
    });
````

因為 blog 是使用 hexo+github 的方式，所以寫好 markdown 語法後，透過 hexo 的處理可以產生一個 db.json 檔案，所以可以直接使用這個檔案來建立文章 index，還算方便，而且有人寫好 python 的工具來處理

* [hexo-elasticsearch-tools](https://github.com/mawenbao/hexo-elasticsearch-tools)

但是因為 server 架在雲端，又不開放 9200 port 來直接存取，所以花了很久的時間再將 python 更新文章 index 的行為重新改寫，中間遇到檔案必需上傳，所以還得先弄一個簡單的介面來上傳 db.json，這邊就得再去找 koa 的範例來看

* [Koa example](https://github.com/koajs/examples)
    * 重點套件 [co-busboy](https://www.npmjs.com/package/co-busboy)

雖然花了好幾天在改寫這兩百行出頭的 ptyhon，但是改寫後還是功能沒人家齊全，但是...我有多一個資料上傳介面，所以多了 form 表單要處理，所以也是做得很辛苦，寫完也是兩百多行...XD

<a name="refrence"></a>
### Refrence

另外，也可以參考別人寫的教學，但是我道行太淺，有大部分有看沒有懂

* [Elasticsearch 使用示例及 Hexo 集成](https://www.mawenbao.com/research/elasticsearch-example-and-hexo-integration.html)