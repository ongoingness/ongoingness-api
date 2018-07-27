import { Schema, Document } from 'mongoose'

const schemaOptions = {
  timestamps: true
}

export interface IMedia extends Document {
  user: Schema.Types.ObjectId
  links: Schema.Types.ObjectId[]
  path: string,
  mimetype: string,
  era: string
  createdAt: string
  updatedAt: string
}

export const MediaSchema = new Schema({
  user: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  links: [{
    type: Schema.Types.ObjectId,
    ref: 'Media',
    required: true,
    default: []
  }],
  era: {
    type: String,
    enum: ['past', 'present'],
    required: true,
    default: 'past'
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
