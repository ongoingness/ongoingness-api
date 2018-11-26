import { Router, Response, Request, NextFunction } from 'express';
import { checkToken } from '../../middleware/authenticate';
import { IDevice } from '../../schemas/device';
import { IPair } from '../../schemas/pair';
import { Reply } from '../../reply';
import { Schema } from 'mongoose';
import { DeviceController } from '../../controllers/device';
import { IUser } from '../../schemas/user';
import { UserController } from '../../controllers/user';

const userController: UserController = new UserController();
const deviceController: DeviceController = new DeviceController();

let router: Router;

export const devicesRouter = () => {
  router = Router();
  router.use(checkToken);
  /**
   * Store a device
   * @param  '/add'    path
   * @param  async
   * @return
   */
  router.post('/add', async (req: Request, res: Response, next: NextFunction) => {
    // get the user id
    if (res.locals.error) {
      return next(new Error(`${res.locals.error}`));
    }

    let user: IUser;
    const mac: string = req.body.mac;
    let device: IDevice;

    try {
      user = await userController.get(res.locals.user.id);
    } catch (error) {
      error.message = '500';
      return next(error);
    }

    try {
      // Try and store the device
      device = await deviceController.store({ mac, owner: user._id });
    } catch (error) {
      // Error is probably a unique mac violation
      error.message = '401';
      return next(error);
    }

    return res.json(new Reply(200, 'success', false, device));
  });

  router.post('/pair', async (req: Request, res: Response, next: NextFunction) => {
    if (res.locals.error) {
      return next(new Error(`${res.locals.error}`));
    }

    const owner: Schema.Types.ObjectId = res.locals.user.id;
    const device1Id: Schema.Types.ObjectId = req.body.device1;
    const device2Id: Schema.Types.ObjectId = req.body.device2;

    let pair: IPair;
    try {
      pair = await deviceController.createPair(owner, device1Id, device2Id);
    } catch (error) {
      return next(error);
    }

    return res.json(new Reply(200, 'success', false, pair));
  });

  /**
   * Destroy a device
   */
  router.delete('/destroy/:id', async (req: Request, res: Response, next: NextFunction) => {
    if (res.locals.error) {
      return next(new Error(`${res.locals.error}`));
    }

    let user: IUser;
    let device: IDevice;
    const id: Schema.Types.ObjectId = req.params.id;
    try {
      user = await userController.get(res.locals.user.id);
      device = await deviceController.get(id);
    } catch (error) {
      error.message = '500';
      return next(error);
    }

    // throw 404 if device not found
    if (!device || !user) {
      return next(new Error('404'));
    }

    const deviceIdx = user.devices.findIndex((userDevice: Schema.Types.ObjectId) => {
      return userDevice.toString() === device._id.toString();
    });

    if (deviceIdx === -1) {
      return next(new Error('401'));
    }

    try {
      await deviceController.destroy(device._id);
    } catch (error) {
      error.message = '500';
      return next(error);
    }

    return res.json(new Reply(200, 'success', false, ''));
  });

  return router;
};
