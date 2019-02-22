import { ISession } from '../schemas/session';
import models from '../Models';
import { IMedia } from '../schemas/Media';
import { IResourceRepository } from './IResourceRepository';
import { Schema } from 'mongoose';

export class SessionRepository implements IResourceRepository<ISession> {
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

  findManyWithFilter(filter: {}, options?: { limit: number; skip: number }): Promise<ISession[]> {
    return undefined;
  }

  findOneWithFilter(filter: {}): Promise<ISession> {
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
