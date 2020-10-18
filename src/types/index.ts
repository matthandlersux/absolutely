export type PathSpec = {
  upDirectoryCount: number;
  topDownRelativePathPieces: Array<string>;
};

export type RootSpec = [rootPath: string, rootName: string];

export type Options = {
  glob: string;
  rootSpec?: RootSpec;
};
