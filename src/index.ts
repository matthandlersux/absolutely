import yargs from 'yargs';
import process from 'process';
import ora from 'ora';

import { FileWalker } from './file-walking';
import * as utils from './utils';
import * as cli from './cli';
import { Options, RootSpec } from './types';

const main = async () => {
  const spinner = ora({
    text: '...loading',
  }).start();

  await utils.rewriteAllFiles(cli.getOptions(), (options) => {
    spinner.text = options.currentPath;
    return utils.convertLine(options);
  });
};

main()
  .then(() => {
    process.exit(0);
    console.log('done');
  })
  .catch((e) => {
    console.error('failed to alter files');
    console.error(e);
    process.exit(1);
  });
