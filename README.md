# Absolutely [![Actions Status](https://github.com/matthandlersux/absolutely/workflows/CI/badge.svg)](https://github.com/matthandlersux/absolutely/actions)

How is one supposed to compute where `../../../../../some/file` is!? Nobody likes doing folder math in their head!

![insertgif.com](https://media0.giphy.com/media/ZThQqlxY5BXMc/200.gif)

...but when you have a large project already using relative imports, it's annoying to convert it. This
tool should help you convince the rest of your team that it can be effortless. Note that there are some
[helpful hints](#helpful-hints) at the bottom of this readme, since you will likely have to update your tooling.

## Usage

```bash
absolutely -g './src/**/*.ts?(x)' -n '@app' -r './src'
```

This will rename an import in a file `./src/components/clock/index.ts` like so:
```diff
- import { thing } from '../avatar';
+ import { thing } from '@app/components/avatar';
```

### Options

For extra info about glob syntax [see here](https://github.com/isaacs/node-glob#glob-primer)

| Flag | Name               | Description                                                       | Type     | Info                        |
| ---- | --------           | -----------                                                       | ----     | ----                        |
| -g   | --glob             | the glob used to enumerate files that should be edited            | [string] | [required]                  |
| -n   | --root&#x2011;name | name the root of the project, ex: "@app" in "@app/components/..." | [string] | [required]                  |
| -r   | --root&#x2011;path | a path you want to be considered the root of the project          | [string] | [default: the current path] |

## Helpful Hints

After you convert all of your import statements in all of your files, you'll have to update all of your tooling
to be aware of the absolute file references as well. Below is a running list of common tools and how to get them
to respect absolute imports.

### Jest

```js
// jest.config.js

module.exports = {
  ...
  moduleNameMapper: {
    '^@app/(.*)$': '<rootDir>/src/$1',
  },
};
```

### Eslint

#### eslint-plugin-import

If you use [eslint-plugin-import](https://github.com/benmosher/eslint-plugin-import), you'll want to tell
it how to recognize your internal files:

```js
// eslintrc.json

{
  ...
  "settings": {
    "import/internal-regex": "^(@app)/"
  }
}
```

### Typescript

```js
// tsconfig.json

{
  "compilerOptions": {
    ...
    "baseUrl": "./",
    "paths": {
      "@app/*": ["./src/*"]
    }
  }
}
```

### Webpack

```js
// webpack.js

const path = require('path');

module.exports = {
  ...
  resolve: {
    alias: {
      '@app': path.resolve(__dirname, 'src'),
    },
  },
};
```

### Create-react-app

If you're using Typescript, see [Typescript](#typescript). If you're using js, see
[here](https://create-react-app.dev/docs/importing-a-component/#absolute-imports)
