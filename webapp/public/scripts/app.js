import AppController from "./appController.js";
import ConnectionManager from "./connectionManager.js";
import ViewManager from "./ViewManager.js";

const API_URL = 'https://127.0.0.1:3000';

const view = new ViewManager();
const connection = new ConnectionManager({ apiUrl: API_URL });
const Controller = new AppController({ conn: connection, view });

try {
  Controller.initialize();
} catch (error) {
  console.error('Error on initializing', error);
}