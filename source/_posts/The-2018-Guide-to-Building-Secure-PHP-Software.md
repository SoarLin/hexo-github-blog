---
layout: post
title: 2018建立安全PHP軟體指南
author: Soar Lin
cdn: header-off
header-img: ''
date: 2017-12-18 23:32:17
tags:
 - 'security'
 - 'composer'
 - 'https'
 - 'injection'
 - 'XSS'
 - 'CSRF'
 - 'password'
categories:
 - 'PHP'
---

<!-- MarkdownTOC -->

- [PHP Versions](#php-versions)
- [Dependency Management](#dependency-management)
  - [Recommended Packages](#recommended-packages)
- [HTTPS and Browser Security](#https-and-browser-security)
  - [Security Headers](#security-headers)
  - [Subresource Integrity](#subresource-integrity)
  - [Document Relationships](#document-relationships)
- [Developing Secure PHP Software](#developing-secure-php-software)
  - [Database Interaction](#database-interaction)
  - [File Uploads](#file-uploads)
  - [Cross-Site Scripting \(XSS\)](#cross-site-scripting-xss)
  - [Cross-Site Request Forgery \(CSRF\)](#cross-site-request-forgery-csrf)
  - [XML Attacks \(XXE, XPath Injection\)](#xml-attacks-xxe-xpath-injection)
  - [Deserialization and PHP Object Injection](#deserialization-and-php-object-injection)
  - [Password Hashing](#password-hashing)
  - [General-Purpose Cryptography](#general-purpose-cryptography)
- [Specialized Use-Cases](#specialized-use-cases)
  - [Searchable Encryption](#searchable-encryption)
  - [Token-based Authentication without Side-Channels](#token-based-authentication-without-side-channels)
  - [Developing Secure APIs](#developing-secure-apis)
  - [Security Event Logging with Chronicle](#security-event-logging-with-chronicle)
- [作者後記](#%E4%BD%9C%E8%80%85%E5%BE%8C%E8%A8%98)
- [Resources](#resources)

<!-- /MarkdownTOC -->

原文網址：[https://paragonie.com/blog/2017/12/2018-guide-building-secure-php-software](https://paragonie.com/blog/2017/12/2018-guide-building-secure-php-software)

隨著將到來的 2018 年，一般技術人員（尤其是網路開發者）必須拋棄原有開發安全 PHP 應用軟體的舊習與信念。尤其是對於許多不相信這樣壯舉的人來說。
本指南作為「[PHP: The Right Way](http://www.phptherightway.com/)」電子書（[繁中版](http://laravel-taiwan.github.io/php-the-right-way/)）的補充，強調的是安全性，而不是一般PHP程式開發者主題（如：代碼風格）

<a name="php-versions"></a>
# PHP Versions

> 簡而言之：建議在 2018 年運行 PHP 7.2, 並計劃在 2019年初轉換到 PHP 7.3

PHP 7.2 已經在 2017-11-30 釋出。

在撰寫本文時，僅有 PHP 7.1 與 7.2 會得到 PHP 開發人員的積極支援，而 PHP 5.6 和 7.0 大約會在一年內得到安全性修正。

一些提供舊版本PHP的長期支援(LTS)作業系統，這樣的做法通常被認為是有害的。尤其是，在它們增加安全補丁時，不一併增加PHP版號的壞習慣，使得很難推論這些PHP版本的安全性。

因此，無論供應商做出了什麼承諾，只要你能夠幫忙，就應該努力在任何時候運行被主動支持的PHP版本。這樣的話，即使最終只購買一個安全版本，持續升級的工作也會讓你的生活免受不愉快的驚喜。

<a name="dependency-management"></a>
# Dependency Management

> 簡而言之：使用 Composer

用於PHP生態系統最先進的依賴管理解決方案是 Composer。我們強烈推薦可以去看「[PHP: The Right Way](http://www.phptherightway.com/)」裡面有專門介紹 Composer 入門的部分

如果您不使用 Composer 來管理專案的依賴關係，最終會導致您依賴的某個軟件庫嚴重過時，然後將會讓利用舊版本漏洞的電腦犯罪份子有機可趁。

**重要：**在開發軟體的時候，請記得更新依賴軟件庫的版本，可使用這行指令：

````
composer update
````

如果您正在做一些特殊的事情，需要使用PHP擴展（用C語言編寫），那麼就不能用 Composer 來安裝，需要使用 PECL。

<a name="recommended-packages"></a>
## Recommended Packages

不論你在開發什麼，幾乎可以肯定你會受益於這些依賴套件。這也是大多數 PHP 開發人員推薦的（PHPUnit, PHP-CS-Fixer 等等）

**roave/security-advisories**

[Roave's security-advisories](https://github.com/Roave/SecurityAdvisories) 套件使用 [Friends of PHP repository](https://github.com/FriendsOfPHP/security-advisories) 來確保你的專案不依賴任何已知容易受攻擊的軟件庫。

````
composer require roave/security-advisories:dev-master
````

或者您可以將您的 composer.lock 文件上傳到 [Sensio Labs](https://security.sensiolabs.org/)，作為自動化漏洞評估工作流程的一部分，用來提醒任何過舊的軟件套。

**vimeo/psalm**

Psalm 是一個靜態分析工具，可以幫助找出代碼中可能存在的錯誤。雖然還有其他不錯的靜態分析工具（比如Phan和PHPStan都很好），如果發現需要支援 PHP 5的話，Psalm 是 PHP 5.4+ 靜態分析工具的首選。

使用 Psalm 相當容易：

````
# Version 1 doesn't exist yet, but it will one day:
composer require --dev vimeo/psalm:^0

# Only do this once:
vendor/bin/psalm --init

# Do this as often as you need:
vendor/bin/psalm
````

如果是第一次在現有的代碼上運行，可能會看到很多紅色。除非你正在建構像WordPress一樣大的應用程式，不然將很要很費力的才能通過所有的測試。

無論您使用那種靜態分析工具，我們都建議你將它放入現有的持續整合流程中，並在每次程式碼有變動後執行檢查。

<a name="https-and-browser-security"></a>
# HTTPS and Browser Security

> 簡而言之：HTTPS, 要被測試過，安全的檔頭

在2018年，瀏覽網站將不在被接受只用不安全的HTTP，幸運的是，由於ACME協議和Let's Encrypt證書頒發機構，將可以免費獲得以及自動更新TLS證書。

整合 ACME 到網站是小事一件

* [Caddy](https://caddyserver.com/): 自動地綁定了
* [Apache](https://letsencrypt.org/2017/10/17/acme-support-in-apache-httpd.html): 很快地就可以在 mod_md 上用。在那之前，網路上有很多[不錯的教學](https://www.digitalocean.com/community/tutorials/how-to-secure-apache-with-let-s-encrypt-on-ubuntu-16-04)可以參考。
* [Nginx](https://www.nginx.com/blog/using-free-ssltls-certificates-from-lets-encrypt-with-nginx/): 相對直接了當(?)

你可能會想“好吧！我有一個TLS證書了，現在我必須在網站安全且快速之前花費幾個小時來搞這些設定配置”。不！[Mozilla](https://mozilla.github.io/server-side-tls/ssl-config-generator/) 會幫助你。你可以使用[配置生成器](https://mozilla.github.io/server-side-tls/ssl-config-generator/)來根據目標受眾建構推薦的[密碼套件](https://wiki.mozilla.org/Security/Server_Side_TLS)

如果您希望您的網站安全，HTTPS(基於TLS的HTTP)是絕對 non-negotiable(不可協商？)的。使用HTTPS可以立即消除對用戶的多種攻擊(中間人內容注入、竊聽、replay攻擊以及若干形式的 session 操作，否則會允許用戶模擬)

<a name="security-headers"></a>
## Security Headers

然而在您的服務上使用HTTPS確實為您的用戶提供了許多安全性與性能方面的好處，您還可以更近一步通過利用瀏覽器的其他安全功能。當中大部分涉及到與您內容一起發送的HTTP響應檔頭。

* `Content-Security-Policy`
  * 您需要這個檔頭，因為它可以對瀏覽器允許載入內部和外部資源進行詳細控制，進而替跨網域攻擊提供有效的防禦。
  * 請參閱[CSP-Builder](https://github.com/paragonie/csp-builder)，以便快速簡便地部署/管理 Content-Security-Policy。
  * 為了更深入的分析，Scott Helme 對 [Content-Security-Policy 檔頭的介紹](https://scotthelme.co.uk/content-security-policy-an-introduction/)是個很好的入門

* `Expect-CT`
  * 您需要這個，因為它通過強迫不良行為者將他們錯誤發放證書的證據發佈到可公開驗證的附加數據結構中，增加這一層針對流氓/受損證書頒發機構的保護。[瞭解更多Expect-CT](https://scotthelme.co.uk/a-new-security-header-expect-ct/)
  * 最初將它設為 `enforce,max-age=30`，並增加 `max-age` 直到你確定這樣不會造成服務中斷

* `Referrer-Policy`
  * 您需要這個，因為它允許你控制你是否洩漏有關用戶行為信息給第三方
  * Scott Helme 再一次的深入的介紹 [Referrer-Policy 檔頭](https://scotthelme.co.uk/a-new-security-header-referrer-policy/)
  * 設定為 `same-origin` 或 `no-referrer` 除非你有其他理由來設置的更寬鬆

* `Strict-Transport-Security`
  * 您需要這個，因為他告訴瀏覽器強制所有功能請求(requests)透過同源的HTTPS而不是不安全的HTTP。
  * 第一次部署時設定 `max-age=30`，然後當確定沒有任何內容會中斷的時候，將此值增大 (e.g. `31536000`)

* `X-Content-Type-Options`
  * 您需要這個，因為 MIME 類型的混淆可能會導致不可預期的結果，包括在奇怪邊際情況下允許 XSS 漏洞，最好伴著一個標準的 `Content-Type` 檔頭
  * 設為 `nosniff` 除非你需要其他默認的狀況 (e.g. 用於檔案下載)

* `X-Frame-Options`
  * 您需要這個，因為它可以讓你防止點擊劫持(clickjacking)
  * 設為 `DENY` (或 `SAMEORIGIN` 當你使用 **<frame>** 這元素時)

* `X-XSS-Protection`
  * 您需要這個，因為它啟用了一些瀏覽器在默認情況下未啟用的 anti-XSS 功能
  * 設定 `1; mode=block`

同樣的，如果您使用 PHP 內建的 session 管理功能(建議使用)，您可能需要調用 `seeion_start()` ，如下所示：

````
session_start([
    'cookie_httponly' => true,
    'cookie_secure' => true
]);
````

這會強制您的應用程式在 HTTP-Only 或安全標誌下發送 session id 時，防止被 XSS 攻擊竊取用戶資料，且強制他們分別通過 HTTPS 發送，這在之前 2015 年部落格文章中有介紹 [secure PHP sessions](https://paragonie.com/blog/2015/04/fast-track-safe-and-secure-php-sessions)

<a name="subresource-integrity"></a>
## Subresource Integrity

在日後您可能會使用 CDN 的方式來載入 JavaScript / CSS 框架。

資安工程師已經注意到一個明顯的缺失；如果很多網站使用 CDN 來提供他們的內容，那麼 CDN 遭到盜用並且更換內容後，將可會影響到上千的網站。

使用 [subresource integrity](https://developer.mozilla.org/en-US/docs/Web/Security/Subresource_Integrity)

Subresource integrity (SRI) 允許你將 CDN 服務的文件內容進行 hash 處理。SRI 目前只允許使用安全的加密 hash 方法，這表示攻擊者不可能生成跟原始文件內容 hash 後相同的文件。

舉個例子: [Bootstrap v4-alpha uses SRI in their CDN example snippet](https://v4-alpha.getbootstrap.com/)

````
<link
    rel="stylesheet"
    href="https://maxcdn.bootstrapcdn.com/bootstrap/4.0.0-alpha.6/css/bootstrap.min.css"
    integrity="sha384-rwoIResjU2yc3z8GV/NPeZWAv56rSmLldC3R/AZzGRnGxQQKnKkoFVhFQhNUwEyJ"
    crossorigin="anonymous"
/>
<script
    src="https://maxcdn.bootstrapcdn.com/bootstrap/4.0.0-alpha.6/js/bootstrap.min.js"
    integrity="sha384-vBWWzlZJ8ea9aCX4pEW3rVHjgjt7zpkNpZk+02D9phzyeVkE+jo0ieGizqPLForn"
    crossorigin="anonymous"
></script>
````

<a name="document-relationships"></a>
## Document Relationships

網頁開發人員經常在超連結上設置目標屬性(e.g. `target="_blank"`)在新視窗開啟連結，但是，如果沒有使用 `rel="noopener"` 屬性，則可能[允許開啟的頁面來控制原始頁面](https://mathiasbynens.github.io/rel-noopener/)

別這麼做，這會讓 `example.com` 有可能來控制你目前的頁面
````
<a href="http://example.com" target="_blank">Click here</a>
````
請替換成，這樣開啟新視窗到 `example.com` 時，就不用擔心會有惡意的第三方想來操控原本的頁面。
````
<a href="https://example.com" target="_blank" rel="noopener noreferrer">Click here</a>
````
[進一步閱讀](https://www.jitbit.com/alexblog/256-targetblank---the-most-underestimated-vulnerability-ever)

<a name="developing-secure-php-software"></a>
# Developing Secure PHP Software

如果應用程式安全性對你是個新的議題，可先從 [A Gentle Introduction to Application Security(應用程式安全簡介)](https://paragonie.com/blog/2015/08/gentle-introduction-application-security) 開始。大多數資安專家指出，開發人員可以使用 [OWASP Top 10](https://www.owasp.org/index.php/Top_10_2017-Top_10) 等資源。

但是，大多數常見的漏洞可以看作是相同的高級別安全問題實例（代碼與資料沒有完全分離，邏輯不健全，不安全的操作環境，或殘破的密碼協議）。長遠來看，我們會假設教育這些安全新手，對這些安全問題有更簡單、更基本的理解以及如何解決這些問題，將會朔造更好的安全工程。

<a name="database-interaction"></a>
## Database Interaction

> 深入來說: 防止 PHP 應用程序中的 SQL Injection

如果在撰寫 SQL 查詢語句，請確定是使用 prepared statements 的方式來將透過網路傳遞進來的參數傳遞進去，而不是用字串相接的方式來組出 SQL 語句。此外，確定[不是使用 emulated prepared statements](https://stackoverflow.com/a/12202218)

這裡用 [EasyDB](https://github.com/paragonie/easydb) 舉例
````
/* Insecure code: */
$query = $pdo->query("SELECT * FROM users WHERE username = '" . $_GET['username'] . "'");
````
請替換成這樣的語法
````
/* Secure against SQL injection: */
$results = $easydb->row("SELECT * FROM users WHERE username = ?", $_GET['username']);
````
還有其他資料庫抽象層提供了相同的安全性（EasyDB實際背後使用了PDO，避免使用到 emulation prepared statement 來防止安全問題），只要使用者輸入不會影響到查詢的結構，就很安全。(這包括了 stored procedures)

<a name="file-uploads"></a>
## File Uploads

> 深入來說：[如何安全地允許使用者上傳檔案](https://paragonie.com/blog/2015/10/how-securely-allow-users-upload-files)

接受檔案上傳是有風險的，但是可以安全地做到這點，只要採取一些基本的預防措施。也就是說：防止上傳的檔案可直接存取，這種方式可能意外的讓他們能夠被執行。上傳的檔案應該只能是唯讀或可讀可寫，永遠不能被執行。

如果你的網站根目錄為 `/var/www/example.com`，你將不會希望檔案存放到 `/var/www/example.com/uploaded_files`。反之，你希望將檔案放在不能直接存取的獨立目錄中(e.g. `/var/www/example.com-uploaded/)，避免以外的執行了 server 端的 script 並開啟遠端代碼執行。

更簡潔的解決辦法是將根目錄後移一層(如: `/var/www/example.com/public`)

檔案上傳的另一個問題是，安全的下載他們
* SVG 檔案，當直接訪問時，將可能會執行用戶端瀏覽器的 JavaScript 代碼，即使 [MIME 類型是 `image/` 開頭](https://github.com/w3c/svgwg/issues/266)
* 如上所述，MIME sniffing 可能會導致被攻擊，可以參照 [`X-Content-Type-Options`](https://paragonie.com/blog/2017/12/2018-guide-building-secure-php-software#security-headers)
* 如果你放棄先前關於如何安全地儲存上傳文件的建議，攻擊者可透過瀏覽器直接上傳 .php 或 .phtml 來執行任意代碼，進而讓他們獲得伺服器的完整控制權。

<a name="cross-site-scripting-xss"></a>
## Cross-Site Scripting (XSS)

> 深入來說：[你需要知道一切關於 PHP 中的跨站腳本攻擊](https://paragonie.com/blog/2015/06/preventing-xss-vulnerabilities-in-php-everything-you-need-know)

實際上，XSS 和 SQL injection 一樣容易。我們可用個簡單易用的 API 來將檔案結構與資料分離。
不幸的是，在實際經驗上，大多數 Web 開發人員將生成一長串的 HTML 並將它發送到 HTTP 的響應中，這不只在 PHP 開發中見到，這只是一般常見的 Web 開發方式。

減輕 XSS 漏洞不是一個失敗的原因。 但是，瀏覽器安全部分中的所有內容突然變得非常相關。 簡而言之:

1. 輸出永遠記得跳脫(escape)，輸入則不用。如果乾淨的資料放在資料庫中，發現其他地方有 SQL 注入式攻擊(SQL injection)，攻擊者可以惡意軟體完全繞過 XSS 的保護來污染這些資料。
2. 如果您使用的框架樣板引擎有提供自動上下文過濾，請使用它來讓框架變得安全。
3. `echo htmlentities($string, ENT_QUOTES | ENT_HTML5, 'UTF-8');`是個有安全有效的方法來阻止 UTF-8 編碼頁面上所有的 XSS 攻擊，但不允許字串內有 HTML 編碼。
4. 如果允許你使用 Markdown 語法來替代 HTML，就盡可能別用 HTML
5. 如果你需要使用 HTML 而非樣版引擎的話，請使用 [HTML Purifier](http://htmlpurifier.org/)，HTML Purifier 不適合用在 HTML 轉譯的上下文。

<a name="cross-site-request-forgery-csrf"></a>
## Cross-Site Request Forgery (CSRF)

跨網站偽造請求是種混淆副攻擊，通常藉著欺騙用戶瀏覽器或提高用戶權限來，代替攻擊者執行惡意的 HTTP 請求。

一般情況下可以透過簡單的兩步驟來解決：
1. 使用 HTTPS，這是先決條件，在沒有 HTTPS 的情況下連線就相對不安全，不過 HTTPS 並不能制止 CSRF。
2. 添加基本的挑戰響應機制的驗證(challenge-response)
 * 為每個表單加入一個隱藏的表單屬性
 * 填入安全的隨機碼(稱為 token)
 * 驗證表單是否提供這隱藏屬性，是否符合預期

我們寫了個 [Anti-CSRF](https://github.com/paragonie/anti-csrf) 的函式庫來更進階處理：
* 你可以使每個 token 只能使用一次來，來防止重複攻擊
 * 多個 token 存放在後端
 * token 到期後記得替換成新的
* 每個 token 綁定到特定的 URL
 * 如果一個 token 洩漏，就無法在不同的內容中使用
* Token 可以綁定到特定IP
* v2.1版之後，token 就可以被重複使用(為了 AJAX 調用)

如果你用的框架沒有做到 CSRF 漏洞的處理，記得使用 Anti-CSRF。在不久的將來，可以使用 [SameSite cookies 來防止 CSRF 攻擊](https://www.sjoerdlangkemper.nl/2016/04/14/preventing-csrf-with-samesite-cookie-attribute/)。

<a name="xml-attacks-xxe-xpath-injection"></a>
## XML Attacks (XXE, XPath Injection)

在執行大量 XML 處理的應用程序中存在兩個主要的漏洞：
* XML External Entities（XXE）
* XPath Injection

XXE 攻擊可以啟動本地/遠端包含攻擊執行的文件。早期著名的有 Google Docs 遭到 XXE 攻擊，但是在他們大量操作 XML 的商業應用程序之外大部分是聞所未聞的。

針對 XXE 襲擊的主要緩解措施如下：
````
libxml_disable_entity_loader(true);
````
[XPath Injection](https://www.owasp.org/index.php/XPATH_Injection) 與 SQL injection 很像，不過是使用 XML 檔案。幸運的是，PHP 生態中要將用戶輸入的值傳入 XPath 是很罕見的。反之不幸的是，也意味著 PHP 生態中不存在可用的最佳解法，最好的方法是在任何有關 XPath 查詢的資料上使用允許的字符當作白名單。白名單比黑名單來得安全。

````
<?php
declare(strict_types=1);

class SafeXPathEscaper
{
    /**
     * @param string $input
     * @return string
     */
    public static function allowAlphaNumeric(string $input): string
    {
        return \preg_replace('#[^A-Za-z0-9]#', '', $input);
    }

    /**
     * @param string $input
     * @return string
     */
    public static function allowNumeric(string $input): string
    {
        return \preg_replace('#[^0-9]#', '', $input);
    }
}

// Usage:
$selected = $xml->xpath(
    "/user/username/" . SafeXPathEscaper::allowAlphaNumeric(
        $_GET['username']
    )
);
````

<a name="deserialization-and-php-object-injection"></a>
## Deserialization and PHP Object Injection

> 深入來說：[在 PHP 中安全地實現(反)序列化](https://paragonie.com/blog/2016/04/securely-implementing-de-serialization-in-php)

如果將不可靠的數據傳入 `unserialize()`，通常會是下面兩個結果之一：

1. PHP Object Injection，它可以被用來啟動一連串反應並觸發其他被誤用的物件漏洞。
2. PHP 直譯器本身的記憶體損壞

大多數開發者喜歡用 JSON 來做序列化，這對改善軟體安全是有幫助的，但是記住 `json_decode()` 容易受到透過 [hash 碰撞造成的阻斷式攻擊(hash-collision denial-of-service (Hash-DoS))](http://lukasmartinelli.ch/web/2014/11/17/php-dos-attack-revisited.html)，不幸的是 PHP 的 [Hash-DoS 問題還沒能完全解決](https://bugs.php.net/bug.php?id=70644)。

從 djb33 遷移到 SipHash，對於字串的輸入，hash 輸出最高為設為 1，對於整數輸入設置為 0，在每個請求時使用 CSPRNG(密碼學偽隨機數生成器，英文：Cryptographically secure pseudorandom number generator，通稱CSPRNG)，將能完全解決這問題。

不幸的是，PHP 團隊還沒有準備好放棄他們在 PHP 7 中取得的性能提升，所以說服他們放棄 djb33（這個速度非常快，但是不安全），轉而支持SipHash（雖然速度不如 djb33 快，但更安全），這是一個很難解決的問題。如果效能受到重大影響，可能會阻礙在未來版本被採用，進而影響到安全性。

所以，最好的做法是：
* 使用 JSON，因為比 `unserialize()` 安全
* 如果可以，在反序列化輸入內容前先驗證過
  * 對於提供給最終用戶的數據，透過只有網路伺服器才知道的密鑰使用 `sodium_crypto_auth()` 和 `sodium_crypto_auth_verify()`
  * 對於提供給第三方的數據，請他們透過 `sodium_crypto_sign()` 來對 JSON 做簽署，並搭配第三公鑰使用 `sodium_crypto_sign_open()` 來做驗證
    * 如果需要對 hex 或 base64 編碼傳輸進行簽署，也可以使用分離的簽署 API
  * 如果無法驗證 JSON 字串，請嚴格限速並阻止 IP 地址來減少重複的違規者

<a name="password-hashing"></a>
## Password Hashing

> 深入來說：[在2016年如何安全地儲存您的密碼](https://paragonie.com/blog/2016/02/how-safely-store-password-in-2016)

安全的密碼儲存曾經是個激烈的議題，但現在實作起來相當微不足道，特別是在 PHP 中：
````
$hash = \password_hash($password, PASSWORD_DEFAULT);

if (\password_verify($password, $hash)) {
    // Authenticated.
    if (\password_needs_rehash($hash, PASSWORD_DEFAULT)) {
        // Rehash, update database.
    }
}
````
你甚至不用知道背後使用什麼演算法，如果使用了最新版本的 PHP，也就會使用當前最新的演算法，並且只要有新的演算法可用，用戶的密碼也會被自動升級。不論妳做什麼，都不要做 [WordPress 做過的事](https://paragonie.com/blog/2016/08/on-insecurity-popular-open-source-php-cms-platforms#wordpress-password-storage)。

如果你很好奇，從 PHP 5.5 到 PHP 7.2 默認的演算法是 bcrypt，未來可能改用[密碼 hash 大賽冠軍](https://password-hashing.net/)的 Argon2。如果您以前沒有使用 `password_*` API，並且有傳統的 hash 需要遷移，請確保以[這種方式](https://paragonie.com/blog/2016/02/how-safely-store-password-in-2016#legacy-hashes)進行。很多公司弄錯，最有名的是 [Yahoo](https://www.theregister.co.uk/2016/12/15/yahoos_password_hash/)，最近不正確的升級了傳統的 hash 似乎導致了 [Apple 最近的 `iamroot` 錯誤](https://objective-see.com/blog/blog_0x24.html)。


<a name="general-purpose-cryptography"></a>
## General-Purpose Cryptography

這是我們寫的另一個主題：
* [正確使用加密和認證](https://paragonie.com/blog/2015/05/using-encryption-and-authentication-correctly)(2015)
* [如何在PHP中安全地產生隨機字符串和整數](https://paragonie.com/blog/2015/07/how-safely-generate-random-strings-and-integers-in-php)(2015)
* 推薦：[為您的PHP項目選擇正確的加密庫：指南](https://paragonie.com/blog/2015/11/choosing-right-cryptography-library-for-your-php-project-guide)（2015）
* 建議：[You Wouldn't Base64 a Password - Cryptography Decoded](https://paragonie.com/blog/2015/08/you-wouldnt-base64-a-password-cryptography-decoded)（2015）
* [Cryptographically Secure PHP Development](https://paragonie.com/blog/2017/02/cryptographically-secure-php-development)(2017)
* 推薦：[Libsodium快速參考：類似命名的函數及其使用案例](https://paragonie.com/blog/2017/06/libsodium-quick-reference-quick-comparison-similar-functions-and-which-one-use)（2017）

一般來說，您總是希望使用 Sodium 密碼函式庫（libsodium）進行應用層的加密，如果你需要支援 PHP 7.2 之前的版本，可以使用 [sodium_compat](https://github.com/paragonie/sodium_compat)來假裝用戶也在 7.2 的版本。

在特殊情況下，因為嚴格的演算法選擇與相互操作上，您可以需要不同的函式庫。如果有疑問，可以諮詢密碼專家，來了解密碼選擇和密碼工程師實作上是否安全。

<a name="specialized-use-cases"></a>
# Specialized Use-Cases

現在您已經掌握了2018年以後構建安全PHP應用程序的基礎知識，接下來我們來看一些更專業的用例

<a name="searchable-encryption"></a>
## Searchable Encryption

> 深入來說：[使用PHP和SQL構建可搜索的加密資料庫](https://paragonie.com/blog/2017/05/building-searchable-encrypted-databases-with-php-and-sql)

可搜索的加密資料庫是理想的，但普遍被認為是不太可能實現的。上面的文章試圖讓讀者通過我們的解決方案來發展得更深入，但實際上：
1. 設計您的架構，database compromise 不會讓攻擊者訪問您的加密金鑰
2. 在一個密鑰下加密數據
3. 基於 HMAC 或具有靜態 salt 的安全KDF(如: Argon2)創建多個索引（具有它們自己獨特的密鑰）。
4. 可選：放棄第三步驟，使用布隆過濾器(Bloom filter)
5. 在 SELECT 查詢結果使用步驟3或4來輸出
6. 解密結果

這過程的任何一步都可以根據使用情況來斟酌。

<a name="token-based-authentication-without-side-channels"></a>
## Token-based Authentication without Side-Channels

> 深入來說：[Split Tokens: Token-Based Authentication Protocols without Side-Channels](https://paragonie.com/blog/2017/02/split-tokens-token-based-authentication-protocols-without-side-channels)

說到資料庫，你知道 SELECT 查詢在理論上可能是定時訊息洩漏的來源。
簡單的遷移：
1. 把驗證的 token 減少一半
2. 使用一半的 SELECT 查詢在理論上可能是定時訊息洩漏的來源。
3. 在常數時間內驗證後半部
  * 您可以選擇將後半部分的 hash 存在資料庫中，而不是半個 token。這對於只能使用一次的 token 是有意義的;像是密碼重置或“記住我”

這樣即時使用了定時洩漏所竊取來的一半 token，剩下的另一半需要強烈的攻擊才能成功。

<a name="developing-secure-apis"></a>
## Developing Secure APIs

> 深入來說：[使用 Sapient 來強化 PHP 支援的 API](https://paragonie.com/blog/2017/06/hardening-your-php-powered-apis-with-sapient)

我們開發了 Secure API ENgineering Toolkit [SAPIENT](https://github.com/paragonie/sapient)來確保兩台伺服器間的身份驗證不用費太多力氣。除了 HTTPS 提供的安全性外，Sapinet 允許您使用共享密鑰或公鑰加密來加密/驗證訊息。

這使您可以使用 Ed25519 對 API 請求和響應進行身份驗證，或者將消息加密到只能由接收方服務器的密鑰解密，即使存在中間人攻擊者並設有流氓/入侵 證書頒發機構。

由於每個 HTTP 訓息都通過安全密碼進行身份驗證，因此可以安全地使用它來代替有狀態 token 雜耍協議（例如OAuth）。但是，在密碼學方面，在不做任何規範的事情之前，總要確保他們的實現是由專家研究的。

所有 Sapient 使用的密碼都由 Sodium 密碼術函式庫提供。

進一步閱讀:

* [Sapient Documentation](https://github.com/paragonie/sapient/tree/master/docs)
* [Sapient Tutorial](https://github.com/paragonie/sapient/blob/master/docs/Tutorial.md)
* [Sapient Specification](https://github.com/paragonie/sapient/blob/master/docs/Specification.md)

Paragon Initiative Enterprises 已經在其許多產品（包括許多開源軟體專案）中使用了 Sapient，並將繼續為 Sapient 用戶組合添加軟件項目。

<a name="security-event-logging-with-chronicle"></a>
## Security Event Logging with Chronicle

> 深入來說：[Chronicle 會讓你質疑區塊鏈技術的需求](https://paragonie.com/blog/2017/07/chronicle-will-make-you-question-need-for-blockchain-technology)

Chronicle 是個基於 hash-chain 資料結構的 只進行追加(append-only)加密帳本，引起了許多公司對"區塊鏈"技術的興趣。除了只進行追加(append-only)加密帳本具創造性之外，Chronicle 集成到 SIEM 中時也有優點，因為您可以發送安全關鍵事件到私有的 Chronicle 中，並且它們保持不可變。如果您的 Chronicle 設置為將其摘要散列交叉簽名到其他 Chronicle 中，或是還有其他重製您 Chronicle 內容的實例，攻擊者將很難篡改您的安全事件日誌。
通過 Chronicle，您可以獲得區塊鏈的所有彈性，而沒有任何隱私，性能或彈性問題。要將資料發佈到本地的 Chronicle，您可以使用任何與 [Sapient 兼容的 API](https://paragonie.com/blog/2017/12/2018-guide-building-secure-php-software#secure-api-sapient)，但最簡單的解決方案稱為 [Quill](https://github.com/paragonie/quill)。

<a name="%E4%BD%9C%E8%80%85%E5%BE%8C%E8%A8%98"></a>
# 作者後記

一個聰明的讀者可能注意到我們引用了很多我們自己的工作（部落格文章和開源軟件），但我們不僅僅是引用了我們自己的工作。

這不是偶然的。

自從我們於2015年初成立以來，我們一直在編寫安全性相關的函式庫，並致力於提高 PHP 生態系統的安全性。

我們已經介紹了很多，我們的資安工程師（他們最近在 PHP 核心中推行更安全的加密技術，只是要到 PHP 7.2），並不擅長宣揚他的工作或興趣完成的作品。對於我們多年來開發的工具或函式庫，你可能有一半沒聽過，關於這點我很抱歉。

但是，我們也不可能成為各方面的先行者，所以我們在可能的情況下，選擇了認為與公眾利益更一致的專業工作，而不藏私。這就是為什麼瀏覽器安全專用的許多部分都參考了 Scott Helme 和公司的工作，他們在為開發人員提供這些容易理解的新安全功能。

本指南當然不是詳盡的。寫出不安全代碼的方法幾乎和撰寫代碼一樣多。安全是一種心態，而不是目的性。隨著上面所寫的一切與提供的資源，我們希望這將有助於全世界的開發人員從今天開始用 PHP 開發安全的軟體。

<a name="resources"></a>
# Resources

如果您已經按照本篇上的所有內容進行了操作，並且需要更多內容，那麼您可能會對我們策劃的[閱讀列表感興趣，以便學習應用程序安全性](https://github.com/paragonie/awesome-appsec)。

如果你已經寫出了足夠安全的代碼，並且希望我們從資安工程師的角度來提供指教。這正是我們[提供的服務](https://paragonie.com/services)。

[打廣告部分先省略]

接下來是 PHP 和資訊安全社區提供的資源列表，這些資源幫助互聯網更加安全：
* [PHP: The Right Way](http://www.phptherightway.com/)，線上免費的現代PHP開發指南
* [Mozilla's SSL Config Generator](https://mozilla.github.io/server-side-tls/ssl-config-generator/)
* [Let's Encrypt](https://letsencrypt.org/)，通過證書頒發機構提供免費 TLS 證書來創造更安全的網路。
* [Qualys SSL Labs](https://www.ssllabs.com/ssltest) 提供一個快速又簡單的工具來測試 TLS 配置，幾乎每個人都用這個來解決他們安全憑證相關問題。
* [Security Headers](https://securityheaders.io/) 讓您可以使用瀏覽器安全功能來保護您的用戶，且驗證網站安全。
* [Report-URI](https://report-uri.com/) 一個不錯的免費網路資源，用來開始檢查檔頭安全。如果有發現 XSS 的媒介，會被通報到 Report-URI，讓 Report-URI 彙整這些問題來提供你更好的服務。
* [The PHP Security Advent Calendar](https://www.ripstech.com/php-security-calendar-2017) by the team behind [RIPSTech](https://www.ripstech.com/)。
* [Snuffleupagus](https://snuffleupagus.readthedocs.io/), 一個安全導向的 PHP 模組 (有很大程度是被遺棄的 [Suhosin](https://github.com/sektioneins/suhosin) 精神繼承者).
* [PHP Delusions](https://phpdelusions.net/)，一個致力於更好地使用PHP的網站。大部分的口氣都有點自負，但作者對技術的準確性和清晰度的奉獻使得它值得一讀，特別是對於那些不太喜歡PDO功能的人來說。
* [Have I Been Pwned?](https://haveibeenpwned.com/) 幫助用戶找出他們過去的資料是否洩漏。