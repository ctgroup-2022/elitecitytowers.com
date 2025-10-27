const gulp = require('gulp');
const sass = require('gulp-sass')(require('sass'));
const cleanCSS = require('gulp-clean-css');
const uglify = require('gulp-uglify');
const concat = require('gulp-concat');
const imagemin = require('gulp-imagemin');
const autoprefixer = require('gulp-autoprefixer');
const sourcemaps = require('gulp-sourcemaps');
const browserSync = require('browser-sync').create();
const del = require('del');

// Paths
const paths = {
  src: {
    scss: 'assets/sass/**/*.scss',
    css: 'assets/css/**/*.css',
    js: 'assets/js/**/*.js',
    img: 'assets/img/**/*.{jpg,jpeg,png,gif,svg}',
    php: '*.php'
  },
  dist: {
    css: 'dist/assets/css',
    js: 'dist/assets/js',
    img: 'dist/assets/img',
    root: 'dist'
  }
};

// Clean dist folder
function clean() {
  return del([paths.dist.root]);
}

// Compile SCSS to CSS
function styles() {
  return gulp.src(paths.src.scss)
    .pipe(sourcemaps.init())
    .pipe(sass().on('error', sass.logError))
    .pipe(autoprefixer({
      cascade: false
    }))
    .pipe(cleanCSS())
    .pipe(sourcemaps.write('.'))
    .pipe(gulp.dest(paths.dist.css))
    .pipe(browserSync.stream());
}

// Process existing CSS files
function processCSS() {
  return gulp.src(paths.src.css)
    .pipe(sourcemaps.init())
    .pipe(autoprefixer({
      cascade: false
    }))
    .pipe(cleanCSS())
    .pipe(sourcemaps.write('.'))
    .pipe(gulp.dest(paths.dist.css));
}

// Minify and concatenate JavaScript
function scripts() {
  return gulp.src([
    'assets/js/vendor/jquery-3.6.0.min.js',
    'assets/js/bootstrap.min.js',
    'assets/js/slick.min.js',
    'assets/js/jquery.magnific-popup.min.js',
    'assets/js/imagesloaded.pkgd.min.js',
    'assets/js/isotope.pkgd.min.js',
    'assets/js/main.js'
  ])
    .pipe(sourcemaps.init())
    .pipe(concat('app.min.js'))
    .pipe(uglify())
    .pipe(sourcemaps.write('.'))
    .pipe(gulp.dest(paths.dist.js))
    .pipe(browserSync.stream());
}

// Optimize images
function images() {
  return gulp.src(paths.src.img)
    .pipe(imagemin([
      imagemin.gifsicle({ interlaced: true }),
      imagemin.mozjpeg({ quality: 75, progressive: true }),
      imagemin.optipng({ optimizationLevel: 5 }),
      imagemin.svgo({
        plugins: [
          { removeViewBox: true },
          { cleanupIDs: false }
        ]
      })
    ]))
    .pipe(gulp.dest(paths.dist.img));
}

// Copy PHP files
function php() {
  return gulp.src(paths.src.php)
    .pipe(gulp.dest(paths.dist.root));
}

// Copy other assets
function copyAssets() {
  return gulp.src([
    'assets/**/*',
    '!assets/sass/**',
    '!assets/css/**/*.css.map',
    '!assets/js/**/*.js.map'
  ], { base: '.' })
    .pipe(gulp.dest(paths.dist.root));
}

// BrowserSync server
function serve() {
  browserSync.init({
    server: {
      baseDir: './'
    },
    port: 3000,
    open: true,
    notify: false
  });
}

// Watch files
function watch() {
  gulp.watch(paths.src.scss, styles);
  gulp.watch(paths.src.css, processCSS);
  gulp.watch(paths.src.js, scripts);
  gulp.watch(paths.src.php).on('change', browserSync.reload);
  gulp.watch('*.php').on('change', browserSync.reload);
}

// Development task
gulp.task('dev', gulp.series(clean, gulp.parallel(styles, processCSS, scripts, images, php), gulp.parallel(serve, watch)));

// Build task
gulp.task('build', gulp.series(clean, gulp.parallel(styles, processCSS, scripts, images, copyAssets, php)));

// Default task
gulp.task('default', gulp.series('dev'));