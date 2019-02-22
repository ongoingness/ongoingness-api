import { IUser } from '../schemas/user';
import * as jwt from 'jsonwebtoken';
import models from '../models';
import { IDevice } from '../schemas/device';
import { IResourceRepository } from '../repositories/IResourceRepository';
import RepositoryFactory from '../repositories/RepositoryFactory';
import CryptoHelper from '../CryptoHelper';

const userRepository: IResourceRepository<IUser> = RepositoryFactory.getRepository('user');

export default class AuthController {
  /**
   * Authenticate a user
   * @param  username username
   * @param  password password
   * @return {IUser} Matched user
   */
  async authenticateUser(username: string, password: string): Promise<IUser> {
    let user: IUser;
    try {
      user = await models.User.findOne({ username });
    } catch (error) {
      throw error;
    }

    if (!user) {
      throw new Error('401');
    }

    const hashedPassword: string = CryptoHelper.hashString(password, user.iv);

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
  generateToken(user: IUser): string {
    const payload = {
      id: user._id,
      username: user.username,
    };
    // create and sign token against the app secret
    return jwt.sign(payload, process.env.SECRET, {
      expiresIn: '1 day', // expires in 24 hours
    });
  }

  /**
   * Retrieve user from a device address.
   * @param {string} mac
   * @returns {Promise<IUser>}
   */
  async authenticateWithMAC(mac: string): Promise<IUser> {
    const deviceRepository: IResourceRepository<IDevice> =
      RepositoryFactory.getRepository('device');
    let user: IUser;
    let device: IDevice;

    // device = await deviceRepository.getDeviceMac(mac);
    device = await deviceRepository.findOneWithFilter({ mac });

    if (!device) {
      throw new Error('404');
    }

    user = await userRepository.get(device.userId);

    if (!user) {
      throw new Error('404');
    }

    return user;
  }
}
