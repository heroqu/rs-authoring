const gulp = require('gulp')
const runSequence = require('run-sequence')
const wrapper = require('gulp-wrapper')
const replaceExt = require('gulp-ext-replace')
const babel = require('gulp-babel-compile')
const esformatter = require('gulp-esformatter')
const prettier = require('gulp-prettier-plugin')
const path = require('path')

const CONFIG = require('./config')

const reactTemplate = require('./lib/reactTemplate')

const indexBuildDir = require('./lib/indexBuildDir')

// adding import statements in jsx files
const textTransformation = require('gulp-text-simple')
const addImportStatements = require('./lib/addImportStatements')
const importAdder = textTransformation(addImportStatements)

gulp.task('indexBuildDir', cb => {
  indexBuildDir(CONFIG.buildDir)
  cb()
})

gulp.task('pug2react', () =>
  gulp
    .src(`${path.resolve(CONFIG.src)}/**/*.pug`)
    .pipe(wrapper(reactTemplate))
    .pipe(
      babel({
        presets: ['stage-2'],
        plugins: ['transform-react-pug']
      })
    )
    .pipe(importAdder())
    .pipe(esformatter(CONFIG.esformatter))
    .pipe(prettier(CONFIG.prettier))
    .pipe(replaceExt('.js'))
    .pipe(gulp.dest(CONFIG.buildDir))
)

gulp.task('export', () => {
  gulp
    .src(`${path.resolve(CONFIG.buildDir)}/**/*.js`)
    .pipe(gulp.dest(CONFIG.exportDir))
})

gulp.task('author', cb => {
  runSequence('pug2react', 'indexBuildDir', 'export', cb)
})

gulp.task('watch', function() {
  gulp.watch('src/**/*.pug', ['author'])
})

gulp.task('default', ['author'])
