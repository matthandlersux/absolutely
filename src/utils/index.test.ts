import { convertPath, convertLine, requireRegex, isLineAQuotedMatchForRegex } from '@app/utils/index';
import { RootSpec } from '@app/types';

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
  ])('converts a %s', (_spec, toTransform, outputPath) => {
    expect(convertPath({ currentPath, toTransform })).toBe(outputPath);
  });

  describe('with a root name for the root directory', () => {
    const rootSpec: RootSpec = ['/Users/test/Documents/code/javascript/project/src', 'app'];

    it.each([
      ['file relatively from the same folder', './index', 'app/subfolder/index'],
      ['file up a directory', '../someFile', 'app/someFile'],
      ['cousin file', '../cousinFolder/someFile', 'app/cousinFolder/someFile'],
      ['path with unnecessary current file indicators', './../someFile', 'app/someFile'],
      ['path with multiple unnecessary current file indicators', '././../someFile', 'app/someFile'],
      ['path with unnecessary parent directory indicators', '../subfolder/test', 'app/subfolder/test'],
    ])('%s', (_spec, toTransform, outputPath) => {
      expect(convertPath({ toTransform, currentPath, rootSpec })).toBe(outputPath);
    });
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
      ['does not edit non relative imports', "import * as MyThing from 'fs';", "import * as MyThing from 'fs';"],
    ])('%s', (_spec, toTransform, expected) => {
      expect(convertLine({ currentPath, toTransform })).toEqual(expected);
    });
  });

  describe('converts a line for require statements', () => {
    it.each([
      [
        'default case',
        "const library = require('../myThing');",
        "const library = require('/Users/test/Documents/code/javascript/project/src/myThing');",
      ],
      ['does not edit non relative requires', "const library = require('fs');", "const library = require('fs');"],
      [
        'does not edit a require statement in a double quoted string',
        '  "const library = require(\'../myThing\');"',
        '  "const library = require(\'../myThing\');"',
      ],
      [
        'does not edit a require statement in a single quoted string',
        '  \'const library = require("../myThing");\'',
        '  \'const library = require("../myThing");\'',
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
    ])('%s', (_spec, toTransform, expected) => {
      expect(convertLine({ currentPath, toTransform })).toEqual(expected);
    });
  });

  it.each([['that is just code baby', 'const value = someFunction(call);']])(
    'does not edit a line %s',
    (_description, toTransform) => {
      expect(convertLine({ currentPath, toTransform })).toEqual(toTransform);
    },
  );

  describe('isLineAQuotedMatchForRegex', () => {
    describe('with a require regex', () => {
      it.each([
        '  \'const library = require("../myThing");\'',
        '  "const library = require(\'../myThing\');"',
        '  "const \\"library\\" = require(\'../myThing\');"',
      ])('returns true for: {%s}', (string) => {
        expect(isLineAQuotedMatchForRegex(string, requireRegex)).toBe(true);
      });
    });
  });
});
