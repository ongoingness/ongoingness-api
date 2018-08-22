import models from "../models";
import {Document, Schema} from "mongoose";
import {IMedia} from "./media";
import {IDevice} from "./device";

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

  // Functions
  getMedia(id: Schema.Types.ObjectId): Promise<IMedia>
  getDevice(id: Schema.Types.ObjectId): Promise<IDevice>
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
  devices: [{
    type: Schema.Types.ObjectId,
    ref: 'Device'
  }],
  media: [{
    type: Schema.Types.ObjectId,
    ref: 'Media'
  }]
}, schemaOptions)

/**
 * Get media belonging to user
 * @param {Schema.Types.ObjectId} id
 * @returns {Promise<IMedia>}
 */
UserSchema.methods.getMedia = async function(id: Schema.Types.ObjectId): Promise<IMedia> {
  let media: IMedia = await models.Media.findOne({_id: id})

  // Check media belongs to the user
  if (this.media.indexOf(media._id.toString()) > -1) {
    return media
  }

  return null
}

/**
 * Return all media belonging to the user
 * @returns {Promise<IMedia[]>}
 */
UserSchema.methods.getAllMedia = async function(): Promise<IMedia[]> {
  return await models.Media.find({user: this._id})
}

/**
 * Get a device belonging to the user
 * @param {Schema.Types.ObjectId} id
 * @returns {Promise<IDevice>}
 */
UserSchema.methods.getDevice = async function(id: Schema.Types.ObjectId): Promise<IDevice> {
  let device: IDevice = await models.Device.findOne({_id: id})

  if (this.devices.indexOf(device._id.toString()) > -1) {
    return device
  }

  return null
}