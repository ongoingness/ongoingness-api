import { IUser } from '../schemas/user';
import * as crypto from 'crypto';
import * as jwt from 'jsonwebtoken';
import models from '../models';
import { IDevice } from '../schemas/device';
import { getDeviceMac } from './device';
import { getUser } from './user';

/**
 * Authenticate a user
 * @param  username username
 * @param  password password
 * @return {IUser} Matched user
 */
export async function authenticateUser(username: string, password: string): Promise<IUser> {
  let user: IUser;
  try {
    user = await models.User.findOne({ username });
  } catch (error) {
    throw error;
  }

  if (!user) {
    throw new Error('401');
  }

  // Hash given password with matching user's stored iv
  const hash: crypto.Hash = crypto.createHash('sha256');
  hash.update(`${user.iv}${password}`);
  const hashedPassword = hash.digest('hex');
  // Compare passwords and abort if no match
  if (user.password !== hashedPassword) {
    throw new Error('401');
  }

  return user;
}

/**
 * Create a JWT token for the user
 * @param  user IUser
 * @return
 */
export function generateToken(user: IUser): string {
  const payload = {
    id: user._id,
    username: user.username,
  };
  // create and sign token against the app secret
  const token: string = jwt.sign(payload, process.env.SECRET, {
    expiresIn: '1 day', // expires in 24 hours
  });

  return token;
}

/**
 * Retrieve user from a device address.
 * @param {string} mac
 * @returns {Promise<IUser>}
 */
export async function authenticateWithMAC(mac: string): Promise<IUser> {
  let user: IUser;
  let device: IDevice;

  device = await getDeviceMac(mac);

  if (!device) {
    throw new Error('404');
  }

  user = await getUser(device.owner);

  if (!user) {
    throw new Error('404');
  }

  return user;
}
