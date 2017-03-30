/*!
 * Clean Blog v1.0.0 (http://startbootstrap.com)
 * Copyright 2015 Start Bootstrap
 * Licensed under Apache 2.0 (https://github.com/IronSummitMedia/startbootstrap/blob/gh-pages/LICENSE)
 */

// Tooltip Init
$(function() {
    $('[data-toggle="tooltip"]').tooltip();
});


// make all images responsive
/*
 * Unuse by Hux
 * actually only Portfolio-Pages can't use it and only post-img need it.
 * so I modify the _layout/post and CSS to make post-img responsive!
 */
// $(function() {
//  $("img").addClass("img-responsive");
// });

// responsive tables
$(document).ready(function() {
    $('table').wrap('<div class="table-responsive"></div>');
    $('table').addClass('table');
});

// Search
$(document).ready(function() {
    // if (window.location.href.includes('soarlin.github')) {
    //     $('#sidebar_search').hide();
    // }

    if ($('#blog_search').length) {
        $('#blog_search').keypress(function(e) {
            if (!e) e = window.event;
            var keyCode = e.keyCode || e.which;
            if (keyCode == '13'){
                var keyword = $('#blog_search').val();
                $('#search_key_word').text('"' + keyword + '"');
                console.log('serach keyword = '+keyword);

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
            }
        });
    }

    function redirectToLink(object) {
        var baseURI = object.currentTarget.baseURI;
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
