import * as path from "path"
import * as fs from "fs"
import {IUser} from "../schemas/user"
import {IMedia} from "../schemas/media"
import models from "../models"
import {promisify} from "util"
import * as crypto from "crypto"
import {Schema} from "mongoose";

const rename = promisify(fs.rename)

/**
 * Store a file
 * @param {string} storedPath
 * @param {string} fileName
 * @param {string} ext
 * @returns {Promise<string>}
 */
export async function storeMedia(storedPath: string, fileName: string, ext: string): Promise<string> {
  const hash: crypto.Hash = crypto.createHash('sha1')
  hash.update(fileName)
  fileName = hash.digest('hex')

  const filepath = path.join(__dirname, `/../../../uploads/${fileName}.${ext}`)

  await rename(storedPath, filepath)

  return filepath
}

/**
 * Store a record of uploaded media
 * @param {string} path
 * @param {string} mimetype
 * @param {IUser} user
 * @returns {Promise<IMedia>}
 */
export async function storeMediaRecord(path: string, mimetype: string, user: IUser): Promise<IMedia> {
  const media: IMedia = await models.Media.create({path: path, mimetype: mimetype, user: user._id})

  user.media.push(media._id)
  await user.save()

  return media
}

/**
 * Return a record of a media item
 * @param {module:mongoose.Schema.Types.ObjectId} id
 * @returns {Promise<IMedia>}
 */
export async function getMedia(id: Schema.Types.ObjectId): Promise<IMedia> {
  return await models.Media.findOne({_id: id})
}
