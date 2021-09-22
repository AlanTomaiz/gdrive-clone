import { describe, test, expect, jest } from '@jest/globals';
import fs from 'fs/promises';

import fileHelper from '../../src/fileHelper.js';

describe('#FileHelper test suite', () => {
  const statMock = {
    dev: 2050,
    mode: 33204,
    nlink: 1,
    uid: 1000,
    gid: 1000,
    rdev: 0,
    blksize: 4096,
    ino: 13655173,
    size: 42412032,
    blocks: 82840,
    atimeMs: 1631299365083.277,
    mtimeMs: 1631299364827.2778,
    ctimeMs: 1631299638282.4712,
    birthtimeMs: 1631299356787.3015,
    atime: '2021-09-10T18:42:45.083Z',
    mtime: '2021-09-10T18:42:44.827Z',
    ctime: '2021-09-10T18:47:18.282Z',
    birthtime: '2021-09-10T18:42:36.787Z'
  };

  test('- getFilesStatus', async () => {
    process.env.USER = 'alantomaiz';

    const filename = 'test.test';

    const expectedResult = [
      {
        filename,
        size: '42.4 MB',
        lastModified: statMock.birthtime,
        owner: 'alantomaiz',
      }
    ];

    jest.spyOn(fs, fs.readdir.name).mockResolvedValue([filename]);
    jest.spyOn(fs, fs.stat.name).mockResolvedValue(statMock);

    const result = await fileHelper.getFilesStatus();
    expect(result).toMatchObject(expectedResult);
  });
});