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

need an option for what to do with things that go out of the root
probably error | ignore with warning

For extra info about glob syntax [see here](https://github.com/isaacs/node-glob#glob-primer)

| Flag | Name                    | Description                                                       | Type      | Info                        |
| ---- | --------                | -----------                                                       | ----      | ----                        |
| -g   | --glob                  | the glob used to enumerate files that should be edited            | [string]  | [required]                  |
| -n   | --root&#x2011;name      | name the root of the project, ex: "@app" in "@app/components/..." | [string]  | [required]                  |
| -r   | --root&#x2011;path      | a path you want to be considered the root of the project          | [string]  | [default: the current path] |
| -b   | --fail-on-out-of-bounds | whether we should ignore file references above the specified root | [boolean] | [default: don't fail]       |

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

#### For type checking and local development

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

###### Note that the path in "paths" gets appended to `baseUrl`'s path

#### For building a node runnable package

Ok this is complicated, and I think it can be summed up by looking at the length of
[this](https://github.com/microsoft/TypeScript/issues/15479) thread. Despite being able to interpret your
absolute paths as a type checker and compiler, when you actually build your project (export to js files), TypeScript
does not want to convert your absolute paths back to relative ones. That means that you can't simply do `yarn tsc` and
then `node ./dist/index.js`. Here are two workarounds.

##### tsconfig-paths and ts-node

If you want to run your app using [ts-node](https://github.com/TypeStrong/ts-node), then you have to also use this plugin
to tell it how to interpret the `tsconfig.json` "paths" defined locations: [tsconfig-paths](https://github.com/dividab/tsconfig-paths).

You can then run your application with something like:

```bash
ts-node -r tsconfig-paths/register src/index.ts
```

Check the "scripts.dev" section of [package.json](package.json) for an example.

##### tsc-alias

If you want to compile your app to js, and then run it with **node**, however, you'll have to use
[tsc-alias](https://github.com/justkey007/tsc-alias) to convert your absolute references back to relative ones in the
compiled output.

###### Notes

* `tsc-alias` uses `rootDir` from `tsconfig.json` to rewrite your paths.
* `tsc-alias` had a bug on non-Windows machines at the time of writing this, you can check "scripts.postinstall" in
  [package.json](package.json) for an example of how to deal with that.

Check the "scripts.build" section of [package.json](package.json) for an example.

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

If you're using Typescript, see [Typescript](#typescript) to familiarize yourself with that aspect.
If you're using js, see [here](https://create-react-app.dev/docs/importing-a-component/#absolute-imports).

Note that there are some caveats with getting absolute paths to work with CRA. First, CRA
supports absolute imports (as indicated in the link above), but **not** with a "paths" directive.
You can follow the conversation
[here](https://github.com/facebook/create-react-app/issues/8909#issuecomment-686526409).

You'll see in that issue that there is in fact a workaround for this by using the "extends" directive in
`tsconfig.json`, and using [react-app-rewired](https://www.npmjs.com/package/react-app-rewired) to inject an adjustment
to the webpack config.
[Here](https://medium.com/@gustavograeff1998/absolute-imports-with-create-react-app-typescript-e87878cab65b) is a
blogpost that explains it more thoroughly.
