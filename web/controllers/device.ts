import {IDevice} from "../schemas/device";
import models from "../models";
import {IPair} from "../schemas/pair";
import {Schema} from "mongoose";

export async function storeDevice(owner: string, mac: string): Promise<IDevice> {
  let device: IDevice
  try {
    device = await models.Device.create({owner: owner, mac: mac})
  } catch (e) {
    e.message = '400'
    throw e
  }

  return device
}

export async function getDevice(id: string): Promise<IDevice> {
  return await models.Device.findOne({_id: id})
}

export async function destroyDevice(id: string): Promise<IDevice> {
  return await models.Device.deleteOne({_id: id})
}

export async function createPair(owner: Schema.Types.ObjectId, device1Id: Schema.Types.ObjectId, device2Id: Schema.Types.ObjectId): Promise<IPair> {
  let device1: IDevice
  let device2: IDevice
  try {
    device1 = await models.Device.findOne({_id: device1Id})
    device2 = await models.Device.findOne({_id: device2Id})
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