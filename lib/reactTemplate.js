const path = require('path')

// get file basename without extension
const BaseName = file => path.basename(file.path, path.extname(file.path))

module.exports = {
  header: file => `
class ${BaseName(file)} extends React.Component {
  render() {
    return pug\``,
  footer: file => `\`
  }
}

export default ${BaseName(file)}
`
}
