import * as fs from 'fs';
import { IUser } from '../schemas/user';
import { IMedia } from '../schemas/media';
import models from '../models';
import { Schema } from 'mongoose';
import { IResourceController } from './base';
import { config, S3 } from 'aws-sdk';
import * as Sharp from 'sharp';
export class MediaController implements IResourceController<IMedia> {
  /**
   * Destroy a media record
   * @param {Schema.Types.ObjectId} id
   * @returns {Promise<void>}
   */
  async destroy(id: Schema.Types.ObjectId): Promise<void> {
    await models.Media.deleteOne({ _id: id });
  }

  /**
   * Edit a media record
   * @param {Schema.Types.ObjectId} id
   * @param data
   * @returns {Promise<IMedia>}
   */
  async edit(id: Schema.Types.ObjectId, data: any): Promise<IMedia> {
    return undefined;
  }

  /**
   * Get a media record.
   * @param {Schema.Types.ObjectId} id
   * @returns {Promise<IMedia>}
   */
  async get(id: Schema.Types.ObjectId): Promise<IMedia> {
    return await models.Media.findOne({ _id: id });
  }

  /**
   * Get a random piece of media from the present.
   * @param {Schema.Types.ObjectId} id
   * @returns {Promise<IMedia>}
   */
  async getRandomPresentMedia(id: Schema.Types.ObjectId): Promise<IMedia> {
    const allMedia: IMedia[] = await models.Media.find({ user: id, era: 'present' });
    return allMedia[Math.floor(Math.random() * allMedia.length)];
  }

  /**
   * Get linked media from the past.
   * @param {Schema.Types.ObjectId} id
   * @returns {Promise<IMedia>}
   */
  async getLinkedPastMedia(id: Schema.Types.ObjectId): Promise<IMedia> {
    const media = await this.get(id);

    if (!media) throw new Error('404');
    if (media.links.length === 0) return null;

    return await this.get(media.links[Math.floor(Math.random() * media.links.length)]);
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
    const allMedia: IMedia[] = await models.Media.find({ user: media.user });
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
    let media: IMedia = await this.get(id);
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

  /**
   * Get all media records.
   * @returns {Promise<IMedia[]>}
   */
  async getAll(): Promise<IMedia[]> {
    return undefined;
  }

  /**
   * Store a media record.
   * @param {{path: string; mimetype: string; user: IUser; era?: string}} data
   * @returns {Promise<IMedia>}
   */
  async store(data: {
    path: string,
    mimetype: string,
    user: IUser,
    era?: string,
    locket?: string,
  }): Promise<IMedia> {
    const media: IMedia = await models.Media.create({
      era: data.era || '',
      path: data.path,
      mimetype: data.mimetype,
      user: data.user._id,
      locket: data.locket || 'none',
    });

    data.user.media.push(media._id);
    await data.user.save();

    return media;
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
    const imageSize: number = 600;

    const supportedFileTypes: string[] = [
      'jpeg',
      'jpg',
      'png',
    ];

    if (supportedFileTypes.indexOf(ext) < 0) throw new Error('400');

    // Update S3 credentials.
    config.update({
      accessKeyId: process.env.AWS_ACCESS_KEY_ID,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    });

    const transformer = Sharp().resize(imageSize, imageSize);
    const stream = fs.createReadStream(storedPath).pipe(transformer);

    const s3: S3 = new S3();
    const params = {
      Bucket: process.env.AWS_BUCKET,
      Body: stream,
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
}
