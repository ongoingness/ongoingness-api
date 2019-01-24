import { Router, Response, Request, NextFunction, Handler } from 'express';
import { Methods } from '../../methods';

/**
 * @apiDefine isAuthenticated
 * @apiHeader {String} x-access-token Users authentication token
 */

/**
 * Base router class. All routers extend this class.
 */
export abstract class BaseRouter {
  router: Router;
  fileUploadHandler: Handler;

  protected constructor() {
    this.router = Router();
  }

  /**
   * Add a route to the router.
   * @param {string} path
   * @param {Methods} method
   * @param handler
   */
  addRoute(
    path: string,
    method: Methods,
    handler: Handler) {
    switch (method) {
      case Methods.GET:
        this.router.get(path, handler);
        break;
      case Methods.POST:
        this.router.post(path, handler);
        break;
      case Methods.PUT:
        this.router.put(path, handler);
        break;
      case Methods.DELETE:
        this.router.delete(path, handler);
    }
  }

  /**
   * Return the router.
   * @returns {e.Router}
   */
  getRouter(): Router {
    return this.router;
  }

  /**
   * Add middleware to the router.
   * @param middleware
   */
  addMiddleware(middleware: Handler): void {
    this.router.use(middleware);
  }

  setFileUploadHandler(handler: Handler): void {
    this.fileUploadHandler = handler;
  }
}

/**
 * A router that handles a resource.
 * Should implement methods to:
 *  - Fetch
 *  - Fetch all
 *  - Update
 *  - Store
 *  - Destroy
 *  the resource it handles.
 */
export abstract class ResourceRouter extends BaseRouter {

  /**
   * Get the resource by id.
   * @param {e.Request} req
   * @param {e.Response} res
   * @param {e.NextFunction} next
   * @returns {Promise<void | e.Response>}
   */
  abstract index(req: Request, res: Response, next: NextFunction): Promise<void | Response> | void;

  /**
   * Store a resource
   * @param {e.Request} req
   * @param {e.Response} res
   * @param {e.NextFunction} next
   * @returns {Promise<void | e.Response> | void}
   */
  abstract store(req: Request, res: Response, next: NextFunction):
    Promise<void | Response> | void;

  /**
   * Update the resource
   * @param {e.Request} req
   * @param {e.Response} res
   * @param {e.NextFunction} next
   * @returns {Promise<void | e.Response>}
   */
  abstract update(req: Request, res: Response, next: NextFunction): Promise<void | Response> | void;

  /**
   * Destroy the resource
   * @param {e.Request} req
   * @param {e.Response} res
   * @param {e.NextFunction} next
   * @returns {Promise<void | e.Response>}
   */
  abstract destroy(req: Request, res: Response, next: NextFunction):
    Promise<void | Response> | void;

  /**
   * Show all resources.
   * @returns {Promise<void | e.Response>}
   * @param req
   * @param res
   * @param next
   */
  abstract show(req: Request, res: Response, next: NextFunction): Promise<void | Response> | void;

  /**
   * Setup router
   * Add all default routes to router.
   */
  addDefaultRoutes(): void {
    this.router.get('/:id', this.show);
    this.router.delete('/:id', this.destroy);
    this.router.post('/update', this.update);
    this.router.get('/', this.index);

    if (this.fileUploadHandler) {
      this.router.post('/', this.fileUploadHandler, this.store);
    } else {
      this.router.post('/', this.store);
    }
  }
}
