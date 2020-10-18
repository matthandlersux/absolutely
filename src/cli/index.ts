#!/usr/bin/env node

import yargs from 'yargs';
import process from 'process';
import path from 'path';

import { Options, RootSpec } from '../types';

export const getOptions = (): Options => {
  const args = yargs.options({
    glob: { type: 'string', demandOption: true, alias: 'g' },
    rootName: { type: 'string', demandOption: false, alias: 'n' },
    rootAbsolutePath: { type: 'string', demandOption: false, alias: 'r' },
    rootRelativePath: { type: 'string', demandOption: false, alias: 'l' },
  }).argv;

  let rootSpec: RootSpec | undefined;
  if (args.rootName) {
    if (args.rootAbsolutePath) rootSpec = [args.rootAbsolutePath, args.rootName];
    else if (args.rootRelativePath) rootSpec = [path.join(process.cwd(), args.rootRelativePath), args.rootName];
    else rootSpec = [process.cwd(), args.rootName];
  }

  return {
    glob: args.glob,
    rootSpec,
  };
};
