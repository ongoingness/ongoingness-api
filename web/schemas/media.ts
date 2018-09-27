import { Schema, Document } from 'mongoose'
import {getMediaRecord} from "../controllers/media";

const schemaOptions = {
  timestamps: true
}

export interface IMedia extends Document {
  user: Schema.Types.ObjectId
  links: Schema.Types.ObjectId[]
  path: string
  mimetype: string
  era: string
  emotions: string[]
  createdAt: string
  updatedAt: string

  // Functions
  createLink(linkId: Schema.Types.ObjectId): Promise<void>
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
  emotions: [{
    type: String
  }],
  path: {
    type: String,
    required: true
  },
  mimetype: {
    type: String,
    required: true
  }
}, schemaOptions)

MediaSchema.methods.createLink = async function (linkId: Schema.Types.ObjectId): Promise<void> {
  const link: IMedia = await getMediaRecord(linkId)

  // Cancel if link does not exist
  if (!link) {
    return
  }

  // Check they are not the same era
  if (!(link.era === this.era)) {
    // Check link does not already exist
    if (this.links.indexOf(link._id.toString()) === -1) {
      this.links.push(linkId)
      await this.save()
    }
  }
}
