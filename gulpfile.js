var { series, src, dest } = require('gulp');

// Minify CSS
var cssnano = require('gulp-cssnano');
var sourcemaps = require('gulp-sourcemaps');
function minifyCss() {
    return src('./public/css/*.css')
        .pipe(sourcemaps.init())
        .pipe(cssnano({
            zindex: false
        }))
        .pipe(sourcemaps.write('maps/'))
        .pipe(dest('./public/css'));
}

// 壓縮 HTML
var uglify = require('gulp-uglify');
var htmlmin = require('gulp-htmlmin');
var htmlclean = require('gulp-htmlclean');
function minifyHtml() {
    return src('./public/**/*.html')
        .pipe(htmlclean())
        .pipe(htmlmin({
            removeComments: true,
            minifyJS: true,
            minifyCSS: true,
            minifyURLs: true,
        }))
        .pipe(dest('./public'));
}

// Minify JS
function minifyJs() {
    return src('./public/js/*.js')
        .pipe(uglify())
        .pipe(dest('./public/js'));
}


// 壓縮圖片
var imagemin = require('gulp-imagemin')
function images() {
    return src('./public/images/**/*.*')
        .pipe(imagemin({
            progressive: true
        }))
        .pipe(dest('./public/images'))
}


// 执行 gulp 命令时执行的任务
exports.default = series(minifyHtml, minifyCss, minifyJs, images)