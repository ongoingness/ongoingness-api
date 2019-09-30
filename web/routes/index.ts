import { Express } from 'express';

import { AuthRouter } from './api/Auth';
import { MediaRouter } from './api/MediaRouter';
import RouterSchema from './RouterSchema';
import ResourceRouterFactory from './ResourceRouterFactory';
import { LogRouter } from './api/LogRouter';

/**
 * [use description]
 * @return       [description]
 * @param app
 */
export function addRoutes(app: Express): Express {
  app.use('/api/auth', new AuthRouter().getRouter());
  app.use('/api/media', new MediaRouter().getRouter());
  app.use('/api/log', new LogRouter().getRouter())

  routes.forEach((schema: RouterSchema) => {
    app.use(
      schema.route,
      ResourceRouterFactory.getResourceRouter(schema.table, schema.options).getRouter());
  });

  return app;
}

export default addRoutes;

export const routes: RouterSchema[] = [
  new RouterSchema({
    isOwned: true,
    isProtected: true,
  },
                   '/api/devices',
                   'device'),
  new RouterSchema({
    isOwned: false,
    isProtected: true,
  },
                   '/api/users',
                   'user'),
];

export function getSchema(route: string): RouterSchema {
  return routes.find((schema: RouterSchema) => route.indexOf(schema.route) > -1);
}
