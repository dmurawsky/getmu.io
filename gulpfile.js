var gulp = require('gulp');
var less = require('gulp-less');
var browserSync = require('browser-sync').create();
var header = require('gulp-header');
var cleanCSS = require('gulp-clean-css');
var rename = require("gulp-rename");
var uglify = require('gulp-uglify');
var s3 = require('gulp-s3-upload')({});


// Compile LESS files from /less into /css
gulp.task('less', function() {
    return gulp.src('less/get-mu.less')
        .pipe(less())
        .pipe(gulp.dest('dist/css'))
        .pipe(browserSync.reload({
            stream: true
        }))
});

// Minify compiled CSS
gulp.task('minify-css', ['less'], function() {
    return gulp.src('dist/css/get-mu.css')
        .pipe(cleanCSS({ compatibility: 'ie8' }))
        .pipe(rename({ suffix: '.min' }))
        .pipe(gulp.dest('dist/css'))
        .pipe(browserSync.reload({
            stream: true
        }))
});

// Minify JS
gulp.task('minify-js', function() {
    return gulp.src('js/get-mu.js')
        .pipe(uglify())
        .pipe(rename({ suffix: '.min' }))
        .pipe(gulp.dest('dist/js'))
        .pipe(browserSync.reload({
            stream: true
        }))
});

// Copy static artifacts to /dist
gulp.task('static', function() {
    gulp.src(['img/**/*'])
        .pipe(gulp.dest('dist/img'))
    
    gulp.src(['index.html','favicon.ico'])
        .pipe(gulp.dest('dist/'))
});
    
// Copy lib libraries from /node_modules into /lib
gulp.task('copy', function() {
    gulp.src(['node_modules/bootstrap/dist/**/*', '!**/npm.js', '!**/bootstrap-theme.*', '!**/*.map'])
        .pipe(gulp.dest('dist/lib/bootstrap'))

    gulp.src(['node_modules/jquery/dist/jquery.js', 'node_modules/jquery/dist/jquery.min.js'])
        .pipe(gulp.dest('dist/lib/jquery'))

    gulp.src(['node_modules/simple-line-icons/*/*'])
        .pipe(gulp.dest('dist/lib/simple-line-icons'))


    gulp.src([
            'node_modules/font-awesome/**',
            '!node_modules/font-awesome/**/*.map',
            '!node_modules/font-awesome/.npmignore',
            '!node_modules/font-awesome/*.txt',
            '!node_modules/font-awesome/*.md',
            '!node_modules/font-awesome/*.json'
        ])
        .pipe(gulp.dest('dist/lib/font-awesome'))
})

// Run everything
gulp.task('default', ['less', 'minify-css', 'minify-js', 'copy', 'static']);

// Configure the browserSync task
gulp.task('browserSync', function() {
    browserSync.init({
        server: {
            baseDir: 'dist'
        },
    })
})

// Dev task with browserSync
gulp.task('dev', ['browserSync', 'default'], function() {
    gulp.watch('*.html', ['static']);
    gulp.watch('js/*.js', ['minify-js']);
    gulp.watch('less/*.less', ['less']);
    gulp.watch('dist/css/*.css', ['minify-css']);
    // Reloads the browser whenever HTML or JS files change
    gulp.watch('dist/**/*', browserSync.reload);
});


// Deploy
gulp.task("deploy", ['default'], function() {
    gulp.src("./dist/**")
        .pipe(s3({
            Bucket: 'getmu.io', //  Required
            ACL:    'public-read'       //  Needs to be user-defined
        }, {
            // S3 Constructor Options, ie:
            maxRetries: 5
        }))
    ;
});