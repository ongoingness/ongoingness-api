import * as jwt from 'jsonwebtoken';
import * as express from 'express';
import { IUser } from '../schemas/User';

export function checkToken(req: express.Request,
                           res: express.Response,
                           next: express.NextFunction) {
  const token : string =
    req.body.token ||
    req.query.token ||
    req.headers['x-access-token'] ||
    req.params.token;

  if (token) {
    jwt.verify(token, process.env.SECRET, (err: Error, user: IUser) => {
      if (err) {
        res.locals.customErrorMessage = 'invalid token';
        res.locals.error = 401;
        next();
      } else {
        res.locals.user = user;
        return next();
      }
    });
  } else {
    res.locals.customErrorMessage = 'token not provided';
    res.locals.error = 401;
    next();
  }
}
