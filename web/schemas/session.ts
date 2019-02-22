import { Schema } from 'mongoose';
import IBaseMongoResource from './IBaseMongoResource';

const schemaOptions = {
  timestamps: true,
};

export interface ISession extends IBaseMongoResource {
  user: Schema.Types.ObjectId;
  media: Schema.Types.ObjectId;
  createdAt: string;
  updatedAt: string;

  getId(): Schema.Types.ObjectId;
  getTable(): string;
  getUserId(): Schema.Types.ObjectId;
}

export const sessionSchema = new Schema({
  user: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  media: {
    type: Schema.Types.ObjectId,
    ref: 'Media',
    required: true,
  },
},                                      schemaOptions);

sessionSchema.methods.getId = function (): Schema.Types.ObjectId {
  return this._id;
};

sessionSchema.methods.getTable = function (): string {
  return 'device';
};

sessionSchema.methods.getUserId = function (): Schema.Types.ObjectId {
  return this.userId;
};
