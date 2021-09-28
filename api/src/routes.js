import { parse } from 'url';
import { promisify } from 'util'
import { pipeline as pipeStream } from 'stream';

import { logger } from './services/logger.js';
import fileHelper from './fileHelper.js';
import UploadHandler from './uploadHandler.js';

export default class Routes {
  io;

  constructor() {
    this.fileHelper = fileHelper;
  }

  setSocketInstance(io) {
    this.io = io;
  }

  async options(request, response) {
    response.writeHead(204);
    response.end();
  }

  async get(request, response) {
    const files = await this.fileHelper.getFilesStatus();

    response.writeHead(200);
    response.end(JSON.stringify(files));
  }

  async post(request, response) {
    const pipeline = promisify(pipeStream);

    const { headers } = request;
    const { user } = parse(request.url, true).query;
    const uploadHandler = new UploadHandler({ io: this.io, client_id: user });

    const busboyInstance = uploadHandler.eventRegister(headers, () => {
      response.writeHead(200);

      const data = JSON.stringify({ status: 'success', message: 'Files uploaded with success!' });
      response.end(data);
    });

    await pipeline(request, busboyInstance);
  }

  async notFound(request, response) {
    response.writeHead(404);
    response.end('Not Found');
  }

  handler(request, response) {
    response.setHeader('Access-Control-Allow-Origin', '*');

    const chosen = this[request.method.toLowerCase()] || this.notFound;
    return chosen.apply(this, [request, response]);
  }
}