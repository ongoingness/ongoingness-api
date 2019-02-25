/* tslint:disable:variable-name */

const Jimp = require('jimp');

export default class MediaController {
  resizeImage(old: string, newPath: string): Promise<void> {
    return new Promise<void>((resolve, reject) => {
      Jimp.read(old)
        .then((img: any) => {
          img
            .resize(600, 600) // resize
            .quality(100) // set JPEG quality
            .write(newPath); // save
          resolve();
        })
        .catch((err: Error) => {
          reject(err);
        });
    });
  }
}
