import { Schema } from 'mongoose';
import IBaseResource from './IBaseMongoResource';

const schemaOptions = {
  timestamps: true,
};

export interface IDevice extends IBaseResource {
  mac: string;
  owner: Schema.Types.ObjectId;
  createdAt: string;
  updatedAt: string;

  getId(): Schema.Types.ObjectId;
  getTable(): string;
  getUserId(): Schema.Types.ObjectId;
}

export const deviceSchema = new Schema({
  mac: {
    type: String,
    required: true,
    index: true,
    unique: true,
  },
  owner: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
},                                     schemaOptions);

deviceSchema.methods.getId = function (): Schema.Types.ObjectId {
  return this._id;
};

deviceSchema.methods.getTable = function (): string {
  return 'device';
};

deviceSchema.methods.getUserId = function(): Schema.Types.ObjectId {
  return this.userId;
};
