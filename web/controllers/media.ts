import * as path from "path"
import * as fs from "fs"
import {IUser} from "../schemas/user"
import {IMedia} from "../schemas/media"
import models from "../models"
import {promisify} from "util"
import * as crypto from "crypto"
import {Schema} from "mongoose";

const rename = promisify(fs.rename)
const unlink = promisify(fs.unlink)

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
 * @param {string?} era
 * @returns {Promise<IMedia>}
 */
export async function storeMediaRecord(path: string, mimetype: string, user: IUser, era?: string): Promise<IMedia> {
  const media: IMedia = await models.Media.create({path: path, mimetype: mimetype, user: user._id, era: era})

  user.media.push(media._id)
  await user.save()

  return media
}

/**
 * Get a media record by id
 * @param {Schema.Types.ObjectId} id
 * @returns {Promise<IMedia>}
 */
export async function getMediaRecord(id: Schema.Types.ObjectId): Promise<IMedia> {
  return await models.Media.findOne({_id: id})
}

/**
 * Return a random item of media
 * @param {Schema.Types.ObjectId} id
 * @returns {Promise<IMedia>}
 */
export async function getRandomPresentMedia(id: Schema.Types.ObjectId): Promise<IMedia> {
  const allMedia: IMedia[] = await models.Media.find({user: id, era: 'present'})
  return allMedia[Math.floor(Math.random() * allMedia.length)]
}

/**
 * Get an item of linked media from media
 * @param {Schema.Types.ObjectId} id
 * @returns {Promise<IMedia>}
 */
export async function getLinkedPastMedia(id: Schema.Types.ObjectId): Promise<IMedia> {
  const media = await getMedia(id)

  if (!media) throw new Error('404')
  if (media.links.length === 0) return null

  return await getMedia(media.links[Math.floor(Math.random() * media.links.length)])
}

/**
 * Return a record of a media item
 * @param {module:mongoose.Schema.Types.ObjectId} id
 * @returns {Promise<IMedia>}
 */
export async function getMedia(id: Schema.Types.ObjectId): Promise<IMedia> {
  return await models.Media.findOne({_id: id})
}

/**
 * Destroy a media record and associated media
 * @param {Schema.Types.ObjectId} id
 * @returns {Promise<void>}
 */
export async function destroyMedia(id: Schema.Types.ObjectId): Promise<void> {
  const media: IMedia = await getMedia(id)
  if (fs.existsSync(media.path)) {
    console.log('removing media', media.path)
    await unlink(media.path)
  }

  await models.Media.deleteOne({_id: id})
}
