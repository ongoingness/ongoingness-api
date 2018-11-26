import { IUser } from '../schemas/user';
import * as crypto from 'crypto';
import models from '../models';
import { Schema } from 'mongoose';

/**
 * Store the user in a database
 * @param  username username
 * @param  password password
 * @return          IUser
 */
export async function storeUser(username: string, password: string): Promise<IUser> {
  let sUser: IUser;
  try {
    sUser = await models.User.findOne({ username });
  } catch (error) {
    error.message = '500';
    throw error;
  }

  if (sUser) {
    throw new Error('403');
  }

  let iv: string;
  const hash: crypto.Hash = crypto.createHash('sha256');
  iv = crypto.randomBytes(16).toString('hex');
  hash.update(`${iv}${password}`);
  const hashedPassword = hash.digest('hex');

  let user: IUser = null;

  try {
    user = await models.User.create({ username, iv, password: hashedPassword });
    user.devices = [];
    await user.save();
  } catch (error) {
    error.message = '500';
    throw error;
  }

  return user;
}

/**
 * Get a user by id
 * @param {string} id
 * @returns {Promise<IUser>}
 */
export async function getUser(id: Schema.Types.ObjectId): Promise<IUser> {
  return await models.User.findOne({ _id: id });
}

/**
 * Destroy a user record
 * @param {string} id
 * @returns {Promise<void>}
 */
export async function destroyUser(id: Schema.Types.ObjectId): Promise<void> {
  return await models.User.deleteOne({ _id: id });
}
