import { convertPath, convertLine } from './index';

const currentPath = '/Users/test/Documents/code/javascript/project/src/subfolder';

describe('convertPath', () => {
  it.each([
    [
      'file relatively from the same folder',
      './index',
      '/Users/test/Documents/code/javascript/project/src/subfolder/index',
    ],
    ['file up a directory', '../someFile', '/Users/test/Documents/code/javascript/project/src/someFile'],
    [
      'cousin file',
      '../cousinFolder/someFile',
      '/Users/test/Documents/code/javascript/project/src/cousinFolder/someFile',
    ],
    [
      'path with unnecessary current file indicators',
      './../someFile',
      '/Users/test/Documents/code/javascript/project/src/someFile',
    ],
    [
      'path with multiple unnecessary current file indicators',
      '././../someFile',
      '/Users/test/Documents/code/javascript/project/src/someFile',
    ],
    [
      'path with unnecessary parent directory indicators',
      '../subfolder/test',
      '/Users/test/Documents/code/javascript/project/src/subfolder/test',
    ],
  ])('converts a %s', (_spec, inputPath, outputPath) => {
    expect(convertPath(inputPath, currentPath)).toBe(outputPath);
  });
});

describe('convertLine', () => {
  describe('for import statements', () => {
    it.each([
      [
        'default case',
        "import * as MyThing from '../myThing';",
        "import * as MyThing from '/Users/test/Documents/code/javascript/project/src/myThing';",
      ],
      [
        'without a semicolon',
        "import * as MyThing from '../myThing'",
        "import * as MyThing from '/Users/test/Documents/code/javascript/project/src/myThing'",
      ],
      [
        'using double quotes',
        'import * as MyThing from "../myThing";',
        'import * as MyThing from "/Users/test/Documents/code/javascript/project/src/myThing";',
      ],
    ])('%s', (_spec, line, expected) => {
      expect(convertLine(currentPath, line)).toEqual(expected);
    });
  });

  describe('converts a line for require statements', () => {
    it.each([
      [
        'default case',
        "const library = require('../myThing');",
        "const library = require('/Users/test/Documents/code/javascript/project/src/myThing');",
      ],
      [
        'appearing in some code (indented)',
        "  const library = require('../myThing');",
        "  const library = require('/Users/test/Documents/code/javascript/project/src/myThing');",
      ],
      [
        'without assignment',
        "require('../myThing');",
        "require('/Users/test/Documents/code/javascript/project/src/myThing');",
      ],
      [
        'with a let assignment',
        "let library = require('../myThing');",
        "let library = require('/Users/test/Documents/code/javascript/project/src/myThing');",
      ],
      [
        'with a var assignment',
        "var library = require('../myThing');",
        "var library = require('/Users/test/Documents/code/javascript/project/src/myThing');",
      ],
      [
        'without a semicolon',
        "const library = require('../myThing')",
        "const library = require('/Users/test/Documents/code/javascript/project/src/myThing')",
      ],
      [
        'using double quotes',
        'const library = require("../myThing");',
        'const library = require("/Users/test/Documents/code/javascript/project/src/myThing");',
      ],
    ])('%s', (_spec, line, expected) => {
      expect(convertLine(currentPath, line)).toEqual(expected);
    });
  });

  it.each([['that is just code baby', 'const value = someFunction(call);']])(
    'does not edit a line %s',
    (_description, line) => {
      expect(convertLine(currentPath, line)).toEqual(line);
    },
  );
});
