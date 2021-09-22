import { Readable, Transform, Writable } from 'stream';

export default class TestUtil {
  static generateReadable(data) {
    return new Readable({
      read () {
        for (const chunk of data) {
          this.push(chunk);
        }

        this.push(null);
      }
    });
  }

  static generateWritable(onData) {
    return new Writable({
      write (Chunk, encondig, cb) {
        onData(Chunk);
        cb(null, Chunk);
      }
    });
  }

  static generateTransform(onData) {
    return new Transform({
      transform (Chunk, encondig, cb) {
        onData(Chunk);
        cb(null, Chunk);
      }
    });
  }
}