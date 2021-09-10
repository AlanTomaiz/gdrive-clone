import fs from 'fs/promises';
import prettyBytes from 'pretty-bytes';

import { pathResolve } from './services/path.js';

const directory = pathResolve('uploads');

export default class FileHelper {
  static async getFilesStatus() {
    const currentFiles = await fs.readdir(directory);
    const filesStatus = await Promise.all(
      currentFiles.map(file => fs.stat(`${directory}/${file}`)),
    );

    const files = [];
    for (const fileIndex in currentFiles) {
      const { size, birthtime } = filesStatus[fileIndex];

      files.push({
        filename: currentFiles[fileIndex],
        size: prettyBytes(size),
        lastModified: birthtime,
        owner: process.env.USER,
      });
    }

    return files;
  }
}