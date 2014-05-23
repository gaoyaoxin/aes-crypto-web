(function () {
  'use strict';
  var gulp = require('gulp'),

    uglify      = require('gulp-uglify'),
    rename      = require('gulp-rename'),
    karma       = require('gulp-karma'),
    connect     = require('gulp-connect'),
    concat      = require('gulp-concat'),
    sass        = require('gulp-sass'),
    Q           = require('q'),
    prefix      = require('gulp-autoprefixer'),
    minifyCSS   = require('gulp-minify-css'),
    usemin      = require('gulp-usemin'),
    rev         = require('gulp-rev'),
    clean       = require('gulp-clean'),

    paths = {
      scripts: ['src/js/**/*.js'],
      dest: 'dist',
      temp: 'tmp',
      destFileName: 'aes_crypto.js',
      destFileNameCSS: 'aes_crypto.css',
      app: ['./app/*.html', './app/scripts/*.js']
    };

  gulp.task('scripts', function() {
    return gulp.src(paths.scripts)
      .pipe(concat(paths.destFileName))
      .pipe(rename({extname: '.js'}))
      .pipe(gulp.dest(paths.dest + '/js') );
  });

  gulp.task('scripts_min', function() {
    return gulp.src(paths.scripts)
      .pipe(concat(paths.destFileName))
      .pipe(uglify())
      .pipe(rename({extname: '.min.js'}))
      .pipe(gulp.dest('dist' + '/js'));
  });

  gulp.task('sass', function () {
    gulp.src('app/scss/app.scss')
      .pipe(concat(paths.destFileNameCSS))
      .pipe(sass())
      .pipe(prefix(['last 1 version', '> 1%', 'ie 8', 'ie 7'], { cascade: true }))
      .pipe(gulp.dest(paths.temp + '/css'));
  });

  gulp.task('sass_min', function () {
    gulp.src(paths.styles)
      .pipe(concat(paths.destFileNameCSS))
      .pipe(sass())
      .pipe(prefix(['last 1 version', '> 1%', 'ie 8', 'ie 7'], { cascade: true }))
      .pipe(minifyCSS({keepBreaks:true}))
      .pipe(rename({extname: '.min.css'}))
      .pipe(gulp.dest(paths.dest + '/css'));
  });

  gulp.task('test', function() {
    return gulp.src('take files from karma.conf please')
      .pipe(karma({
        configFile: 'karma.conf.js',
        action: 'run'
      }));
  });

  gulp.task('e2e_test', ['connect'], function(cb) {
    var deferred = Q.defer();

    var spawn = require('child_process').spawn;
    var ls    = spawn('./node_modules/protractor/bin/protractor', ['protractor.conf.js']);
    ls.stdout.on('data', function (data) {
      console.log('' + data);
    });

    ls.stderr.on('data', function (data) {
      console.log('Test error: ' + data);
    });

    ls.on('close', function (code) {
      if (code === 0) {
        deferred.resolve();
        process.exit(1);
      } else {
        cb('Test failed');
      }
    });

    return deferred.promise;
  });

  gulp.task('connect', ['build'], connect.server({
    root: ['app', 'dist'],
    port: 1336,
    livereload: true,
    open: {
      browser: 'Google Chrome'
    }
  }));

  gulp.task('html', ['build'], function() {
    gulp.src('./app/*.html').pipe(connect.reload());
  });

  gulp.task('watch', function() {
    gulp.watch(paths.app, ['html']);
  });

  gulp.task('watch_source', function() {
    gulp.watch(paths.scripts.concat('src/css/**/*'), ['scripts_min', 'html']);
  });

  gulp.task('usemin', ['clean', 'sass'], function() {
    gulp.src('./app/*.html')
      .pipe(usemin({
        js: [uglify(), rev()]
      }))
      .pipe(gulp.dest(paths.dest));
  });

  gulp.task('clean', function () {
    return gulp.src(paths.dest, {read: false})
      .pipe(clean());
  });

  gulp.task('build', ['scripts', 'scripts_min', 'sass', 'sass_min']);
  gulp.task('serve', ['connect', 'watch', 'watch_source']);
  gulp.task('default', ['build']);
})();
