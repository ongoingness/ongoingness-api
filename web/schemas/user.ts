import models from '../models';
import { Schema } from 'mongoose';
import { IMedia } from './media';
import { IDevice } from './device';
import IBaseMongoResource from './IBaseMongoResource';
import { UserRole } from '../UserRole';

const schemaOptions = {
  timestamps: true,
};

export interface IUser extends IBaseMongoResource {
  username: string;
  password: string;
  iv: string;
  devices: Schema.Types.ObjectId[];
  media: Schema.Types.ObjectId[];
  role: UserRole;
  createdAt: string;
  updatedAt: string;

  // Functions
  getMedia(id: Schema.Types.ObjectId): Promise<IMedia>;
  getAllMedia(): Promise<IMedia[]>;
  getDevice(id: Schema.Types.ObjectId): Promise<IDevice>;

  getId(): Schema.Types.ObjectId;
  getTable(): string;
}

export const userSchema = new Schema({
  username: {
    type: String,
    required: true,
    index: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
  iv: {
    type: String,
    required: true,
  },
  devices: [{
    type: Schema.Types.ObjectId,
    ref: 'Device',
  }],
  media: [{
    type: Schema.Types.ObjectId,
    ref: 'Media',
  }],
  role: {
    default: UserRole.USER,
    enum: [
      UserRole.ADMIN,
      UserRole.USER,
    ],
    type: String,
  },
},                                   schemaOptions);

/**
 * Get media belonging to user
 * @param {Schema.Types.ObjectId} id
 * @returns {Promise<IMedia>}
 */
userSchema.methods.getMedia = async function (id: Schema.Types.ObjectId): Promise<IMedia> {
  const media: IMedia = await models.Media.findOne({ _id: id });

  // Check media belongs to the user
  if (this.media.indexOf(media._id.toString()) > -1) {
    return media;
  }

  return null;
};

/**
 * Return all media belonging to the user
 * @returns {Promise<IMedia[]>}
 */
userSchema.methods.getAllMedia = async function (): Promise<IMedia[]> {
  return await models.Media.find({ user: this._id });
};

/**
 * Get a device belonging to the user
 * @param {Schema.Types.ObjectId} id
 * @returns {Promise<IDevice>}
 */
userSchema.methods.getDevice = async function (id: Schema.Types.ObjectId): Promise<IDevice> {
  const device: IDevice = await models.Device.findOne({ _id: id });

  if (this.devices.indexOf(device._id.toString()) > -1) {
    return device;
  }

  return null;
};

userSchema.methods.getId = function (): Schema.Types.ObjectId {
  return this._id;
};

userSchema.methods.getTable = function (): string {
  return 'user';
};
