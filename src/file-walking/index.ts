import fs from 'fs';
import * as pathUtil from 'path';
import Glob from 'glob';
import util from 'util';

import { RootSpec, Options } from '../types';

type Transformer = (path: string, line: string, rootSpec?: RootSpec) => string;

const promiseGlobber = (glob: string): Promise<Array<string>> => {
  return util.promisify(Glob.glob)(glob);
};

const promiseReader = async (path: string): Promise<string> => {
  const buffer = await util.promisify(fs.readFile)(path);
  return buffer.toString();
};
const promiseWriter = util.promisify(fs.writeFile);

export class FileWalker {
  constructor(
    private globber: (glob: string) => Promise<Array<string>> = promiseGlobber,
    private reader: (file: string) => Promise<string> = promiseReader,
    private writer: (file: string, contents: string) => Promise<void> = promiseWriter,
  ) {}

  updateFilesWithOptions = (options: Options, transformer: Transformer) => {
    return this.walkFilesWithGlob(options.glob, (path) => {
      return this.readWriteLinesOfFile(path, transformer, options);
    });
  };

  walkFilesWithGlob = async (glob: string, alterFile: (file: string) => Promise<void>) => {
    const files = await this.globber(glob);
    return Promise.all(files.map((file) => alterFile(file)));
  };

  readWriteLinesOfFile = async (path: string, transformer: Transformer, options: Options): Promise<void> => {
    const fileContents = await this.reader(path);
    const lines = fileContents.replace(/\r\n/g, '\n').split('\n');
    const adjustedLines = lines.map((line) => {
      return transformer(pathUtil.dirname(path), line, options.absolute);
    });
    const adjustedFile = adjustedLines.join('\n');
    return this.writer(path, adjustedFile);
  };
}
