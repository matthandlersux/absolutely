import { FileWalker } from '@app/file-walking/index';
import { Options } from '@app/types';
import { ConvertOptions } from '@app/utils';

describe('walkFilesWithGlob', () => {
  const files = ['a', 'b', 'c'];
  const glob = '*.*';

  const options: Options = {
    glob,
  };

  let globber: jest.Mock;
  let reader: jest.Mock;
  let writer: jest.Mock;
  let instance: FileWalker;

  beforeEach(() => {
    globber = jest.fn();
    reader = jest.fn();
    writer = jest.fn();

    instance = new FileWalker(globber, reader, writer);
  });

  describe('walkFilesWithGlob', () => {
    it('runs the given function once for each file', async () => {
      globber.mockReturnValue(files);
      const mockApply = jest.fn();

      await instance.walkFilesWithGlob(glob, mockApply);

      expect(mockApply).toHaveBeenCalledWith('a');
      expect(mockApply).toHaveBeenCalledWith('b');
      expect(mockApply).toHaveBeenCalledWith('c');
    });
  });

  describe('readWriteLinesOfFile', () => {
    it('attempts to write a transformed file to the same place it read from', async () => {
      const filename = 'filename';
      const fileContents = 'abc\ncba';
      const transformer = (convertOptions: ConvertOptions) => convertOptions.toTransform.replace('a', 'b');
      reader.mockResolvedValue(fileContents);

      await instance.readWriteLinesOfFile(filename, transformer, options);

      expect(writer).toHaveBeenCalledWith(filename, 'bbc\ncbb');
    });

    it('chops the filename off of the path passed to transformer', async () => {
      const relativeFilename = './src/path/to/file.js';
      reader.mockResolvedValue('');
      const transformer = jest.fn();

      await instance.readWriteLinesOfFile(relativeFilename, transformer, options);

      expect(transformer).toHaveBeenCalledWith({
        currentPath: './src/path/to',
        toTransform: expect.anything(),
        rootSpec: undefined,
      });
    });
  });
});
