import ControllerFactory from '../repositories/RepositoryFactory';
import { IResourceRepository } from '../repositories/IResourceRepository';
import { IUser } from '../schemas/user';
import { UserRole } from '../UserRole';
import { NextFunction, Request, Response } from 'express';

/**
 * Verfiy a user's JWT token
 * @param {e.Request} req
 * @param {e.Response} res
 * @param {e.NextFunction} next
 */
export async function checkAdmin(req: Request,
                                 res: Response,
                                 next: NextFunction) {

  const userController: IResourceRepository<IUser> = ControllerFactory.getRepository('user');
  let user: IUser;
  if (res.locals.error) {
    if (!(res.locals.error === 403)) return next();
  }

  try {
    user = await userController.get(res.locals.user.id);
  } catch (e) {
    res.locals.customErrorMessage = e.message;
    res.locals.error = 500;
    return next();
  }

  if (user.role === UserRole.ADMIN) {
    res.locals.admin = UserRole.ADMIN;
  }

  return next();
}
