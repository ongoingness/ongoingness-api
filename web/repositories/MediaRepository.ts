import { IUser } from '../schemas/User';
import { IMedia } from '../schemas/Media';
import { getModel } from '../Models';
import { MongoResourceRepository } from './MongoResourceRepository';

export class MediaRepository extends MongoResourceRepository<IMedia> {
  constructor() {
    super();
    this.setTableName('media');
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
    emotions?: string[],
  }): Promise<IMedia> {
    const media: IMedia = await getModel('media').create({
      era: data.era || '',
      path: data.path,
      mimetype: data.mimetype,
      user: data.user._id,
      locket: data.locket || 'none',
      emotions: data.emotions || [],
    }) as IMedia;

    data.user.media.push(media._id);
    await data.user.save();

    return media;
  }
}
