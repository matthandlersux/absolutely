import { take, dropWhile } from 'lodash';

import { RootSpec, PathSpec } from '../types';

const importRegex = /^import .* from ('(.*)'|"(.*)");?$/i;
const requireRegex = /\brequire\(('(.*)'|"(.*)")\);?/i;

export const convertLine = (currentPath: string, currentLine: string, rootSpec?: RootSpec): string => {
  return (
    matchLineAndReplace(currentLine, importRegex, 1, currentPath, rootSpec) ||
    matchLineAndReplace(currentLine, requireRegex, 1, currentPath, rootSpec) ||
    currentLine
  );
};

const matchLineAndReplace = (
  line: string,
  regex: RegExp,
  groupOffsetIndex: number,
  currentPath: string,
  rootSpec?: RootSpec,
) => {
  const requireResult = line.match(regex);

  if (requireResult != null) {
    const quoted = requireResult[groupOffsetIndex];
    const unquoted = requireResult[groupOffsetIndex + 1] || requireResult[groupOffsetIndex + 2];

    if ((quoted && unquoted && unquoted.startsWith('./')) || unquoted.startsWith('../')) {
      const quoteChar = quoted[0];
      return line.replace(quoted, `${quoteChar}${convertPath(unquoted, currentPath, rootSpec)}${quoteChar}`);
    } else return null;
  } else return null;
};

export const convertPath = (relativePath: string, currentPath: string, rootSpec?: RootSpec): string => {
  const currentPathPieces: Array<string> = currentPath.split('/');
  const relativePieces: Array<string> = relativePath.split('/');
  const pathSpec: PathSpec = pathSpecFor(relativePath);

  let absolutePieces: Array<string> = currentPathPieces;
  if (rootSpec) {
    const [pathPart, name] = rootSpec;
    const piecesToRemove = pathPart.split('/');
    absolutePieces = [name, ...dropWhile(currentPathPieces, (piece, index) => piece === piecesToRemove[index])];
  }

  return [
    ...take(absolutePieces, absolutePieces.length - pathSpec.upDirectoryCount),
    ...pathSpec.topDownRelativePathPieces,
  ].join('/');
};

const pathSpecFor = (relativePath: string): PathSpec => {
  return relativePath.split('/').reduce<PathSpec>(
    (acc, part) => {
      switch (part) {
        case '..':
          return {
            ...acc,
            upDirectoryCount: acc.upDirectoryCount + 1,
          };
        case '.':
          return acc;
        default:
          return {
            ...acc,
            topDownRelativePathPieces: [...acc.topDownRelativePathPieces, part],
          };
      }
    },
    {
      upDirectoryCount: 0,
      topDownRelativePathPieces: [],
    },
  );
};
