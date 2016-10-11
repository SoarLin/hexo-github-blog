var gulp = require('gulp');

// Minify CSS
var cssnano = require('gulp-cssnano');
var sourcemaps = require('gulp-sourcemaps');
gulp.task('minify-css', function () {
    return gulp.src('./public/css/*.css')
        .pipe(sourcemaps.init())
        .pipe(cssnano({
            zindex: false
        }))
        .pipe(sourcemaps.write('maps/'))
        .pipe(gulp.dest('./public/css'));
});

// 壓縮 HTML
var uglify = require('gulp-uglify');
var htmlmin = require('gulp-htmlmin');
var htmlclean = require('gulp-htmlclean');
gulp.task('minify-html', function() {
  return gulp.src('./public/**/*.html')
    .pipe(htmlclean())
    .pipe(htmlmin({
         removeComments: true,
         minifyJS: true,
         minifyCSS: true,
         minifyURLs: true,
    }))
    .pipe(gulp.dest('./public'))
});

// Minify JS
gulp.task('minify-js', function() {
    return gulp.src('./public/js/*.js')
        .pipe(uglify())
        .pipe(gulp.dest('./public/js'));
});


// 壓縮圖片
var imagemin = require('gulp-imagemin')
gulp.task('images', function () {
    gulp.src('./public/images/**/*.*')
        .pipe(imagemin({
            progressive: true
        }))
        .pipe(gulp.dest('./public/images'))
});


// 执行 gulp 命令时执行的任务
gulp.task('default', [
    'minify-html','minify-css','minify-js','images'
]);