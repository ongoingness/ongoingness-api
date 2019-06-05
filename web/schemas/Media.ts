import { Schema } from 'mongoose';
import { MediaRepository } from '../repositories/MediaRepository';
import IBaseMongoResource from './IBaseMongoResource';

const schemaOptions = {
  timestamps: true,
};
const mediaController: MediaRepository = new MediaRepository();

export interface IMedia extends IBaseMongoResource {
  user: Schema.Types.ObjectId;
  links: Schema.Types.ObjectId[];
  path: string;
  mimetype: string;
  sizes: number[];
  era: string;
  emotions: string[];
  locket: string;
  createdAt: string;
  updatedAt: string;

  // Functions
  createLink(linkId: Schema.Types.ObjectId): Promise<void>;
  createMultipleLinks(linkIds: [Schema.Types.ObjectId]): Promise<void>;
  getId(): Schema.Types.ObjectId;
  getTable(): string;
  getUserId(): Schema.Types.ObjectId;
}

export const mediaSchema = new Schema({
  user: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  links: [{
    type: Schema.Types.ObjectId,
    ref: 'Media',
    required: true,
    default: [],
  }],
  era: {
    type: String,
    enum: ['past', 'present'],
    required: true,
    default: 'past',
  },
  emotions: [{
    type: String,
  }],
  sizes: [{
    type: Number,
  }],
  path: {
    type: String,
    required: true,
  },
  mimetype: {
    type: String,
    required: true,
  },
  locket: {
    type: String,
    enum: ['temp', 'perm', 'none'],
  },
},                                    schemaOptions);

mediaSchema.methods.createLink = async function (linkId: Schema.Types.ObjectId): Promise<void> {
  const link: IMedia = await mediaController.get(linkId);

  // Cancel if link does not exist
  if (!link) {
    return;
  }

  // Check they are not the same era
  //if (!(link.era === this.era)) {
    // Check link does not already exist
    if (this.links.indexOf(link._id.toString()) === -1) {
      this.links.push(linkId);
      await this.save();
    }
  //}
};

mediaSchema.methods.createMultipleLinks = async function (linkIds: Array<Schema.Types.ObjectId>): Promise<void> {
  linkIds.forEach( (id : any) => {
    this.links.push(id);
  });
  await this.save();
};

mediaSchema.methods.getId = function (): Schema.Types.ObjectId {
  return this._id;
};

mediaSchema.methods.getTable = function (): string {
  return 'device';
};

mediaSchema.methods.getUserId = function (): Schema.Types.ObjectId {
  return this.userId;
};
