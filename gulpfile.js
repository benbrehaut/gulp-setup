/**
 * @function gulp
 * @description the main gulp file for the task runner
 * @version v1
 */
var gulp = require('gulp');
var gulpLoadPlugins = require('gulp-load-plugins');
var $ = gulpLoadPlugins();
var browserSync = require('browser-sync');
var fancyLog = require('fancylog');

/**
 * @function variables
 * @description variables which contain things used throughout this file
 */

// Site URL for Browser Sync
// - - - - - - - - - - - - - - - - - -
const siteURL = 'test-theme.uk';

// Main JS Variables
// - - - - - - - - - - - - - - - - - -
const js = { 
  jsFiles: './assets/js/vendor/**/*.js',
  mainJSFile: './assets/js/scripts.js',
  outputJSFile: './main.js',
  outputJSFileCompressed: './main.min.js',
  outputJSFileLocation: './assets/js/dist',
};

// Main CSS Variables
// - - - - - - - - - - - - - - - - - -
const css = {
  sassFiles: 'assets/scss/**/*.scss',
  mainSassFile: 'assets/scss/style.scss',
  outputCSSFile: 'main.css',
  outputCSSFileCompressed: 'main.min.css',
  outputCSSFileLocation: 'assets/css/dist'
};

// Media Variables
// - - - - - - - - - - - - - - - - - -
const media = {
  imgs: './assets/img',
  icons: './assets/icons'
}

/**
 * @function scripts
 * @description pipes our vendor JS files, main JS file out and minifies it
 * @version v1
 */
gulp.task('scripts', function () {
  fancyLog.info('Merging JS Files..');
  return gulp.src([js.jsFiles, js.mainJSFile])
    .pipe($.babel())
    .on('error', function(err) {
      fancyLog.error('Error: ' + err);
      this.emit('end');
    })
    .pipe($.plumber())
    .pipe($.concat(js.outputJSFile))  // output main JavaScript file without uglify
    .pipe(gulp.dest(js.outputJSFileLocation))
    .pipe($.uglify())
    .pipe($.concat(js.outputJSFileCompressed)) // output main JavaScript file w/ uglify
    .pipe($.size({gzip: true, showFiles: true}))
    .pipe(gulp.dest(js.outputJSFileLocation))
    .pipe(browserSync.reload({ stream: true }))
});

/**
 * @function sass
 * @description compiles our static .scss files into one main .css file
 * @version v1
 */
gulp.task('styles', function () {
  fancyLog.info('Compiling: ' + css.mainSassFile);
  return gulp.src(css.mainSassFile)
    .pipe($.sourcemaps.init())
    .pipe($.sass({
      includePaths: ['scss'],
      outputStyle: 'expanded',
      onError: browserSync.notify
    }).on('error', $.sass.logError))
    .pipe($.sassLint())
    .pipe($.sassLint.format())
    .pipe($.autoprefixer())
    .pipe($.plumber())
    .pipe($.concat(css.outputCSSFile)) // output main CSS file without cleanCSS
    .pipe($.sourcemaps.write('./maps'))
    .pipe(gulp.dest(css.outputCSSFileLocation))
    .pipe($.cleanCss())
    .pipe($.concat(css.outputCSSFileCompressed)) // output main CSS file w/ cleanCSS
    .pipe($.size({gzip: true, showFiles: true}))
    .pipe(gulp.dest(css.outputCSSFileLocation))
    .pipe(browserSync.reload({ stream: true }));
});

/**
 * @function browser-sync
 * @description generates BrowserSync for watching and refreshing page
 * @version v1
 */
gulp.task('browser-sync', ['scripts', 'styles'], function () {
  fancyLog.info('Starting Browser Sync Server at: ' + siteURL);
  browserSync.init({
    proxy: siteURL,
    files: [
      "*.php",
      '**/*.php',
      '*.twig',
      '**/*.twig',
      js.outputJSFileLocation + '/*.js',
      css.outputCSSFileLocation + '/*.css'
    ]
  });
});

/**
 * @function imgs
 * @description compresses static images
 * @version v1
 */
gulp.task('imgs', function () {
  fancyLog.info('Compressing Images in: ' + media.imgs);
  gulp.src(media.imgs + '/**/*.{gif,jpg,png,svg,ico}')
    .pipe($.imagemin())
    .pipe($.size({gzip: true, showFiles: true}))
    .pipe(gulp.dest(media.imgs));
});

/**
 * @function svgs
 * @description generates and creates svg icons using #symbol
 * @version v1
 */
gulp.task('svgs', function () {
  fancyLog.info('Generating icons.svg at: ' + media.icons);
  return gulp.src(media.icons + '/*.svg')
    .pipe($.svgstore())
    .pipe($.size({gzip: true, showFiles: true}))
    .pipe(gulp.dest(media.icons));
});

/**
 * @function watch
 * @description watchs the .js and .scss files for changes
 * @version v1
 */
gulp.task('watch', function () {
  fancyLog.info('Watching Scss and JS files');
  gulp.watch(js.mainJSFile, ['scripts']);
  gulp.watch(css.sassFiles, ['styles']);
});

/**
 * @function default
 * @description runs the default task, which is browser sync and watch tasks
 * @version v1
 */
gulp.task('default', ['browser-sync', 'watch']);