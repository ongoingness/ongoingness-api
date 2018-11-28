import { IDevice } from '../schemas/device';
import models from '../models';
import { IPair } from '../schemas/pair';
import { Schema } from 'mongoose';
import { UserController } from './user';
import { IUser } from '../schemas/user';
import { IResourceController } from './base';

export class DeviceController implements IResourceController<IDevice> {
  userController: UserController = new UserController();

  /**
   * Edit a device
   * @param {Schema.Types.ObjectId} id
   * @param data
   * @returns {Promise<IDevice>}
   */
  async edit(id: Schema.Types.ObjectId, data: any): Promise<IDevice> {
    return undefined;
  }

  /**
   * Get a device by id.
   * @param {Schema.Types.ObjectId} id
   * @returns {Promise<IDevice>}
   */
  async get(id: Schema.Types.ObjectId): Promise<IDevice> {
    return await models.Device.findOne({ _id: id });
  }

  /**
   * Get a device by mac address
   * @param {string} mac
   * @returns {Promise<IDevice>}
   */
  async getDeviceMac(mac: string): Promise<IDevice> {
    return await models.Device.findOne({ mac });
  }

  /**
   * Get all devices.
   * TODO: Implement
   * @returns {Promise<IDevice[]>}
   */
  async getAll(): Promise<IDevice[]> {
    return undefined;
  }

  /**
   * Store a device.
   * @param {{owner: Schema.Types.ObjectId; mac: string}} data
   * @returns {Promise<IDevice>}
   */
  async store(data: { owner: Schema.Types.ObjectId, mac: string }): Promise<IDevice> {
    let device: IDevice;
    try {
      device = await models.Device.create({ owner: data.owner, mac: data.mac });
    } catch (e) {
      e.message = '400';
      throw e;
    }

    // Update user's devices.
    const user: IUser = await this.userController.get(data.owner);
    user.devices.push(device._id);
    await user.save();

    return device;
  }

  /**
   * Create a pair of linked devices.
   * TODO: Remove
   * @param {Schema.Types.ObjectId} owner
   * @param {Schema.Types.ObjectId} device1Id
   * @param {Schema.Types.ObjectId} device2Id
   * @returns {Promise<IPair>}
   */
  async createPair(owner: Schema.Types.ObjectId, device1Id: Schema.Types.ObjectId,
                   device2Id: Schema.Types.ObjectId): Promise<IPair> {

    let device1: IDevice;
    let device2: IDevice;
    try {
      device1 = await this.get(device1Id);
      device2 = await this.get(device2Id);
    } catch (error) {
      error.message = '500';
      throw error;
    }

    // throw 404 if devices or owner do not exist
    if (!(device1 && device2)) {
      throw new Error('404');
    }

    let pair: IPair;
    try {
      pair = await models.Pair.create({
        owner,
        device1: device1._id,
        device2: device2._id,
      });
    } catch (error) {
      error.message = '500';
      throw error;
    }

    return pair;
  }

  /**
   * Destroy a device.
   * @param {Schema.Types.ObjectId} id
   * @returns {Promise<void>}
   */
  async destroy(id: Schema.Types.ObjectId): Promise<void> {
    let device: IDevice;
    let user: IUser;

    try {
      device = await this.get(id);
      user = await this.userController.get(device.owner);
    } catch (e) {
      e.message = '404';
      throw e;
    }

    if (user) {
      const deviceIdx = user.devices.findIndex((userDevice: Schema.Types.ObjectId) => {
        return userDevice.toString() === device._id.toString();
      });

      if (deviceIdx > -1) {
        user.devices.splice(deviceIdx, 1);
        await user.save();
      }
    }

    await models.Device.deleteOne({ _id: device._id });
  }
}
