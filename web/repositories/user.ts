import { IUser } from '../schemas/user';
import * as crypto from 'crypto';
import models from '../models';
import { Schema } from 'mongoose';
import { IResourceRepository } from './IResourceRepository';

export class UserController implements IResourceRepository<IUser> {
  /**
   * Delete a user
   * @param {Schema.Types.ObjectId} id
   * @returns {Promise<void>}
   */
  async destroy(id: Schema.Types.ObjectId): Promise<void> {
    await models.User.deleteOne({ _id: id });
  }

  edit(id: Schema.Types.ObjectId, data: any): Promise<IUser> {
    return undefined;
  }

  /**
   * Get a user.
   * @param {Schema.Types.ObjectId} id
   * @returns {Promise<IUser>}
   */
  async get(id: Schema.Types.ObjectId): Promise<IUser> {
    return await models.User.findOne({ _id: id });
  }

  getAll(): Promise<IUser[]> {
    return undefined;
  }

  /**
   * Store the user.
   * @param {{username: string; password: string}} data
   * @returns {Promise<IUser>}
   */
  async store(data: { username: string, password: string }): Promise<IUser> {
    let sUser: IUser;
    try {
      sUser = await models.User.findOne({ username: data.username });
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
    hash.update(`${iv}${data.password}`);
    const hashedPassword = hash.digest('hex');

    let user: IUser = null;

    try {
      user = await models.User.create({ iv, username: data.username, password: hashedPassword });
      user.devices = [];
      await user.save();
    } catch (error) {
      error.message = '500';
      throw error;
    }

    return user;
  }

  findManyWithFilter(filter: {}, options?: { limit: number; skip: number }): Promise<IUser[]> {
    return undefined;
  }

  findOneWithFilter(filter: {}): Promise<IUser> {
    return undefined;
  }

  getCount(filter: {}): Promise<number> {
    return undefined;
  }

  getTableName(): string {
    return '';
  }

  setTableName(table: string): void {
  }
}
