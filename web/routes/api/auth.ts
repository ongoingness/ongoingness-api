import { Router, Response, Request, NextFunction } from 'express';
import { Reply } from '../../reply';
import { IUser } from '../../schemas/user';
import { UserController } from '../../controllers/user';
import { generateToken, authenticateUser, authenticateWithMAC } from '../../controllers/auth';

const userController: UserController = new UserController();
let routes: Router;

export const authRouter = () => {
  routes = Router();
  routes.post('/register', async (req: Request, res: Response, next: NextFunction) => {
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
  });

  /**
   * Authenticate a user and return a JWT token
   * @type {Object}
   */
  routes.post('/authenticate', async (req: Request, res: Response, next: NextFunction) => {
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
  });

  /**
   * Authenticate a user with a mac address.
   */
  routes.post('/mac', async (req: Request, res: Response, next: NextFunction) => {
    const mac: string = req.body.mac;
    let user: IUser;

    try {
      user = await authenticateWithMAC(mac);
    } catch (e) {
      return next(e);
    }

    const token = generateToken(user);

    return res.json(new Reply(200, 'success', false, token));
  });

  return routes;
};
