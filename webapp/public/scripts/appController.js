export default class AppController {
  constructor({ conn, view }) {
    this.conn = conn;
    this.view = view;
  }

  async initialize() {
    this.view.handleClickButton();
    this.view.handleOnFileChange(this.handleUploadFiles.bind(this));

    this.conn.bindEvents();
    this.indexFiles();
  }

  async handleUploadFiles(files) {
    const requests = [];

    for (const file of files) {
      requests.push(this.conn.uploadFile(file));
    }

    await Promise.all(requests);
    this.indexFiles();
  }

  async indexFiles() {
    const files = await this.conn.currentFiles();
    this.view.updateCurrentFiles(files);
  }
}