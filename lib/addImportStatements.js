// regex to find React component tag names in jsx
const RE = /<([A-Z][a-zA-Z0-9_]*?)\b/gm

/**
 * find all unique React component tags inside jsx code and
 * adds appropriate import statements
 */
function addImportStatements(txt) {
  let importFromReact = `import React from 'react'`
  let imports = Array.from(
    txt
      .match(RE)
      // [ '<Fragment', '<Link', ... ]
      .map(x => x.substr(1))
      // [ 'Fragment', 'Link', ... ]
      .reduce((acc, v) => {
        // dedupe with Set, keep order of appearence
        acc.add(v)
        return acc
      }, new Set())
  ) // to Array
    .map(tag => {
      if (tag === 'Fragment') {
        importFromReact = `import React, { Fragment } from 'react'`
        return null
      }
      return `import ${tag} from '../../${tag}'`
    })
    .filter(Boolean) // get rid of nulls

  imports.unshift(importFromReact)

  // add all import statements at the top of the file
  return `${imports.join('\n')}\n${txt}`
}

module.exports = addImportStatements
