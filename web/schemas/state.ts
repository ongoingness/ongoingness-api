import { Schema, Document } from 'mongoose'

const schemaOptions = {
  timestamps: true
}

export interface IState extends Document {
  device: Schema.Types.ObjectId
  media: Schema.Types.ObjectId
  createdAt: string
  updatedAt: string
}

export const StateSchema = new Schema({
  device: {
    type: Schema.Types.ObjectId,
    ref: 'Device',
    required: true
  },
  media: {
    type: Schema.Types.ObjectId,
    ref: 'Device',
    required: true
  }
}, schemaOptions)
