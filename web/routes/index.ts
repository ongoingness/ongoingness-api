import { Express } from 'express';

import home from './home';
import { authRouter } from './api/auth';
import { userRouter } from './api/user';
import { devicesRouter } from './api/devices';
import { mediaRouter } from './api/media';

/**
 * [use description]
 * @return       [description]
 * @param app
 */
export function addRoutes(app: Express): Express {
  app.use('/', home());
  app.use('/api/auth', authRouter());
  app.use('/api/user', userRouter());
  app.use('/api/devices', devicesRouter());
  app.use('/api/media', mediaRouter());
  return app;
}
