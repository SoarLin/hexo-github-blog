// var cb = function() {
//     var css = ['/css/bootstrap.min.css', '/css/blog-style.css', '/css/font-awesome.min.css'];
//     css.forEach(function(file){
//         let cssLink = document.createElement('link');
//         cssLink.ref = 'stylesheet';
//         cssLink.href = file;
//         document.getElementsByTagName('head')[0].appendChild(cssLink);
//     });
//     // var l = document.createElement('link');
//     // l.rel = 'stylesheet';
//     // l.href = '/css/bootstrap.min.css';
//     // var h = document.getElementsByTagName('head')[0];
//     // h.appendChild(l);
// };
// var raf = requestAnimationFrame || mozRequestAnimationFrame ||
//   webkitRequestAnimationFrame || msRequestAnimationFrame;
// if (raf) {
//     raf(cb);
// } else {
//     window.addEventListener('load', cb);
// }
loadCSS( "/css/bootstrap.min.css" );
loadCSS( "/css/blog-style.css" );
loadCSS( "/css/font-awesome.min.css" );

// Tooltip Init
$(function() {
    $('[data-toggle="tooltip"]').tooltip();
});

// responsive tables
$(document).ready(function() {
    $('table').wrap('<div class="table-responsive"></div>');
    $('table').addClass('table');
});

var getParameterByName = function(name, url) {
    if (!url) url = window.location.href;
    name = name.replace(/[\[\]]/g, "\\$&");
    var regex = new RegExp("[?&]" + name + "(=([^&#]*)|&|#|$)"),
        results = regex.exec(url);
    if (!results) return null;
    if (!results[2]) return '';
    return decodeURIComponent(results[2].replace(/\+/g, " "));
};

$('#searchModal').on('hide.bs.modal', function(){
    var url = location.href;
    if (/\?query\=/.test(url)) {
        location.href = location.origin;
    }
});

// Search
$(document).ready(function() {
    // if (window.location.href.includes('soarlin.github')) {
    //     $('#sidebar_search').hide();
    // }

    var query = getParameterByName('query');
    var jsonld = JSON.parse($("#query_jsonld").text());
    if (query !== null) {
        // update ld+json content
        jsonld.potentialAction.target = jsonld.potentialAction.target.replace('query_string', encodeURI(query));
        jsonld.potentialAction['query-input'] = jsonld.potentialAction['query-input'].replace('query_string', encodeURI(query));
        $("#query_jsonld").text( JSON.stringify(jsonld) );

        $("#result").html('');
        // var esUrl = 'https://es.quizfun.co:3000/search/soarlin/blog/';
        // ElasticSearch on Google Cloud Platform, DNS setting on godaddy
        var esUrl = 'https://soar.stco.tw/search/blog/articles/';
        var data = { keyword: query, size: 5};
        $.post(esUrl, data, function(result) {
            var resultHtml = createSearchResultList(result);
            $("#result").append(resultHtml);
            $("#result").delegate('.result-card', 'click', redirectToLink.bind(this));
        });

        $('#blog_search').val('');
        $('#searchModal').modal('show');
        return false;
    }

    if ($('#blog_search').length) {
        $('#blog_search').keypress(function(e) {
            if (!e) e = window.event;
            var keyCode = e.keyCode || e.which;
            if (keyCode == '13'){
                var keyword = $('#blog_search').val();
                $('#search_key_word').text('"' + keyword + '"');
                console.log('serach keyword = '+keyword);
                location.href = location.origin + '?query=' + keyword;

                /*
                $("#result").html('');
                // var esUrl = 'https://es.quizfun.co:3000/search/soarlin/blog/';
                // ElasticSearch on Google Cloud Platform, DNS setting on godaddy
                var esUrl = 'https://soar.stco.tw/search/blog/articles/';
                var data = { keyword: keyword, size: 5};
                $.post(esUrl, data, function(result) {
                    var resultHtml = createSearchResultList(result);
                    $("#result").append(resultHtml);
                    $("#result").delegate('.result-card', 'click', redirectToLink.bind(this));
                });

                $('#blog_search').val('');
                $('#searchModal').modal('show');
                return false;
                */
            }
        });
    }

    function redirectToLink(object) {
        var baseURI = object.currentTarget.baseURI.split('?')[0];
        var link = $(object.currentTarget).data('url');
        window.location.href = baseURI + link;
    }

    function createSearchResultList(result) {
        var resultHtml = '';
        result.forEach(function(v,i) {
            var all_tags = '';
            v.tags.forEach(function(v){
                all_tags += '<span class="label label-info label-space">' + v + '</span>';
            });
            resultHtml += '<div class="result-card" data-url="'+v.link+'">' +
                            '<a class="result-title">'+v.title+'</a>' +
                            '<div class="result-category">Catrgory : <mark>' + v.categories[0] + '</mark><br />' +
                            all_tags + '</div></div>';
        });
        return resultHtml;
    }
});

// responsive embed videos
$(document).ready(function () {
    $('iframe[src*="youtube.com"]').wrap('<div class="embed-responsive embed-responsive-16by9"></div>');
    $('iframe[src*="youtube.com"]').addClass('embed-responsive-item');
    $('iframe[src*="vimeo.com"]').wrap('<div class="embed-responsive embed-responsive-16by9"></div>');
    $('iframe[src*="vimeo.com"]').addClass('embed-responsive-item');
});

// 判断是不是博文页面
function isPages(attr){
    var currentBoolean = document.querySelector('.navbar.navbar-custom').getAttribute(attr);
    if(currentBoolean === 'true'){return true;}
    return false;
}
/*
    滚动函数
    接收三个参数,
        1 接收一个DOM对象
        2 给目标对象切换class
        3 触发的高度 (可选项,如果不指定高度,会将DOM的高度作为触发高度)
*/
function scrollCheck(scrollTarget, toggleClass, scrollHeight){
    document.addEventListener('scroll',function(){
    var currentTop = window.pageYOffset;
        currentTop > (scrollHeight||scrollTarget.clientHeight)
        ?scrollTarget.classList.add(toggleClass)
        :scrollTarget.classList.remove(toggleClass)
    })
}

//主页
(function(){
    if(!isPages('data-ispost')){
        var navbar = document.querySelector('.navbar.navbar-custom')
        navbar.classList.add('is-fixed');
    }

})();

/*
* 先获取H1标签
* 然后滚动出现固定导航条后
* 将其内容放到上面居中显示
* */

/*
    博文页面
*/
(function(){
    if (isPages('data-ispost')){
        var navbar = document.querySelector('.navbar-custom');
        var introHeader = document.querySelector('.intro-header').offsetHeight;
        var introHeader = introHeader > 497 ? introHeader : 400;
        var toc = document.querySelector('.toc-wrap');
        var postTitle = document.querySelector('.post-title-haojen');
        scrollCheck(toc,'toc-fixed',introHeader-60);
        scrollCheck(navbar,'is-fixed');
        scrollCheck(postTitle,'post-title-fixed',introHeader-60);
    }
})();

(function () {
    var navTop = document.querySelector('#nav-top');
    navTop.ondblclick = function () {
        $('body').animate({
            scrollTop: 0
        }, 500)
    }
})();
