import { NextFunction, Request, Response, Router } from 'express';
import { Reply } from '../../reply';
import { IUser } from '../../schemas/user';
import { UserController } from '../../controllers/user';
import { authenticateUser, authenticateWithMAC, generateToken } from '../../controllers/auth';
import { BaseRouter } from './base';
import { Methods } from '../../methods';

const userController: UserController = new UserController();

export class AuthRouter extends BaseRouter {
  constructor() {
    super();
    this.addRoute('/authenticate', Methods.POST, this.authenticateUser);
    this.addRoute('/register', Methods.POST, this.registerUser);
    this.addRoute('/mac', Methods.POST, this.authenticateWithMac);
  }

  async authenticateUser(req: Request, res: Response, next: NextFunction):
    Promise<Response | void> {
    // Get username and password from request
    const username: string = req.body.username;
    const password: string = req.body.password;

    let user: IUser;
    try {
      user = await authenticateUser(username, password);
    } catch (error) {
      return next(error);
    }

    const token = generateToken(user);

    const response = new Reply(200, 'success', false, { token });
    return res.json(response);
  }

  async authenticateWithMac(req: Request, res: Response, next: NextFunction):
    Promise<Response | void> {
    const mac: string = req.body.mac;
    let user: IUser;

    try {
      user = await authenticateWithMAC(mac);
    } catch (e) {
      return next(e);
    }

    const token = generateToken(user);

    return res.json(new Reply(200, 'success', false, token));
  }

  async registerUser(req: Request, res: Response, next: NextFunction): Promise<Response | void> {
    // Get username and password
    const username: string = req.body.username;
    const password: string = req.body.password;

    // abort if either username or password are null
    if (!username || !password) {
      const e: Error = new Error('400');
      return next(e);
    }

    let user: IUser;
    try {
      user = await userController.store({ username, password });
    } catch (error) {
      console.log(error);
      return next(error);
    }

    const token = generateToken(user);

    const response = new Reply(200, 'success', false, { user, token });
    return res.json(response);
  }
}

//export const authRouter = () => {
//  routes = Router();
//  routes.post('/register', async (req: Request, res: Response, next: NextFunction) => {
//    // Get username and password
//    const username: string = req.body.username;
//    const password: string = req.body.password;
//
//    // abort if either username or password are null
//    if (!username || !password) {
//      const e: Error = new Error('400');
//      return next(e);
//    }
//
//    let user: IUser;
//    try {
//      user = await userController.store({ username, password });
//    } catch (error) {
//      console.log(error);
//      return next(error);
//    }
//
//    const token = generateToken(user);
//
//    const response = new Reply(200, 'success', false, { user, token });
//    return res.json(response);
//  });
//
//  /**
//   * Authenticate a user and return a JWT token
//   * @type {Object}
//   */
//  routes.post('/authenticate', async (req: Request, res: Response, next: NextFunction) => {
//    // Get username and password from request
//    const username: string = req.body.username;
//    const password: string = req.body.password;
//
//    let user: IUser;
//    try {
//      user = await authenticateUser(username, password);
//    } catch (error) {
//      return next(error);
//    }
//
//    const token = generateToken(user);
//
//    const response = new Reply(200, 'success', false, { token });
//    return res.json(response);
//  });
//
//  /**
//   * Authenticate a user with a mac address.
//   */
//  routes.post('/mac', async (req: Request, res: Response, next: NextFunction) => {
//    const mac: string = req.body.mac;
//    let user: IUser;
//
//    try {
//      user = await authenticateWithMAC(mac);
//    } catch (e) {
//      return next(e);
//    }
//
//    const token = generateToken(user);
//
//    return res.json(new Reply(200, 'success', false, token));
//  });
//
//  return routes;
//};
