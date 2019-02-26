/* tslint:disable:variable-name */

import * as path from 'path';
import { config, S3 } from 'aws-sdk';
import * as fs from 'fs';
import { IMedia } from '../schemas/Media';
import { Schema } from 'mongoose';
import { MediaRepository } from '../repositories/MediaRepository';

const Jimp = require('jimp');

export default class MediaController {
  private maxImageSize: number = 600;
  private mediaRepository = new MediaRepository();

  /**
   * Resize an image.
   * @param {string} old
   * @param {string} newPath
   * @returns {Promise<void>}
   */
  resizeImage(old: string, newPath: string): Promise<void> {
    return new Promise<void>((resolve, reject) => {
      Jimp.read(old)
        .then((img: any) => {
          img
            .resize(this.maxImageSize, this.maxImageSize) // resize
            .write(newPath); // save
          resolve();
        })
        .catch((err: Error) => {
          reject(err);
        });
    });
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
    const p: string = path.join(__dirname, `../../../uploads/${newFileName}`);

    if (supportedFileTypes.indexOf(ext) < 0) throw new Error('400');

    if (process.env.LOCAL === 'true' || process.env.TEST === 'true') {
      try {
        await this.resizeImage(storedPath, p);
      } catch (e) {
        throw e;
      }

      return path.join(newFileName);
    }

    // Update S3 credentials.
    config.update({
      accessKeyId: process.env.AWS_ACCESS_KEY_ID,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    });

    const s3: S3 = new S3();
    const params = {
      Bucket: process.env.AWS_BUCKET,
      Body: fs.createReadStream(p),
      Key: newFileName,
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
   * Delete media from S3.
   * @param {IMedia} media
   * @returns {Promise<void>}
   */
  deleteMedia(media: IMedia): Promise<void> {
    config.update({
      accessKeyId: process.env.AWS_ACCESS_KEY_ID,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    });

    const s3: S3 = new S3();
    const params = {
      Bucket: process.env.AWS_BUCKET,
      Key: media.path,
    };

    return new Promise<void>(((resolve, reject) => {
      s3.deleteObject(params).promise()
        .then(() => {
          resolve();
        })
        .catch((err: Error) => {
          reject(err);
        });
    }));
  }

  /**
   * Fetch a file from S3 storage
   * @param {string} key file key.
   * @returns {Promise<any>}
   */
  getMediaFromS3(key: string): Promise<any> {
    if (process.env.LOCAL === 'true' || process.env.TEST === 'true') {
      return new Promise<any>((resolve, reject) => {
        fs.readFile(path.join(__dirname, `../../../uploads/${key}`), (err, data) => {
          if (err) {
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
        .then((data: any) => {
          resolve(data.Body);
        }).catch((e) => {
          reject(e);
        });
    }));
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
