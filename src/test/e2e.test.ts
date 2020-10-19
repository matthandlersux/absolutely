import { exec, ExecException } from 'child_process';
import path from 'path';
import process from 'process';

import { rewriteAllFiles } from '@app/utils';

const fixturesPath = './src/test/fixtures';
const preAdjustedFileFolder = `${fixturesPath}/copy-these-to-empty-folder`;
const emptyStartingFolder = `${fixturesPath}/empty-testing-folder`;
const expectedFolder = `${fixturesPath}/expected-resulting-file-tree`;

const diffCommand = `diff -rq -x '.DS_Store' -x '.keep' ${emptyStartingFolder} ${expectedFolder}`;
const copyFolderCommand = `cp -R ${preAdjustedFileFolder}/* ${emptyStartingFolder}/`;

const rootSpecFolder = path.join(process.cwd(), emptyStartingFolder);

type ExecError = {
  error: ExecException;
  stderr: string;
  stdout: string;
};

const promiseExec = (command: string): Promise<string | ExecError> => {
  return new Promise((resolve) => {
    exec(command, (error, stdout, stderr) => {
      if (error) resolve({ error, stderr, stdout });
      else resolve(stdout);
    });
  });
};

describe('running the script against a real folder', () => {
  beforeEach(async () => {
    const result = await promiseExec(copyFolderCommand);
    if (typeof result != 'string') throw new Error(`${result.error.toString()}: ${result.stderr}`);
  });

  it('updates all the files to have absolute imports', async () => {
    await rewriteAllFiles({
      glob: `${emptyStartingFolder}/**/*.js`,
      rootSpec: [rootSpecFolder, 'app'],
    });

    const result = await promiseExec(diffCommand);

    if (typeof result === 'string') {
      expect(result).toBe('');
    } else fail(result);
  });
});
