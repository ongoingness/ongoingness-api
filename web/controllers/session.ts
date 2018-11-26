import { ISession } from '../schemas/session';
import models from '../models';
import { IMedia } from '../schemas/media';
import { IUser } from '../schemas/user';
import { ResourceController } from './resource-controller';
import { Schema } from 'mongoose';

export class SessionController implements ResourceController<ISession> {
  /**
   * Destroy a session
   * TODO: Implement
   * @param {Schema.Types.ObjectId} id
   * @returns {Promise<void>}
   */
  destroy(id: Schema.Types.ObjectId): Promise<void> {
    return undefined;
  }

  /**
   * Edit a session
   * TODO: Implement
   * @param {Schema.Types.ObjectId} id
   * @param data
   * @returns {Promise<ISession>}
   */
  edit(id: Schema.Types.ObjectId, data: any): Promise<ISession> {
    return undefined;
  }

  /**
   * Get a session
   * TODO: Implement
   * @param {Schema.Types.ObjectId} id
   * @returns {Promise<ISession>}
   */
  get(id: Schema.Types.ObjectId): Promise<ISession> {
    return undefined;
  }

  /**
   * Get the last session
   * @param {IUser} user
   * @returns {Promise<ISession>}
   */
  async getLastSession(user: IUser): Promise<ISession> {
    return await models.Session.findOne({ user: user._id }).sort({ createdAt: -1 });
  }

  /**
   * Get all sessions
   * TODO: Implement
   * @returns {Promise<ISession[]>}
   */
  getAll(): Promise<ISession[]> {
    return undefined;
  }

  /**
   * Store a session
   * @param {{user: Schema.Types.ObjectId; media: IMedia}} data
   * @returns {Promise<ISession>}
   */
  async store(data: { user: Schema.Types.ObjectId, media: IMedia }): Promise<ISession> {
    if (data.media.era === 'past') {
      throw new Error('Media must be of the present to start a session');
    }
    return await models.Session.create({ user: data.user, media: data.media._id });
  }
}
