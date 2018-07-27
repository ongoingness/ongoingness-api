import {IDevice} from "../schemas/device";
import models from "../models";
import {IPair} from "../schemas/pair";
import {Schema} from "mongoose";
import {getUser} from "./user";
import {IUser} from "../schemas/user";

/**
 * Store a device
 * @param {string} owner
 * @param {string} mac
 * @returns {Promise<IDevice>}
 */
export async function storeDevice(owner: Schema.Types.ObjectId, mac: string): Promise<IDevice> {
  let device: IDevice
  try {
    device = await models.Device.create({owner: owner, mac: mac})
  } catch (e) {
    e.message = '400'
    throw e
  }

  // Update user's devices.
  const user: IUser = await getUser(owner)
  await user.devices.push(device._id)

  return device
}

/**
 * Get a device by id
 * @param {string} id
 * @returns {Promise<IDevice>}
 */
export async function getDevice(id: Schema.Types.ObjectId): Promise<IDevice> {
  return await models.Device.findOne({_id: id})
}

/**
 * Destroy a record of a device
 * @param owner
 * @param {string} id
 * @returns {Promise<IDevice>}
 */
export async function destroyDevice(owner: Schema.Types.ObjectId, id: Schema.Types.ObjectId): Promise<void> {
  const user = await getUser(owner)

  let deviceIdx: number = -1
  for (let i: number = 0; i < user.devices.length; i++) {
    if(user.devices[i] === id) {
      deviceIdx = i
    }
  }
  user.devices.splice(deviceIdx, 1)
  await user.save()

  await models.Device.deleteOne({_id: id})
}

/**
 * Create a pair of devices
 * @param {module:mongoose.Schema.Types.ObjectId} owner
 * @param {module:mongoose.Schema.Types.ObjectId} device1Id
 * @param {module:mongoose.Schema.Types.ObjectId} device2Id
 * @returns {Promise<IPair>}
 */
export async function createPair(owner: Schema.Types.ObjectId, device1Id: Schema.Types.ObjectId, device2Id: Schema.Types.ObjectId): Promise<IPair> {

  let device1: IDevice
  let device2: IDevice
  try {
    device1 = await getDevice(device1Id)
    device2 = await getDevice(device2Id)
  } catch (error) {
    error.message = '500'
    throw error
  }

  // throw 404 if devices or owner do not exist
  if (!(device1 && device2)) {
    throw new Error('404')
  }

  let pair: IPair
  try {
    pair = await models.Pair.create({
      owner: owner,
      device1: device1._id,
      device2: device2._id
    })
  }
  catch (error) {
    error.message = '500'
    throw error
  }

  return pair
}