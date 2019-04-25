/* tslint:disable:variable-name */

import * as path from 'path';
import { config, S3 } from 'aws-sdk';
import * as fs from 'fs';
import { IMedia } from '../schemas/Media';
import { Schema } from 'mongoose';
import { MediaRepository } from '../repositories/MediaRepository';
import { promisify } from 'util';

const Jimp = require('jimp');
const unlink = promisify(fs.unlink);

export default class MediaController {
  private maxImageSize: number = 600;
  private mediaRepository = new MediaRepository();

  /**
   * Resize an image using JIMP
   * todo: find something that doesnt take as long to redraw images...
   *
   * @param image
   * @param {string} mimetype
   * @returns {Promise<void>}
   */
  resizeImage(image: any, mimetype: string, size: number): Promise<void> {
    return new Promise<any>(async (resolve, reject) => {
      // read in an image.
      Jimp.read(image)
        .then((img: any) => {
          // get image orientation, height, and width
          const width = img.bitmap.width;
          const height = img.bitmap.height;
          const isSquare: boolean = width === height;
          const isPortrait: boolean = height > width && !isSquare;
          let widthSize: number = this.maxImageSize;
          let heightSize: number = this.maxImageSize;

          // auto size an edge depending on orientation.
          if (isPortrait && !isSquare) {
            widthSize = Jimp.AUTO;
          } else {
            heightSize = Jimp.AUTO;
          }

          // resize, return image buffer.
          img
            .resize(heightSize, widthSize)
            .cover(
              size,
              size,
              isPortrait ? Jimp.VERTICAL_ALIGN_MIDDLE : Jimp.HORIZONTAL_ALIGN_CENTER,
            ) // crop image from the centre
            .getBuffer(mimetype, (err: Error, buffer: any) => {
              if (err) {
                console.error(err);
                reject(err);
              }
              resolve(buffer);
            }); // resize
        })
        .catch((err: Error) => {
          reject(err);
        });
    });
  }

  async uploadMedia(filename: string, image: any): Promise<string> {
    const p: string = path.join(__dirname, `../../../uploads/${filename}`);

    if (process.env.LOCAL === 'true' || process.env.TEST === 'true') {
      fs.writeFile(p, image, (err) => {
        if (err) {
          console.error(err);
          throw err;
        }
        return filename;
      });
    }

    // Update S3 credentials.
    config.update({
      accessKeyId: process.env.AWS_ACCESS_KEY_ID,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    });

    const s3: S3 = new S3();
    const params = {
      Bucket: process.env.AWS_BUCKET,
      Body: image,
      Key: filename,
    };

    return new Promise<string>(((resolve, reject) => {
      s3.upload(params).promise()
        .then((data: any) => {
          resolve(data.key);
        })
        .catch((e) => {
          reject(e);
        });
    }));
  }

  /**
   * Store media in an S3 bucket.
   * @param {string} storedPath
   * @param {string} fileName
   * @param {string} ext
   * @param userId user id.
   * @returns {Promise<string>} the name of the file in the S3 Bucket.
   */
  async storeMedia(storedPath: string,
                   fileName: string,
                   ext: string,
                   userId: string,
  ): Promise<string> {
    // get a date string in the format YYYYMMDDHHMMSS
    const now: string = new Date().toISOString().slice(0, 19).replace(/[-:T]/g, '');
    const newFileName: string = `${userId}_${now}.${ext}`;
    const supportedFileTypes: string[] = [
      'jpeg',
      'jpg',
      'png',
    ];

    if (supportedFileTypes.indexOf(ext) < 0) throw new Error('400');

    return await this.uploadMedia(newFileName, fs.readFileSync(storedPath));
  }

  /**
   * Delete media from S3.
   * fixme:
   *  - Should remove local images
   *  - Should remove all versions of images.
   *
   * @param {IMedia} media
   * @returns {Promise<void>}
   */
  async deleteMedia(media: IMedia): Promise<void> {
    const filenames: string[] = [
      media.path,
    ];

    media.sizes.forEach((size) => {
      filenames.push(
        `${media.path.split('.')[0]}-${size}.${media.path.split('.')[1]}`,
      );
    });

    // if local
    if (process.env.LOCAL === 'true' || process.env.TEST === 'true') {
      filenames.forEach(async f => await unlink(path.join(__dirname, `../../../uploads/${f}`)));
    }

    config.update({
      accessKeyId: process.env.AWS_ACCESS_KEY_ID,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    });

    const s3: S3 = new S3();
    const params = {
      Bucket: process.env.AWS_BUCKET,
      Delete: {
        Objects: filenames.map((f) => {
          return { Key: f };
        }),
      },
    };

    return new Promise<void>(((resolve, reject) => {
      s3.deleteObjects(params).promise()
        .then(() => {
          resolve();
        })
        .catch((err: Error) => {
          reject(err);
        });
    }));
  }

  async fetchImage(key: string): Promise<any> {
    if (process.env.LOCAL === 'true' || process.env.TEST === 'true') {
      return new Promise<any>((resolve, reject) => {
        fs.readFile(path.join(__dirname, `../../../uploads/${key}`), async (err, data) => {
          if (err) {
            console.error(err);
            reject(err);
          }
          resolve(data);
        });
      });
    }

    // Update S3 credentials.
    config.update({
      accessKeyId: process.env.AWS_ACCESS_KEY_ID,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    });

    const s3: S3 = new S3();
    const params = {
      Bucket: process.env.AWS_BUCKET,
      Key: key,
    };

    return new Promise<any>(((resolve, reject) => {
      s3.getObject(params).promise()
        .then(async (data: any) => {
          resolve(data.Body);
        }).catch((e) => {
          reject(e);
        });
    }));
  }

  /**
   * Fetch a file from S3 storage
   *
   * @param {IMedia} media
   * @param {number} size, default 600
   * @returns {Promise<any>}
   */
  async getMediaFromS3(media: IMedia, size: number = this.maxImageSize): Promise<any> {
    // Check if running locally, access local files instead of S3 bucket.
    let image: any;
    const exists: boolean = media.sizes.indexOf(size) > -1;
    const key: string =
      !exists ? media.path : `${media.path.split('.')[0]}-${size}.${media.path.split('.')[1]}`;

    try {
      image = await this.fetchImage(key);
      if (!exists) {
        image = await this.resizeImage(image, media.mimetype, size);
        await this.uploadMedia(
          `${media.path.split('.')[0]}-${size}.${media.path.split('.')[1]}`,
          image,
        );
        media.sizes.push(size);
        await media.save();
      }
    } catch (e) {
      console.error(e);
      throw e;
    }

    return image;
  }

  /**
   * Get a random piece of media from the present.
   * @param {Schema.Types.ObjectId} id
   * @returns {Promise<IMedia>}
   */
  async getRandomPresentMedia(id: Schema.Types.ObjectId): Promise<IMedia> {
    const allMedia: IMedia[] = await this.mediaRepository
      .findManyWithFilter({ user: id, era: 'present' });
    return allMedia[Math.floor(Math.random() * allMedia.length)];
  }

  /**
   * Get linked media from the past.
   * @param {Schema.Types.ObjectId} id
   * @returns {Promise<IMedia>}
   */
  async getLinkedPastMedia(id: Schema.Types.ObjectId): Promise<IMedia> {
    const media = await this.mediaRepository.get(id);

    if (!media) throw new Error('404');
    if (media.links.length === 0) return null;

    return await this.mediaRepository
      .get(media.links[Math.floor(Math.random() * media.links.length)]);
  }

  /**
   * Get emotional links.
   * @param {IMedia} media
   * @returns {Promise<Schema.Types.ObjectId[][]>}
   */
  async getEmotionalLinks(media: IMedia): Promise<Schema.Types.ObjectId[][]> {
    if (media.era === 'past') {
      throw new Error('Links can only be generated for media from the present');
    }

    // Get all media
    const allMedia: IMedia[] = await this.mediaRepository.findManyWithFilter({ user: media.user });
    const matches: Schema.Types.ObjectId[][] = [[], [], []];

    // Loop through all media
    for (const item of allMedia) {
      // continue if item has no attached emotions
      if (!item.emotions || item.emotions.length === 0) {
        continue;
      }

      // Reject if media items are the same
      if (`${item._id}` === `${media._id}`) {
        continue;
      }

      // for each emotions string in media
      for (const emotions of item.emotions) {
        // for each emotion string in parent
        for (const parentEmotions of media.emotions) {
          // Create an array of individual emotions in parent
          const individualEmotions = parentEmotions.split(',');

          individualEmotions.forEach((emotion, index) => {
            if (emotions.includes(emotion)) {
              matches[index].push(item._id);
            }
          });
        }
      }
    }

    return matches;
  }

  /**
   * Add emotions to media.
   * @param {Schema.Types.ObjectId} id
   * @param {string} emotions
   * @returns {Promise<IMedia>}
   */
  async addEmotionsToMedia(id: Schema.Types.ObjectId,
                           emotions: string): Promise<IMedia> {
    let media: IMedia = await this.mediaRepository.get(id);
    if (!media) {
      throw new Error('Media not found');
    }

    if (!/[a-z]+,[a-z]+,[a-z]+/.test(emotions)) {
      throw new Error('Emotions must be three words separated by commas');
    }

    media.emotions.push(emotions);
    media = await media.save();
    return media;
  }
}
