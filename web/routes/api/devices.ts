import { Router, Response, Request, NextFunction } from 'express'
import checkToken from '../../middleware/authenticate'
import { IDevice } from '../../schemas/device'
import { IPair } from '../../schemas/pair'
import { Reply } from '../../reply'
import { Schema } from 'mongoose'
import {createPair, destroyDevice, getDevice, storeDevice} from "../../controllers/device";
import {IUser} from "../../schemas/user";
import {getUser} from "../../controllers/user";

let router: Router

export const devicesRouter = () => {
  router = Router()
  router.use(checkToken)
  /**
   * Store a device
   * @param  '/add'    path
   * @param  async
   * @return
   */
  router.post('/add', async (req: Request, res: Response, next: NextFunction) => {
    // get the user id
    if (res.locals.error) {
      return next(new Error(`${res.locals.error}`))
    }

    let user: IUser
    try {
      user = await getUser(res.locals.user.id)
    } catch(error) {
      error.message = '500'
      return next(error)
    }

    const mac: string = req.body.mac

    let device: IDevice

    try {
      // Try and store the device
      device = await storeDevice(user._id, mac)
    } catch (error) {
      // Error is probably a unique mac violation
      error.message = '400'
      return next(error)
    }

    user.devices.push(device._id)
    await user.save()

    return res.json(new Reply(200, 'success', false, device))
  })

  router.post('/pair', async (req: Request, res: Response, next: NextFunction) => {
    if (res.locals.error) {
      return next(new Error(`${res.locals.error}`))
    }

    const owner: Schema.Types.ObjectId = res.locals.user.id
    const device1Id: Schema.Types.ObjectId = req.body.device1
    const device2Id: Schema.Types.ObjectId = req.body.device2

    let pair: IPair
    try {
      pair = await createPair(owner, device1Id, device2Id)
    } catch(error) {
      return next(error)
    }

    return res.json(new Reply(200, 'success', false, pair))
  })

  /**
   * Destroy a device
   */
  router.delete('/destroy/:id', async (req: Request, res: Response, next: NextFunction) => {
    if (res.locals.error) {
      return next(new Error(`${res.locals.error}`))
    }

    let user: IUser
    try {
      user = await getUser(res.locals.user.id)
    } catch(error) {
      error.message = '500'
      return next(error)
    }

    let device: IDevice
    try {
      device = await getDevice(req.params.id)
    } catch (error) {
      error.message = '500'
      return next(error)
    }

    // throw 404 if device not found
    if (!device) {
      return next(new Error('404'))
    }

    let deviceIdx: number = -1
    for (let i = 0; i < user.devices.length; i++) {
      if (user.devices[i] === device._id) {
        deviceIdx = i
      }
    }

    if (deviceIdx > 0) {
      user.devices.splice(deviceIdx, 1)
    }
    await user.save()

    // throw 401 if user is not the device owner
    if (!(user._id !== device.owner)) {
      return next(new Error('401'))
    }

    try {
      await destroyDevice(user._id, device._id)
    } catch (error) {
      error.message = '500'
      return next(error)
    }

    return res.json(new Reply(200, 'success', false, ''))
  })

  return router
}
