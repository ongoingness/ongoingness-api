import { NextFunction, Request, Response } from 'express';
import { Reply } from '../../Reply';
import { IUser } from '../../schemas/User';
import AuthController from '../../controllers/AuthController';
import { BaseRouter } from '../BaseRouter';
import { HttpMethods as Methods } from '../../HttpMethods';
import CryptoHelper from '../../CryptoHelper';
import { IResourceRepository } from '../../repositories/IResourceRepository';
import RepositoryFactory from '../../repositories/RepositoryFactory';

const userRepository: IResourceRepository<IUser> = RepositoryFactory.getRepository('user');
const authController: AuthController = new AuthController();

export class AuthRouter extends BaseRouter {
  /**
   * Add routes to the Auth Router.
   */
  constructor() {
    super();
    this.addRoute('/authenticate', Methods.POST, this.authenticateUser);
    this.addRoute('/register', Methods.POST, this.registerUser);
    this.addRoute('/mac', Methods.POST, this.authenticateWithMac);
  }

  /**
   * @api {post} /api/authenticate Authenticate user.
   * @apiGroup Auth
   *
   * @apiParam {String} username  User's username
   * @apiParam {String} password  User's password
   *
   * @apiSuccessExample {json} Success-Response:
   *  HTTP/1.1 200 OK
   {
      "code": 200,
      "message": "success",
      "errors": false,
      "payload": {
        "token": "token"
      }
    }
   *
   * @apiDescription Authenticate user against username and password.
   * Return a JWT token.
   *
   * @param {e.Request} req
   * @param {e.Response} res
   * @param {e.NextFunction} next
   * @returns {Promise<e.Response | void>}
   */
  async authenticateUser(req: Request, res: Response, next: NextFunction):
    Promise<Response | void> {
    // Get username and password from request
    const username: string = req.body.username;
    const password: string = req.body.password;

    let user: IUser;
    try {
      user = await authController.authenticateUser(username, password);
    } catch (error) {
      return next(error);
    }

    const token = authController.generateToken(user);

    const response = new Reply(200, 'success', false, { token });
    return res.json(response);
  }

  /**
   * @api {post} /api/mac Authenticate user from MAC address.
   * @apiGroup Auth
   *
   * @apiParam {String} mac  MAC address of device registered to the user.
   *
   * @apiSuccessExample {json} Success-Response:
   *  HTTP/1.1 200 OK
   {
      "code": 200,
      "message": "success",
      "errors": false,
      "payload": {
        "token": "token"
      }
    }
   *
   * @apiDescription Authenticate the user against a MAC address of a device they have
   * registered to their account. Will return a JWT authentication token.
   *
   * @param {e.Request} req
   * @param {e.Response} res
   * @param {e.NextFunction} next
   * @returns {Promise<e.Response | void>}
   */
  async authenticateWithMac(req: Request, res: Response, next: NextFunction):
    Promise<Response | void> {
    const mac: string = req.body.mac;
    let user: IUser;

    try {
      user = await authController.authenticateWithMAC(mac);
    } catch (e) {
      return next(e);
    }

    const token = authController.generateToken(user);

    return res.json(new Reply(200, 'success', false, token));
  }

  /**
   * @api {post} /api/register Register a user.
   * @apiGroup Auth
   *
   * @apiParam {String} username  User's username
   * @apiParam {String} password  User's password
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
          "media": [],
          "_id": "user_id",
          "iv": "iv_string",
          "username": "user",
          "password": "hashed_password",
          "createdAt": "2018-12-12T16:13:59.352Z",
          "updatedAt": "2018-12-12T16:13:59.352Z",
          "__v": 0
        },
        "token": "token"
      }
    }
   *
   * @apiDescription Registers a user.
   * Returns a JWT token.
   *
   * @param {e.Request} req
   * @param {e.Response} res
   * @param {e.NextFunction} next
   * @returns {Promise<e.Response | void>}
   */
  async registerUser(req: Request, res: Response, next: NextFunction): Promise<Response | void> {
    // Get username and password
    const username: string = req.body.username;
    const password: string = req.body.password;
    let user: IUser;

    // abort if either username or password are null
    if (!username || !password) {
      const e: Error = new Error('400');
      return next(e);
    }

    const iv: string = CryptoHelper.getRandomString(16);
    const hash: string = CryptoHelper.hashString(password, iv);

    try {
      user = await userRepository.store({ username, password: hash, iv });
    } catch (error) {
      if (error.message.indexOf('duplicate key error') > -1) {
        return next(new Error('403'));
      }
      return next(error);
    }

    const token = authController.generateToken(user);

    const response = new Reply(200, 'success', false, { user, token });
    return res.json(response);
  }
}
