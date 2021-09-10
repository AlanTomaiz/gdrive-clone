import https from 'https';
import fs from 'fs';
import { Server } from 'socket.io';

import Routes from './routes.js';
import { logger } from './services/logger.js';
import { pathResolve } from './services/path.js';

const PORT = process.env.PORT || 3000;
const routes = new Routes();

const localhostSSL = {
  key: fs.readFileSync( pathResolve('certificates', 'key.pem') ),
  cert: fs.readFileSync( pathResolve('certificates', 'cert.pem') ),
};

const server = https.createServer(
  localhostSSL,
  routes.handler.bind(routes),
);

const io = new Server(server, {
  cors: {
    origin: '*',
    credentials: false,
  }
});

routes.setSocketInstance(io);
io.on('connection', (socket) => logger.info(`Someone connected: ${socket.id}`));

server.listen(PORT, () => {
  const { address, port } = server.address();

  logger.info(`# Server running at https://${address}:${port}`);
});