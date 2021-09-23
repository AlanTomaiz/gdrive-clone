import { describe, test, jest, expect, beforeEach } from '@jest/globals';
import { pipeline as pipeStream } from 'stream';
import { promisify } from 'util';
import fs from 'fs';

import UploadHandler from '../../src/uploadHandler';
import { pathResolve } from '../../src/services/path.js';
import TestUtil from '../_util/testUtil';
import { logger } from '../../src/services/logger';

const directory = pathResolve('uploads');
const pipeline = promisify(pipeStream);

describe('#UploadHandler test suite', () => {
  const chunks = ['Chunk', 'of', 'looong', 'data'];

  const ioObj = {
    to: (id) => ioObj,
    emit: (event, message) => { }
  };

  const fileHeader = {
    'content-type': 'multipart/form-data; boundary='
  }

  beforeEach(() => {
    jest.spyOn(logger, 'info').mockImplementation();
  });

  describe('- eventRegister', () => {
    test('Should call onFile function and emit finish alert', () => {
      const handler = new UploadHandler({ io: ioObj, client_id: 'uuid' });

      jest.spyOn(handler, handler.onFile.name).mockResolvedValue();

      const finishFn = jest.fn();
      const busboy = handler.eventRegister(fileHeader, finishFn);

      const streamSource = TestUtil.generateReadable(chunks);
      busboy.emit('file', 'fieldname', streamSource, 'filename.txt');

      expect(handler.onFile).toHaveBeenCalled();
    });
  });

  describe('- onFile', () => {
    test('Given a stream file it should save it on disk', async () => {
      const handler = new UploadHandler({ io: ioObj, client_id: 'uuid' });

      const onData = jest.fn();
      jest.spyOn(fs, fs.createWriteStream.name)
        .mockImplementation(() => TestUtil.generateWritable(onData));

      const onTransform = jest.fn();
      jest.spyOn(handler, handler.handleFileBuffer.name)
        .mockImplementation(() => TestUtil.generateTransform(onTransform));

      const params = {
        fieldname: 'video',
        file: TestUtil.generateReadable(chunks),
        filename: 'mockfile.txt',
      }

      await handler.onFile(...Object.values(params));

      expect(onData.mock.calls.join()).toEqual(chunks.join());
      expect(onTransform.mock.calls.join()).toEqual(chunks.join());

      expect(fs.createWriteStream).toHaveBeenCalledWith(`${directory}/${params.filename}`);
    });
  });

  describe('- handleFileBuffer', () => {
    test('Should call emit function and it is a transform stream', async () => {
      jest.spyOn(ioObj, ioObj.to.name);
      jest.spyOn(ioObj, ioObj.emit.name);

      const handler = new UploadHandler({ io: ioObj, client_id: 'uuid' });

      jest.spyOn(handler, handler.canExecute.name).mockReturnValue(true);

      const onWrite = jest.fn();
      const target = TestUtil.generateWritable(onWrite);
      const source = TestUtil.generateReadable(chunks);

      await pipeline(
        source,
        handler.handleFileBuffer('mockfile.txt'),
        target
      );

      expect(ioObj.to).toHaveBeenCalledTimes(chunks.length);
      expect(ioObj.emit).toHaveBeenCalledTimes(chunks.length);

      expect(onWrite).toHaveBeenCalledTimes(chunks.length);
      expect(onWrite.mock.calls.join()).toEqual(chunks.join());
    });
  });
});