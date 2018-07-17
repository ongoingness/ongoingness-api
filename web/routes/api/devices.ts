import { Router, Response, Request, NextFunction } from 'express'
import checkToken from '../../middleware/authenticate'
import { IDevice } from '../../schemas/device'
import { IPair } from '../../schemas/pair'
import { Reply } from '../../reply'
import { Schema } from 'mongoose'
import models from '../../models'

let router: Router

const devices = () => {
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

    const owner: string = res.locals.user.id
    const mac: string = req.body.mac

    let device: IDevice

    try {
      // Try and store the device
      device = await models.Device.create({owner: owner, mac: mac})
    } catch (error) {
      // Error is probably a unique mac violation
      error.message = '400'
      return next(error)
    }

    return res.json(new Reply(200, 'success', false, device))
  })

  router.post('/pair', async (req: Request, res: Response, next: NextFunction) => {
    if (res.locals.error) {
      return next(new Error(`${res.locals.error}`))
    }

    const owner: string = res.locals.user.id
    const device1Id: Schema.Types.ObjectId = req.body.device1
    const device2Id: Schema.Types.ObjectId = req.body.device2

    // check devices and owner exist
    let device1: IDevice
    let device2: IDevice

    try {
      device1 = await models.Device.findOne({_id: device1Id})
      device2 = await models.Device.findOne({_id: device2Id})
    } catch (error) {
      error.message = '500'
      return next(error)
    }

    // throw 404 if devices or owner do not exist
    if (!(device1 && device2)) {
      return next(new Error('404'))
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
      return next(error)
    }

    return res.json(new Reply(200, 'success', false, pair))
  })

  router.delete('/destroy/:id', async (req: Request, res: Response, next: NextFunction) => {
    if (res.locals.error) {
      return next(new Error(`${res.locals.error}`))
    }

    const owner: Schema.Types.ObjectId = res.locals.user.id
    const deviceId: Schema.Types.ObjectId = req.params.id

    let device: IDevice
    try {
      device = await models.Device.findOne({_id: deviceId})
    } catch (error) {
      error.message = '500'
      return next(error)
    }

    // throw 404 if device not found
    if (!device) {
      return next(new Error('404'))
    }

    // throw 401 if user is not the device owner
    if (!(owner !== device.owner)) {
      return next(new Error('401'))
    }

    try {
      await models.Device.deleteOne({_id: device._id})
    } catch (error) {
      error.message = '500'
      return next(error)
    }

    return res.json(new Reply(200, 'sucess', false, ''))
  })

  return router
}

export default devices
