import { IUser } from '../../schemas/user';
import { Reply } from '../../reply';

import { checkToken } from '../../middleware/authenticate';
import { Request, Response, NextFunction, Router } from 'express';
import { UserController } from '../../controllers/user';
import { Schema } from 'mongoose';
import { ResourceRouter } from './base';

const userController: UserController = new UserController();

export class UserRouter extends ResourceRouter {
  async index(req: Request, res: Response, next: NextFunction) {
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

    return res.json(new Reply(200, 'success', false, { user }));
  }

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

  show(req: Request, res: Response, next: NextFunction): void {
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
    this.addDefaultRoutes();
  }
}
