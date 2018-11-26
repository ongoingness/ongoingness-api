import { IUser } from '../../schemas/user';
import { Reply } from '../../reply';

import { checkToken } from '../../middleware/authenticate';
import { Request, Response, NextFunction, Router } from 'express';
import { destroyUser, getUser } from '../../controllers/user';
import { Schema } from 'mongoose';

let router : Router;

export const userRouter = () => {
  router = Router();

  router.use(checkToken);

  router.get('/me', async (req: Request, res: Response, next: NextFunction) => {
    if (res.locals.error) {
      return next(new Error(`${res.locals.error}`));
    }
    const userId: Schema.Types.ObjectId = res.locals.user.id;
    let user: IUser;
    try {
      user = await getUser(userId);
    } catch (e) {
      e.message = '500';
      return next(e);
    }

    return res.json(new Reply(200, 'success', false, { user }));
  });

  router.delete('/destroy', async (req, res, next) => {
    if (res.locals.error) {
      return next(new Error(`${res.locals.error}`));
    }
    const userId: Schema.Types.ObjectId = res.locals.user.id;
    try {
      await destroyUser(userId);
    } catch (e) {
      e.message = '500';
      return next(e);
    }

    return res.json(new Reply(200, 'success', false, {}));
  });

  return router;
};
