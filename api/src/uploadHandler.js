import fs from 'fs';
import Busboy from 'busboy';
import { promisify } from 'util'
import { pipeline as pipeStream } from 'stream';

import { pathResolve } from './services/path.js';
import { logger } from './services/logger.js';

export default class UploadHandler {
  ON_UPLOAD_EVENT = 'file-upload';

  constructor({ io, client_id }) {
    this.io = io;
    this.client_id = client_id;
  }

  canExecute(lastExecution) {
    const time = Date.now() - lastExecution;
    return time >= 1000;
  }

  handleFileBuffer(filename) {
    let lastMessageSent = Date.now();

    async function* handleData(source) {
      let processedAlready = 0;

      for await (const chunk of source) {
        yield chunk;

        processedAlready += chunk.length;
        if (this.canExecute(lastMessageSent)) {
          lastMessageSent = Date.now();

          this.io.to(this.client_id).emit(this.ON_UPLOAD_EVENT, { processedAlready, filename });
          logger.info(`File [${filename}] got ${processedAlready} bytes to ${this.client_id}`);
        }
      }
    }

    return handleData.bind(this);
  }

  async onFile(fieldname, file, filename) {
    const directory = pathResolve('uploads');
    const pipeline = promisify(pipeStream);

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