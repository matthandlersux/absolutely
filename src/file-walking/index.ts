import fs from 'fs';
import Glob from 'glob';
import util from 'util';

const promiseGlobber = (glob: string): Promise<Array<string>> => {
  return util.promisify(Glob.glob)(glob);
};

const promiseReader = async (path: string): Promise<string> => {
  const buffer = await util.promisify(fs.readFile);
  return buffer.toString();
};
const promiseWriter = util.promisify(fs.writeFile);

export class FileWalker {
  constructor(
    private globber: (glob: string) => Promise<Array<string>> = promiseGlobber,
    private reader: (file: string) => Promise<string> = promiseReader,
    private writer: (file: string, contents: string) => Promise<void> = promiseWriter,
  ) {}

  walkFilesWithGlob = async (glob: string, alterFile: (file: string) => Promise<void>) => {
    const files = await this.globber(glob);
    return Promise.all(files.map((file) => alterFile(file)));
  };

  readWriteLinesOfFile = async (path: string, transformer: (path: string, line: string) => string): Promise<void> => {
    const fileContents = await this.reader(path);
    const lines = fileContents.replace(/\r\n/g, '\n').split('\n');
    const adjustedLines = lines.map(line => transformer(path, line));
    const adjustedFile = adjustedLines.join('\n');
    return this.writer(path, adjustedFile);
  };
}
