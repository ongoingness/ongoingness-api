import { ISession } from '../schemas/session';
import models from '../models';
import { IMedia } from '../schemas/media';
import { IResourceController } from './base';
import { Schema } from 'mongoose';

export class SessionController implements IResourceController<ISession> {
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
