# Converter of pug pages into React components

This setup is an infrastructural arrangement to facilitate authoring of main content pages for the [mother React site application](https://github.com/heroqu/react-i18n-site).

The idea is that initially each page is to be edited as a `pug` (`jade`) file. Then, when authoring is over, the `gulp` task is to be run to convert all prepared pug files into React JSX files and copy them into the mother React site's directory.

## Usage

Just run gulp default task:

``` Bash
# if gulp installed globally then:
gulp

# or, if not then:
npm run gulp

# or
yarn gulp

# or, for npm >= 5.2:
npx gulp
```

## Configuration

`config.js` allows to change both source pattern and destination directory.

`.babelrc` with empty object is here to suppress possible babel configs in upstream directories.

## Idea

The purpose is to separate content editing from more technical aspects of react site management. One can edit static pages in pug with the comfort of good old html.

#### Why not markdown?

Markdown has its limitations. Pug, while being an equivalent of full fledged html, is still very succinct and close to plain text in many respects.

#### Why not convert pug to react on the fly at run time?

Because before-hand conversion ... :

- Saves on processor resources (who cares?! think of those trees uncut)
- Simplifies and unburden the main React site. It now starts with ready made React components from square one
- Lets one see and examine the resulted static React components directly, eliminating the chances of unexpected markup errors

#### Why put this functionality outside the react site directory?

Again, to simplify the main site as such. We thus avoid cluttering the site's dependency list and directory structure with stuff not related to main React application.

Think of this solution as of an architectural separation of concerns to increase the overall modularization. Imagine one day we decide that full fledged html (=pug) is overkill and we switch to markdown or reStructuredText or AsciiDoc or some other markup language. Then the main site stays untouched, and all we have to do is to just replace the conversion algorithm in this outer part.

## But what does it do exactly?

The `gulp` task takes all the `.pug` files from source directory and process each of them in the following way:

- Wrap it into a specially formatted javascript file. To be precise it turn the `pug` file with contents:

``` pug
.Content
  h1 About
  p
    | This is my component using pug.
  Link(to="/home") go home
```

into the `.js` file:

``` javascript
import React from 'react'

class About extends React.Component {
  render() {
    return pug`.Content
  h1 About
  p
    | This is my component using pug.
  Link(to="/home") go home
`
  }
}
```

Basically it just puts the chunk of pug untouched into the middle of `.js` template. This file is now ready to be processed by [babel-plugin-transform-react-pug](https://www.npmjs.com/package/babel-plugin-transform-react-pug) which is an official pug to react converter.

- Apply [gulp-babel-compile](https://www.npmjs.com/package/gulp-babel-compile) gulp plugin which in turn uses just mentioned `babel-plugin-transform-react-pug` babel plugin.

After this step the file should look like this:

``` javascript
import React from 'react';

class About extends React.Component {
  render() {
    return <div className="Content"><h1>About</h1><p>This is my component using pug.</p><Link to="/home">go home</Link></div>;
  }
}
```

We're almost done, but it looks ugly.

- Prettify the file with `Esformatter` and then `Prettier`.

Have to admit I wasn't able to attain the perfect formatting using each one of them just alone.

Now we have a perfectly formatted file with React component:

``` javascript
import React from 'react'

class About extends React.Component {
  render() {
    return (
      <div className="Content">
        <h1>About</h1>
        <p>This is my component using pug.</p>
        <Link to="/home">go home</Link>
      </div>
    )
  }
}
```

- Finally change file extension to `.js` and write it to the destination directory.

And that's it.

That was easy, wasn't it? No? Well, then it's because you haven't seen the...
