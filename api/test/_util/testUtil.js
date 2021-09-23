import { Readable, Transform, Writable } from 'stream';

export default class TestUtil {
  static generateReadable(data) {
    return new Readable({
      objectMode: true,
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
      objectMode: true,
      write (Chunk, encondig, cb) {
        onData(Chunk);
        cb(null, Chunk);
      }
    });
  }

  static generateTransform(onData) {
    return new Transform({
      objectMode: true,
      transform (Chunk, encondig, cb) {
        onData(Chunk);
        cb(null, Chunk);
      }
    });
  }
}