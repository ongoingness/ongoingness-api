import Models from '../Models';
import { Schema } from 'mongoose';
import { IMedia } from './Media';
import { IDevice } from './Device';
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
  getLinkedCollection(collectionName: string): Schema.Types.ObjectId[];
  setLinkedCollection(collection: Schema.Types.ObjectId[], collectionName: string): Promise<void>;

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
  const media: IMedia = await Models.Media.findOne({ _id: id });

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
  return await Models.Media.find({ user: this._id });
};

/**
 * Get a device belonging to the user
 * @param {Schema.Types.ObjectId} id
 * @returns {Promise<IDevice>}
 */
userSchema.methods.getDevice = async function (id: Schema.Types.ObjectId): Promise<IDevice> {
  const device: IDevice = await Models.Device.findOne({ _id: id });

  if (this.devices.indexOf(device._id.toString()) > -1) {
    return device;
  }

  return null;
};

userSchema.methods.getLinkedCollection =
  function (collectionName: string): Schema.Types.ObjectId[] {
    switch (collectionName) {
      case 'devices':
        return this.devices;
      case 'media':
        return this.media;
      default:
        return [];
    }
  };

userSchema.methods.setLinkedCollection =
  async function (collection: Schema.Types.ObjectId, collectionName: string): Promise<void> {
    switch (collectionName) {
      case 'devices':
        this.devices = collection;
        break;
      case 'media':
        this.media = collection;
        break;
      default:
        break;
    }

    await this.save();
  };

userSchema.methods.getId = function (): Schema.Types.ObjectId {
  return this._id;
};

userSchema.methods.getTable = function (): string {
  return 'user';
};
