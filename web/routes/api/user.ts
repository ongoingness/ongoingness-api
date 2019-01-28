import { IUser } from '../../schemas/user';
import { Reply } from '../../reply';

import { checkToken } from '../../middleware/authenticate';
import { Request, Response, NextFunction } from 'express';
import { UserController } from '../../controllers/user';
import { Schema } from 'mongoose';
import { ResourceRouter } from './base';
import { Methods } from '../../methods';

const userController: UserController = new UserController();

/**
 * Router to manage the User resource
 */
export class UserRouter extends ResourceRouter {

  /**
   * @api {get} /api/user/:id Get the user
   * @apiGroup User
   * @apiPermission authenticated
   *
   * @apiUse isAuthenticated
   * @apiUse errorTokenNotProvided
   * @apiUse errorServerError
   * @apiUse errorResourceNotFound
   *
   * @apiExample {curl} Example usage:
   *     curl -i http://localhost:3000/api/user/5c111a7cb0796a120514cc0e
   *
   * @apiSuccessExample {json} Success-Response:
   *  HTTP/1.1 200 OK
   {
      "code": 200,
      "message": "success",
      "errors": false,
      "payload": {
        "user": {
          "devices": [],
          "media": [
              "media_link_1",
              "media_link_2"
          ],
          "_id": "user_id",
          "iv": "iv",
          "username": "test",
          "password": "hashed_password",
          "createdAt": "2018-12-12T14:26:04.632Z",
          "updatedAt": "2018-12-13T13:23:34.095Z",
          "__v": 2
        }
      }
    }
   *
   * @apiParam {String} id  User id.
   *
   * @apiDescription Get the user information.
   *
   * @param {e.Request} req
   * @param {e.Response} res
   * @param {e.NextFunction} next
   * @returns {Promise<any>}
   */
  async show(req: Request, res: Response, next: NextFunction) {
    if (res.locals.error) {
      return next(new Error(`${res.locals.error}`));
    }
    const userId: Schema.Types.ObjectId = res.locals.user.id;
    let user: IUser;
    try {
      user = await userController.get(userId);
    } catch (e) {
      e.message = '500';
      return next(e);
    }

    if (!user) return next(new Error('404'));

    return res.json(new Reply(200, 'success', false, { user }));
  }

  /**
   * **
   * @api {delete} /api/user/:id Destroy the user.
   * @apiGroup User
   * @apiPermission authenticated
   *
   * @apiUse isAuthenticated
   * @apiUse errorTokenNotProvided
   * @apiUse errorServerError
   * @apiUse errorResourceNotFound
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
   * @apiParam {String} id  User id.
   *
   * @apiDescription Destroy the user.
   *
   * @param {e.Request} req
   * @param {e.Response} res
   * @param {e.NextFunction} next
   * @returns {Promise<any>}
   */
  async destroy(req: Request, res: Response, next: NextFunction): Promise<void | Response> {
    if (res.locals.error) {
      return next(new Error(`${res.locals.error}`));
    }
    const userId: Schema.Types.ObjectId = res.locals.user.id;
    try {
      await userController.destroy(userId);
    } catch (e) {
      e.message = '500';
      return next(e);
    }

    return res.json(new Reply(200, 'success', false, {}));
  }

  index(req: Request, res: Response, next: NextFunction): void {
    return next(new Error('501'));
  }

  update(req: Request, res: Response, next: NextFunction): void {
    return next(new Error('501'));
  }

  store(req: Request, res: Response, next: NextFunction): void {
    return next(new Error('501'));
  }

  constructor() {
    super();
    this.addMiddleware(checkToken);
    this.addRoute('/me', Methods.GET, this.show);
    this.addDefaultRoutes();
  }
}
