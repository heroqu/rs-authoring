const path = require('path')
const gulp = require('gulp')
const wrapper = require('gulp-wrapper')
const replaceExt = require('gulp-ext-replace')
const babel = require('gulp-babel-compile')
const esformatter = require('gulp-esformatter')
const prettier = require('gulp-prettier-plugin')

const CONFIG = require('./config')

const pugWrapToReactTemplate = {
  header: file => {
    const name = path.basename(file.path, path.extname(file.path))
    return `import React from 'react'

class ${name} extends React.Component {
  render() {
    return pug\``
  },
  footer: `\`
  }
}
`
}

gulp.task('default', () =>
  gulp
    .src(CONFIG.src)
    .pipe(wrapper(pugWrapToReactTemplate))
    .pipe(
      babel({
        presets: ['stage-2'],
        plugins: ['transform-react-pug']
      })
    )
    .pipe(esformatter(CONFIG.esformatter))
    .pipe(prettier(CONFIG.prettier))
    .pipe(replaceExt('.js'))
    .pipe(gulp.dest(CONFIG.dest))
)
