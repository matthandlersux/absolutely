import { take, dropWhile } from 'lodash';

import { RootSpec, PathSpec, Options } from '@app/types';
import { FileWalker } from '@app/file-walking';

const importRegex = /^import .* from ('(.*)'|"(.*)");?$/i;
export const requireRegex = /\brequire\(('(.*)'|"(.*)")\);?/i;

export type ConvertOptions = {
  currentPath: string;
  toTransform: string;
  rootSpec?: RootSpec;
};

export const convertLine = ({ currentPath, toTransform, rootSpec }: ConvertOptions): string => {
  return (
    matchLineAndReplace(toTransform, importRegex, 1, currentPath, rootSpec) ||
    matchLineAndReplace(toTransform, requireRegex, 1, currentPath, rootSpec) ||
    toTransform
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
    const notInAString = !isLineAQuotedMatchForRegex(line, regex);

    if (quoted && unquoted && notInAString && (unquoted.startsWith('./') || unquoted.startsWith('../'))) {
      const quoteChar = quoted[0];
      const converted = convertPath({ currentPath, rootSpec, toTransform: unquoted });
      return line.replace(quoted, `${quoteChar}${converted}${quoteChar}`);
    } else return null;
  } else return null;
};

export const convertPath = ({ currentPath, toTransform, rootSpec }: ConvertOptions): string => {
  const currentPathPieces: Array<string> = currentPath.split('/');
  const pathSpec: PathSpec = pathSpecFor(toTransform);

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

export const isLineAQuotedMatchForRegex = (line: string, regex: RegExp): boolean => {
  type Acc = { inQuotes: boolean; strings: Array<string> };
  const initialAcc: Acc = { inQuotes: false, strings: [] };
  const ESCAPE = '\\';

  const result = line.split('').reduce(({ inQuotes, strings: [current, ...prev] }, char) => {
    switch (char) {
      case "'":
      case '"':
        if (inQuotes && current[0] === char && current.slice(-1) != ESCAPE)
          return { inQuotes: false, strings: [current + char, ...prev] };
        else if (!inQuotes) return { inQuotes: true, strings: [char, ...(current ? [current] : []), ...prev] };
      default:
        if (inQuotes) return { inQuotes, strings: [current + char, ...prev] };
        else return { inQuotes, strings: [current, ...prev] };
    }
  }, initialAcc);

  return result.strings.some((string) => string.match(regex));
};

export const rewriteAllFiles = async (options: Options, convert = convertLine) => {
  const fileWalker = new FileWalker();
  await fileWalker.updateFilesWithOptions(options, convert);
};
