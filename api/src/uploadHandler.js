import fs from 'fs';
import Busboy from 'busboy';
import { promisify } from 'util'
import { pipeline as pipeStream } from 'stream';

import { pathResolve } from './services/path.js';
import { logger } from './services/logger.js';

const directory = pathResolve('uploads');
const pipeline = promisify(pipeStream);

export default class UploadHandler {
  constructor({ io, client_id }) {}

  handleFileBuffer() {}

  async onFile(fieldname, file, filename) {
    await pipeline(
      file,
      this.handleFileBuffer(filename),
      fs.createWriteStream(`${directory}/${filename}`)
    );

    logger.info(`File [${filename}] finished`);
  }

  eventRegister(headers, onFinish) {
    const busboy = new Busboy({ headers });

    busboy.on('file', this.onFile.bind(this));
    busboy.on('finish', onFinish);

    return busboy;
  }
}