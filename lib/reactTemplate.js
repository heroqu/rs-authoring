const path = require('path')

// based on file basename without extension
const ComponentName = file =>
  `Page__${path.basename(file.path, path.extname(file.path))}`

module.exports = {
  header: file => `
class ${ComponentName(file)} extends React.Component {
  render() {
    return pug\``,
  footer: file => `\`
  }
}

export default ${ComponentName(file)}
`
}
