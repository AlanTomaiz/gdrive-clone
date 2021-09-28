import { describe, test, jest, expect, beforeEach } from '@jest/globals';
import { pipeline as pipeStream } from 'stream';
import { promisify } from 'util';
import fs from 'fs';

import UploadHandler from '../../src/uploadHandler';
import { pathResolve } from '../../src/services/path.js';
import TestUtil from '../_util/testUtil';
import { logger } from '../../src/services/logger';

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
    jest.restoreAllMocks();
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
      const directory = pathResolve('uploads');
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
    const pipeline = promisify(pipeStream);

    test('Should call emit function and it is a transform stream', async () => {
      jest.spyOn(ioObj, ioObj.to.name);
      jest.spyOn(ioObj, ioObj.emit.name);

      const handler = new UploadHandler({ io: ioObj, client_id: 'uuid' });
      jest.spyOn(handler, handler.canExecute.name).mockReturnValue(true);

      const onWrite = jest.fn();
      const source = TestUtil.generateReadable(chunks);
      const target = TestUtil.generateWritable(onWrite);

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

    test('Should emit message with a interval of 1 second', async () => {
      jest.spyOn(ioObj, ioObj.emit.name);

      const day = '2021-09-27 15:22';
      const canExecuteStart = TestUtil.getTimeFromDate(`${day}:30`);
      const FirstVerification = TestUtil.getTimeFromDate(`${day}:31`);;
      const SetDelay = FirstVerification;

      const SecondVerification = TestUtil.getTimeFromDate(`${day}:31.200`);
      const ThirdVerification = TestUtil.getTimeFromDate(`${day}:31.800`);
      const LastVerification = TestUtil.getTimeFromDate(`${day}:32`);

      TestUtil.mockDateNow([
        canExecuteStart,
        FirstVerification,
        SetDelay,
        SecondVerification,
        ThirdVerification,
        LastVerification,
      ]);

      const filename = 'mockfile.txt';
      const source = TestUtil.generateReadable(chunks);
      const handler = new UploadHandler({ io: ioObj, client_id: 'uuid' });

      await pipeline(
        source,
        handler.handleFileBuffer(filename),
      );

      const [firstMessage, secondMessage] = ioObj.emit.mock.calls;

      expect(firstMessage).toEqual([handler.ON_UPLOAD_EVENT, { processedAlready: chunks[0].length, filename }]);
      expect(secondMessage).toEqual([handler.ON_UPLOAD_EVENT, { processedAlready: chunks.join('').length, filename }]);
    });
  });

  describe('- canExecute', () => {
    const handler = new UploadHandler({ io: {}, client_id: 'uuid' });

    test('Should return true when time is later than specified delay', () => {
      // FORMAT DATE: yyyy-mm-dd hh:ii:ss.u
      const tickTimeNow = TestUtil.getTimeFromDate('2021-09-23 17:00:01');
      const lastExecution = TestUtil.getTimeFromDate('2021-09-23 17:00');

      TestUtil.mockDateNow([tickTimeNow]);

      const result = handler.canExecute(lastExecution);
      expect(result).toBeTruthy();
    });

    test('Should return false when time isnt later than specified delay', () => {
      // FORMAT DATE: yyyy-mm-dd hh:ii:ss.u
      const tickTimeNow = TestUtil.getTimeFromDate('2021-09-23 17:00:00.100');
      const lastExecution = TestUtil.getTimeFromDate('2021-09-23 17:00');

      TestUtil.mockDateNow([tickTimeNow]);

      const result = handler.canExecute(lastExecution);
      expect(result).toBeFalsy();
    });
  });
});