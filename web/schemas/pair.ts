import { Schema, Document } from 'mongoose';

const schemaOptions = {
  timestamps: true,
};

export interface IPair extends Document {
  owner: Schema.Types.ObjectId;
  device1: Schema.Types.ObjectId;
  device2: Schema.Types.ObjectId;
  createdAt: string;
  updatedAt: string;
}

export const pairSchema = new Schema({
  owner: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  device1: {
    type: Schema.Types.ObjectId,
    ref: 'Device',
    required: true,
  },
  device2: {
    type: Schema.Types.ObjectId,
    ref: 'Device',
    required: true,
  },
},                                   schemaOptions);
