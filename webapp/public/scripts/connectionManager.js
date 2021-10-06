export default class ConnectionManager {
  socketId;

  constructor({ apiUrl }) {
    this.apiUrl = apiUrl;

    this.io_client = io.connect(apiUrl, { withCredentials: false });
  }

  bindEvents() {
    this.io_client.on('connect', this.onConnect.bind(this));
  }

  onConnect() {
    console.log('Connected', this.io_client.id);
    this.socketId = this.io_client.id;
  }

  async currentFiles() {
    try {
      const request = await fetch(this.apiUrl);
      return request.json();
    } catch (error) {
      console.error('currentFiles', error);
    }
  }

  async uploadFile(file) {
    const form = new FormData();
    form.append('file', file);

    const options = {
      method: 'POST',
      body: form,
    };

    const response = await fetch(`${this.apiUrl}?user=${this.socketId}`, options);
    return response.json();
  }
}