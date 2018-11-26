import { NextFunction, Request, Response, Router } from 'express';
let router;

/**
 * Get routes
 * @param  app Express.express
 * @return     Router
 */
function home(): Router {
  router = Router();
  router.get('/', (req: Request, res: Response, next: NextFunction) => {
    return res.send('Hello World');
  });

  return router;
}

export default home;
