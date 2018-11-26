import { Schema, Document } from 'mongoose';

const schemaOptions = {
  timestamps: true,
};

export interface ISession extends Document {
  user: Schema.Types.ObjectId;
  media: Schema.Types.ObjectId;
  createdAt: string;
  updatedAt: string;
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
