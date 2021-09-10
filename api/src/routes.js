import { logger } from './services/logger.js';

export default class Routes {
  io;

  constructor() {}

  setSocketInstance(io) {
    this.io = io;
  }

  async options(request, response) {
    response.writeHead(204);
    response.end();
  }

  async get(request, response) {
    logger.info('Get router');

    response.end();
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