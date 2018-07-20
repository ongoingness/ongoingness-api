import { Schema, Document } from 'mongoose'

const schemaOptions = {
  timestamps: true
}

export interface IMedia extends Document {
  user: Schema.Types.ObjectId
  path: string,
  mimetype: string,
  createdAt: string
  updatedAt: string
}

export const MediaSchema = new Schema({
  user: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  path: {
    type: String,
    required: true
  },
  mimetype: {
    type: String,
    required: true
  }
}, schemaOptions)
