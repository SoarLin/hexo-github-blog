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

// gulp.task('minify-css', function () {
//     return gulp.src('./public/css/*.css')
//         .pipe(sourcemaps.init())
//         .pipe(cssnano({
//             zindex: false
//         }))
//         .pipe(sourcemaps.write('maps/'))
//         .pipe(gulp.dest('./public/css'));
// });

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
// gulp.task('minify-html', function() {
//   return gulp.src('./public/**/*.html')
//     .pipe(htmlclean())
//     .pipe(htmlmin({
//          removeComments: true,
//          minifyJS: true,
//          minifyCSS: true,
//          minifyURLs: true,
//     }))
//     .pipe(gulp.dest('./public'))
// });

// Minify JS
function minifyJs() {
    return src('./public/js/*.js')
        .pipe(uglify())
        .pipe(dest('./public/js'));
}
// gulp.task('minify-js', function() {
//     return gulp.src('./public/js/*.js')
//         .pipe(uglify())
//         .pipe(gulp.dest('./public/js'));
// });


// 壓縮圖片
var imagemin = require('gulp-imagemin')
function images() {
    return src('./public/images/**/*.*')
        .pipe(imagemin({
            progressive: true
        }))
        .pipe(dest('./public/images'))
}
// gulp.task('images', function () {
//     gulp.src('./public/images/**/*.*')
//         .pipe(imagemin({
//             progressive: true
//         }))
//         .pipe(gulp.dest('./public/images'))
// });


// 执行 gulp 命令时执行的任务
// gulp.task('default', [
//     'minify-html','minify-css','minify-js','images'
// ]);
exports.default = series(minifyHtml, minifyCss, minifyJs, images)