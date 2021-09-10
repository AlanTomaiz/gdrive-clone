import https from 'https';
import path from 'path';
import fs from 'fs';
import { logger } from './services/logger.js';

const PORT = process.env.PORT || 3000;
const directory = path.resolve('certificates');

const localhostSSL = {
  key: fs.readFileSync( path.join(directory, 'key.pem') ),
  cert: fs.readFileSync( path.join(directory, 'cert.pem') ),
};

const server = https.createServer(
  localhostSSL,
  (req, res) => {
    res.end('Hello World');
  }
);

server.listen(PORT, () => {
  const { address, port } = server.address();

  logger.info(`# Server running at https://${address}:${port}`);
});