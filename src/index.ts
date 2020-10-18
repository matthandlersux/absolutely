import { FileWalker } from './file-walking';
import * as utils from './utils';
import { Options } from './types';

// const main = async () => {
//   const glob = '';
//   const fileWalker = new FileWalker();

//   await fileWalker.walkFilesWithGlob(glob, async (path) => {
//     fileWalker.readWriteLinesOfFile(path, utils.convertLine);
//   });

//   console.log('done');
// };

export const rewriteAllFiles = async (options: Options) => {
  const fileWalker = new FileWalker();
  await fileWalker.updateFilesWithOptions(options, utils.convertLine);
};
