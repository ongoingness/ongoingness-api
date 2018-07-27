import { Schema, Document } from 'mongoose'

const schemaOptions = {
  timestamps: true
}

export interface IUser extends Document {
  username: string
  password: string
  iv: string
  devices: Schema.Types.ObjectId[]
  media: Schema.Types.ObjectId[]
  createdAt: string
  updatedAt: string
}

export const UserSchema = new Schema({
  username: {
    type: String,
    required: true,
    index: true,
    unique: true
  },
  password: {
    type: String,
    required: true
  },
  iv: {
    type: String,
    required: true
  },
  devices: [
    {
      type: Schema.Types.ObjectId,
      ref: 'Device'
    }
  ],
  media: [{
    type: Schema.Types.ObjectId,
    ref: 'Media'
  }]
}, schemaOptions)
