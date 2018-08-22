import {ISession} from "../schemas/session";
import models from "../models";
import {IMedia} from "../schemas/media";
import {IUser} from "../schemas/user";

/**
 * Create a session of the media currently being shown
 * @param {IUser} user
 * @param {IMedia} media
 * @returns {Promise<ISession>}
 */
export async function storeSession(user: IUser, media: IMedia): Promise<ISession> {
  // Only store present media
  if (media.era === 'past') {
    throw new Error('Media must be of the present to start a session')
  }
  return await models.Session.create({user: user._id, media: media._id})
}