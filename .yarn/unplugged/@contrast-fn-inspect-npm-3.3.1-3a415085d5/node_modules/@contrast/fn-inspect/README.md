# @contrast/fn-inspect

[![Test](https://github.com/Contrast-Security-Inc/node-fn-inspect/actions/workflows/test.yml/badge.svg)](https://github.com/Contrast-Security-Inc/node-fn-inspect/actions/workflows/test.yml)

This module exposes some useful information from the underlying v8 engine,
including:

- file and line number given a function reference
- code events (i.e. `'LAZY_COMPILE'`)

## Usage

Getting details about a function:

```js
const { funcInfo } = require('@contrast/fn-inspect');

function testFn() {}

const results = funcInfo(testFn);
// => { lineNumber: 2, column: 15, file: 'example.js', method: 'testFn', type: 'Function' }
```

Registering a listener for code events:

```js
const { setCodeEventListener } = require('@contrast/fn-inspect');

setCodeEventListener((event) => {
  console.log(event);
});
```

## Building locally

`npm run build` will build the project for your current OS and architecture.

`npm run download` will pull the most recent build artifacts from GitHub.

## Publishing

Simply run `npm version` and `git push && git push --tags`. CI will take care of
releasing on taggedcommits.
