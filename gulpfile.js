const gulp = require('gulp')
const postcss = require('gulp-postcss')
const sass = require('gulp-sass')
const concat = require('gulp-concat')
const cleanCSS = require('gulp-clean-css')
const electron = require('electron')
const proc = require('child_process')
const path = require('path')

const cssEntry = './app/renderer/css/*.css'
const sassEntry = './app/renderer/scss/**/*.scss'
const sassIndex = './app/renderer/scss/index.scss'
const cssExportDirectory = './app/renderer/css/'
const cssExportName = 'style.css'

gulp.task('css', function() {
  return gulp.src(sassIndex)
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

gulp.task('dev', function(done) {
  gulp.watch(sassEntry, { ignoreInitial: false }, gulp.series(['css']))
  proc.spawn(electron, ['.'], { stdio: ['inherit', 'inherit', 'inherit'] })
})

gulp.task('build', gulp.series(['css', 'clean-css']))
