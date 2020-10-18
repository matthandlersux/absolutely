# Absolutely [![Actions Status](https://github.com/matthandlersux/absolutely/workflows/CI/badge.svg)](https://github.com/matthandlersux/absolutely/actions)

A tool for converting a javascript/typescript/etc project from relative to absolute imports

Nobody likes doing folder math in their head! ...but when you have a large project that is already using relative
imports, it's a pretty hard lift to convert. This tool should help you convince the powers that be on your project
that it can be effortless. Note that there are some [helpful hints](#helpful-hints) at the bottom of this readme,
since you will likely have to update your tooling.

## Options

```ts
glob: { type: 'string', demandOption: true, alias: 'g' },
rootName: { type: 'string', demandOption: false, alias: 'n' },
rootAbsolutePath: { type: 'string', demandOption: false, alias: 'r' },
rootRelativePath: { type: 'string', demandOption: false, alias: 'l' },
```

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
