import yargs from 'yargs';
import process from 'process';
import path from 'path';

import { Options, RootSpec } from '@app/types';

export const getOptions = (): Options => {
  const args = yargs
    .options({
      glob: {
        type: 'string',
        demandOption: true,
        alias: 'g',
        description: 'the glob used to enumerate files that should be edited',
      },
      'root-name': {
        type: 'string',
        demandOption: true,
        alias: 'n',
        description: 'name the root of the project, ex: "@app" in "@app/components/..."',
      },
      'root-path': {
        type: 'string',
        demandOption: false,
        alias: 'r',
        description: 'a path you want to be considered the root of the project',
        defaultDescription: 'the current path',
      },
      'fail-on-out-of-bounds': {
        type: 'boolean',
        demandOption: false,
        default: false,
        alias: 'b',
        description: 'whether we should ignore file references above the specified root',
        defaultDescription: "don't fail",
      },
    })
    .usage('Usage: $0 -g [glob] -n [root-name] -r [root-relative-path]')
    .example('$0 -g "./src/**/*.tsx?" -n "@app" -r "./src"', 'convert all relative imports to absolute').argv;

  let rootSpec: RootSpec | undefined;
  if (args['root-name']) {
    if (args['root-path']) {
      const providedPath = args['root-path'];
      const absolutePath = providedPath.startsWith('/') ? providedPath : path.join(process.cwd(), args['root-path']);
      rootSpec = [absolutePath, args['root-name']];
    } else rootSpec = [process.cwd(), args['root-name']];
  }

  return {
    glob: args.glob,
    rootSpec,
    ignoreOutOfBounds: !args['fail-on-out-of-bounds'],
  };
};
