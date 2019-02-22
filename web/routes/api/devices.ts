import { Response, Request, NextFunction } from 'express';
import { checkToken } from '../../middleware/authenticate';
import { IDevice } from '../../schemas/device';
import { IPair } from '../../schemas/pair';
import { Reply } from '../../reply';
import { Schema } from 'mongoose';
import { DeviceController } from '../../controllers/device';
import { IUser } from '../../schemas/user';
import { UserController } from '../../controllers/user';
import { ResourceRouter } from './base';
import { HttpMethods } from '../../HttpMethods';

const userController: UserController = new UserController();
const deviceController: DeviceController = new DeviceController();

/**
 * Device router.
 * Holds routes for manipulating devices.
 */
export class DeviceRouter extends ResourceRouter {
  /**
   * @api {delete} /api/devices/:id Destroy a device.
   * @apiGroup Devices
   * @apiPermission authenticated
   *
   * @apiUse isAuthenticated
   * @apiUse errorTokenNotProvided
   * @apiUse errorResourceNotFound
   * @apiUse errorServerError
   *
   * @apiParam {String} id  Device id.
   *
   * @apiSuccessExample {json} Success-Response:
   *  HTTP/1.1 200 OK
   {
      "code": 200,
      "message": "success",
      "errors": false,
      "payload": {}
    }
   *
   * @apiDescription Destroy a device registered to a user.
   *
   * @param {e.Request} req
   * @param {e.Response} res
   * @param {e.NextFunction} next
   * @returns {Promise<void | e.Response>}
   */
  async destroy(req: Request, res: Response, next: NextFunction): Promise<void | Response> {
    if (res.locals.error) {
      return next(new Error(`${res.locals.error}`));
    }

    let user: IUser;
    let device: IDevice;
    try {
      user = await userController.get(res.locals.user.id);
      device = await deviceController.get(req.params.id);
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
  }

  show(req: Request, res: Response, next: NextFunction): Promise<void | Response> | void {
    return next(new Error('501'));
  }

  index(req: Request, res: Response, next: NextFunction): Promise<void | Response> | void {
    return next(new Error('501'));
  }

  update(req: Request, res: Response, next: NextFunction): Promise<void | Response> | void {
    return next(new Error('501'));
  }

  /**
   * @api {post} /api/devices/ Store a device.
   * @apiGroup Devices
   * @apiPermission authenticated
   *
   * @apiUse isAuthenticated
   * @apiUse errorTokenNotProvided
   * @apiUse errorServerError
   * @apiUse errorResourceExists
   *
   * @apiParam {String} mac  Device MAC address
   *
   * @apiSuccessExample {json} Success-Response:
   *  HTTP/1.1 200 OK
   {
      "code": 200,
      "message": "success",
      "errors": false,
      "payload": {
          "_id": "resource_id",
          "owner": "user_id",
          "mac": "mac_address",
          "createdAt": "2018-12-12T17:22:33.847Z",
          "updatedAt": "2018-12-12T17:22:33.847Z",
          "__v": 0
      }
    }
   *
   * @apiDescription Register a device to the user.
   *
   * @param {e.Request} req
   * @param {e.Response} res
   * @param {e.NextFunction} next
   * @returns {Promise<void | e.Response>}
   */
  async store(req: Request, res: Response, next: NextFunction): Promise<void | Response> {
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
  }

  /**
   * @api {post} /api/devices/pair Pair two devices
   * @apiGroup Devices
   * @apiPermission authenticated
   *
   * @apiUse isAuthenticated
   * @apiUse errorTokenNotProvided
   * @apiUse errorServerError
   *
   * @apiParam {String} id  Device id.
   *
   * @apiSuccessExample {json} Success-Response:
   *  HTTP/1.1 200 OK
   {
      "code": 200,
      "message": "success",
      "errors": false,
      "payload": {}
    }
   *
   * @apiDescription Link two devices together
   *
   * @param {e.Request} req
   * @param {e.Response} res
   * @param {e.NextFunction} next
   * @returns {Promise<void | e.Response>}
   */
  async pair(req: Request, res: Response, next: NextFunction): Promise<void | Response> {
    if (res.locals.error) {
      return next(new Error(`${res.locals.error}`));
    }

    // TODO: check devices exist before pairing.
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
  }

  constructor() {
    super();
    this.addMiddleware(checkToken);
    this.addDefaultRoutes();
    this.addRoute('/pair', HttpMethods.POST, this.pair);
  }
}
