import { take, drop } from 'lodash';

type PathSpec = {
  upDirectoryCount: number;
  topDownRelativePathPieces: Array<string>;
};

const importRegex = /^import .* from ('(.*)'|"(.*)");?$/i;
const requireRegex = /\brequire\(('(.*)'|"(.*)")\);?/i;

export const convertLine = (currentPath: string, currentLine: string): string => {
  return (
    matchLineAndReplace(currentLine, importRegex, 1, currentPath) ||
    matchLineAndReplace(currentLine, requireRegex, 1, currentPath) ||
    currentLine
  );
};

const matchLineAndReplace = (line: string, regex: RegExp, groupOffsetIndex: number, currentPath: string) => {
  const requireResult = line.match(regex);

  if (requireResult != null) {
    const quoted = requireResult[groupOffsetIndex];
    const unquoted = requireResult[groupOffsetIndex + 1] || requireResult[groupOffsetIndex + 2];

    if (quoted && unquoted) {
      const quoteChar = quoted[0];
      return line.replace(quoted, `${quoteChar}${convertPath(unquoted, currentPath)}${quoteChar}`);
    } else return null;
  } else return null;
};

export const convertPath = (relativePath: string, currentPath: string): string => {
  const currentPathPieces: Array<string> = currentPath.split('/');
  const relativePieces: Array<string> = relativePath.split('/');
  const pathSpec: PathSpec = pathSpecFor(relativePath);
  return [
    ...take(currentPathPieces, currentPathPieces.length - pathSpec.upDirectoryCount),
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
