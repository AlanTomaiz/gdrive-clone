export default class ViewManager {
  constructor() {
    this.file_input = document.querySelector('#fileElem input');
    this.action_upload_button = document.querySelector('#fileElem button');

    this.files_queue = document.getElementById('tbody');
    this.formatter = new Intl.DateTimeFormat('pt', {
      locale: 'pt-br',
      month: 'long',
      day: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  }

  makeIcon(file) {
    const type = file.split('.').pop();

    switch (type) {
      case 'png': case 'jpg': case 'jpeg':
        return 'jpeg.png';

      case 'mp3':
        return 'mp3.png';

      case 'mp4':
        return 'mp4.png';

      case 'xls': case 'xlsx':
        return 'xls.png';

      default:
        return 'doc.png';
    }
  }

  updateCurrentFiles(files) {
    const template = ({ filename, lastModified, owner, size }) => `
    <tr>
      <td>
        <img src="img/${this.makeIcon(filename)}" alt="${filename}" />
        ${filename}
      </td>
      <td>${owner}</td>
      <td>${this.formatter.format(new Date(lastModified))}</td>
      <td>${size}</td>
    </tr>
    `;

    const queue = files.map(file => template(file));
    this.files_queue.innerHTML += queue.join('');
  }

  handleClickButton() {
    this.action_upload_button.onclick = () =>  this.file_input.click();
  }

  handleOnFileChange(fn) {
    this.file_input.onchange = (e) => fn(e.target.files);
  }
}