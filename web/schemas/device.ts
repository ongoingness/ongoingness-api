import { Schema, Document } from 'mongoose';

const schemaOptions = {
  timestamps: true,
};

export interface IDevice extends Document {
  mac: string;
  owner: Schema.Types.ObjectId;
  createdAt: string;
  updatedAt: string;
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
