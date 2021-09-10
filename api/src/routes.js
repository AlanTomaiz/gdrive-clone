import { logger } from './services/logger.js';
import fileHelper from './fileHelper.js';

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
    logger.info('Post router');

    response.end();
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