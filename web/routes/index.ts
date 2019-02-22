import { Express } from 'express';

import { AuthRouter } from './api/auth';
import { UserRouter } from './api/user';
import { DeviceRouter } from './api/devices';
import { MediaRouter } from './api/media';
import RouterSchema from './RouterSchema';
import ResourceRouterFactory from './ResourceRouterFactory';

/**
 * [use description]
 * @return       [description]
 * @param app
 */
export function addRoutes(app: Express): Express {
  app.use('/api/auth', new AuthRouter().getRouter());
  //app.use('/api/user', new UserRouter().getRouter());
  app.use('/api/devices', new DeviceRouter().getRouter());
  app.use('/api/media', new MediaRouter().getRouter());

  routes.forEach((schema: RouterSchema) => {
    app.use(schema.route, ResourceRouterFactory.getResourceRouter(schema.table, schema.options).getRouter());
  });

  return app;
}

export default addRoutes;

export const routes: RouterSchema[] = [
  new RouterSchema({
    isOwned: true,
    isProtected: true,
  },
                   '/api/device',
                   'device'),
  new RouterSchema({
    isOwned: false,
    isProtected: true,
  },
                   '/api/user',
                   'user'),
];

export function getSchema(route: string): RouterSchema {
  return routes.find((schema: RouterSchema) => route.indexOf(schema.route) > -1);
}
