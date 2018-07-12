/**
 * This module contains functions able to write a set of index.js files
 * into build directory structure. The idea is that one should be able to
 * import all the page files inside all the locale subdir in one single
 * import statement:
 *
 *    import pages from 'path_to_build_dir'
 *
 * To make it possible we have to have index.js file in the root that should
 * have a code similar to this (depending on the actual list of used locales):
 *
 * import en from './en'
 * import ru from './ru'
 *
 * export default {
 *   en,
 *   ru
 * }
 *
 * On top of that each locale subdir should also have an index.js file
 * that re-export all the files from that particular direcoty, e.g.
 * if there are only 3 files inside locale dir:
 *
 * .
 * ├── About.js
 * ├── Contact.js
 * └── Skills.js
 *
 * then the index.js file in that directory should be:
 *
 * import About from './About'
 * import Contact from './Contact'
 * import Skills from './Skills'
 *
 * export default {
 *   about: About,
 *   contact: Contact,
 *   skills: Skills
 * }
 */

const fs = require('fs')
const path = require('path')

/**
 * Main function that do it all:
 *
 * Insert all the index.js files into the build directory:
 * One in the root of it and one in each locale subdirectory.
 *
 * @param  {String} dir - path to the build dir
 */
function indexBuildDir(dir) {
  const localeDirs = fs
    .readdirSync(dir)
    .filter(d => isDirectory(path.resolve(dir, d)))

  // 1. Insert Root index file
  insertIndex__Root(dir, localeDirs)

  // 2. Insert index file into each locale subdir
  localeDirs.map(d => path.resolve(dir, d)).forEach(localeDir => {
    insertIndex__Locale(localeDir)
  })
}

module.exports = indexBuildDir

/**
 * Helper functions and stuff
 */

const INDEX_FILE = 'index.js'
const REGEX_JS_EXT = /\.js$/i

// Factory to make comma inserters based on array length
const COMMA_OR_NOT = lastIdx => idx => (idx === lastIdx ? '' : ',')

function isDirectory(path) {
  return fs.lstatSync(path).isDirectory()
}

function writeIndexFile(dir, code) {
  fs.writeFileSync(path.resolve(dir, INDEX_FILE), code, 'utf8')
}

function insertIndex__Root(dir, subdirs) {
  const code = makeCode__RootIndex(subdirs)
  writeIndexFile(dir, code)
}

function insertIndex__Locale(dir) {
  const pageNames = fs
    .readdirSync(dir)
    // index files are excluded
    .filter(x => x !== INDEX_FILE)
    // only js files
    .filter(x => REGEX_JS_EXT.test(x))
    // only the base names
    .map(x => x.replace(REGEX_JS_EXT, ''))
    .sort()

  const code = makeCode__LocaleIndex(pageNames)
  writeIndexFile(dir, code)
}

/**
 * make ES6 code for index.js file that re-exports
 * each locale subdir
 *
 * @param  {[String]} subdirs
 *          - names of locale sub directories
 *            ['en', 'ru', ...]
 * @return {String}  - source code to be used in index.js file
 */
function makeCode__RootIndex(subdirs) {
  // add comma each time except for the last item
  const commaOrNot = COMMA_OR_NOT(subdirs.length - 1)

  return `${subdirs.reduce((acc, p) => {
    acc += `import ${p} from './${p}'\n`
    return acc
  }, '')}
export default {
${subdirs.reduce((acc, p, i) => {
    acc += `  ${p}${commaOrNot(i)}\n`
    return acc
  }, '')}}
`
}

/**
 * make ES6 code for index.js file that re-exports
 * every page file in the directory
 *
 * @param  {[String]} pageNames
 *          - names of the page files without extensions:
 *            ['About', 'Intro', ...]
 * @return {String}  - source code to be used in index.js file
 */
function makeCode__LocaleIndex(pageNames) {
  // If pages are named poorly we should know that immediately
  assertPageNamesHasValidFormat(pageNames)

  // add comma each time except for the last item
  const commaOrNot = COMMA_OR_NOT(pageNames.length - 1)

  return `${pageNames.reduce((acc, p) => {
    acc += `import ${p} from './${p}'\n`
    return acc
  }, '')}
export default {
${pageNames.reduce((acc, p, i) => {
    acc += `  ${p.toLowerCase()}: ${p}${commaOrNot(i)}\n`
    return acc
  }, '')}}
`
}

/**
 * Assertions
 */

function assertPageNamesHasValidFormat(pageNames) {
  for (let name of pageNames) {
    assert(name, isNotEmpty, 'Page name is empty')
    assert(name, consistsOfAllowedSymbols, 'Page name contains illegal symbols')
    assert(
      name,
      startsWithLatinCapital,
      'Page name should start with a latin capital letter'
    )
  }
}

function assert(value, predicate, message) {
  if (!predicate(value)) {
    throw new Error(message)
  }
}

function isNotEmpty(name) {
  return name && `$name`.trim() !== ''
}

function consistsOfAllowedSymbols(name) {
  return /^[A-Za-z0-9_]*$/.test(name)
}

function startsWithLatinCapital(name) {
  return /^[A-Z].*$/.test(name)
}
