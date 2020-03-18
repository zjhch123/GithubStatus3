const gulp = require('gulp')
const postcss = require('gulp-postcss')
const sass = require('gulp-sass')
const concat = require('gulp-concat')
const cleanCSS = require('gulp-clean-css')

const sassEntry = './app/render/scss/index.scss'
const cssEntry = './app/render/css/*.css'
const cssExportDirectory = './app/render/css/'
const cssExportName = 'style.css'

gulp.task('css', function() {
  return gulp.src(sassEntry)
    .pipe(sass().on('error', (err) => {
      console.error(err.message)
    }))
    .pipe(postcss())
    .pipe(concat(cssExportName))
    .pipe(gulp.dest(cssExportDirectory))
})

gulp.task('clean-css', function() {
  return gulp.src(cssEntry)
    .pipe(cleanCSS())
    .pipe(gulp.dest(cssExportDirectory))
})

gulp.task('dev', () => {
  gulp.watch('./app/render/scss/*.scss', {
    ignoreInitial: false,
  }, gulp.series(['css']))
})

gulp.task('build', gulp.series(['css', 'clean-css']))
