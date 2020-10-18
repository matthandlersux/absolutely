import { FileWalker } from './index';

describe('walkFilesWithGlob', () => {
  const files = ['a', 'b', 'c'];
  const glob = '*.*';

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
      const transformer = (_path: string, line: string) => line.replace('a', 'b');
      reader.mockResolvedValue(fileContents);

      await instance.readWriteLinesOfFile(filename, transformer);

      expect(writer).toHaveBeenCalledWith(filename, 'bbc\ncbb');
    });
  });
});
