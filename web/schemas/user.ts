import { Schema, Document } from 'mongoose'

const schemaOptions = {
  timestamps: true
}

export interface IUser extends Document {
  username: string
  password: string
  iv: string
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
  }
}, schemaOptions)
