import * as path from "path";
import * as fs from "fs";
import {IUser} from "../schemas/user";
import {IMedia} from "../schemas/media";
import models from "../models";
import {promisify} from "util";
import * as crypto from "crypto";

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
  return await models.Media.create({path: path, mimetype: mimetype, user: user._id})
}
