import { describe, expect, test, jest, beforeEach, afterAll } from '@jest/globals';
import FormData from 'form-data';
import fs from 'fs';

import TestUtil from '../_util/testUtil';
import { pathResolve } from '../../src/services/path.js';
import { logger } from '../../src/services/logger';
import Routes from '../../src/routes';
const directory = pathResolve();

describe('#Routes integration test', () => {
  const ioObj = {
    to: (id) => ioObj,
    emit: (event, message) => { }
  };

  beforeEach(() => {
    jest.restoreAllMocks();
    jest.spyOn(logger, 'info').mockImplementation();
  });

  afterAll(async () => {
    await fs.promises.rm(`${directory}/uploads/480p.mp4`);
  });

  describe('- getFile Status', () => {
    test('Should upload file on the folder', async () => {
      const file_path = `${directory}/test/integration/mocks/480p.mp4`;
      const fileStream = fs.createReadStream(file_path);
      const response = TestUtil.generateWritable(() => {});

      const form = new FormData();
      form.append('file', fileStream);

      const params = {
        request: Object.assign(form, {
          headers: form.getHeaders(),
          method: 'POST',
          url: '?user=uuid',
        }),
        response: Object.assign(response, {
          setHeader: jest.fn(),
          writeHead: jest.fn(),
          end: jest.fn(),
        }),
      }

      const routes = new Routes();
      routes.setSocketInstance(ioObj);

      const statusOfFilesBefore = await routes.fileHelper.getFilesStatus();
      expect(statusOfFilesBefore).toEqual([]);

      await routes.handler(...Object.values(params));
      const statusOfFilesAfter = await routes.fileHelper.getFilesStatus();
      expect(statusOfFilesAfter.length).toEqual(1);

      expect(params.response.writeHead).toHaveBeenCalledWith(200);
    });
  });
});