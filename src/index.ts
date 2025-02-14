#!/usr/bin/env node

import process from 'process';
import ora from 'ora';

import * as utils from '@app/utils';
import * as cli from '@app/cli';

const main = async () => {
  const cliOptions = cli.getOptions();

  const spinner = ora({
    text: '...loading',
  }).start();

  await utils.rewriteAllFiles(cliOptions, (options) => {
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
