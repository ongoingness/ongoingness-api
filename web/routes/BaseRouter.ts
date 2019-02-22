import { Handler, Router, Response } from 'express';
import { HttpMethods } from '../HttpMethods';

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
    method: HttpMethods,
    handler: Handler) {
    switch (method) {
      case HttpMethods.GET:
        this.router.get(path, handler);
        break;
      case HttpMethods.POST:
        this.router.post(path, handler);
        break;
      case HttpMethods.PUT:
        this.router.put(path, handler);
        break;
      case HttpMethods.DELETE:
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

  setFileUploadHandler(handler: Handler): void {
    this.fileUploadHandler = handler;
  }

  /**
   * Add middleware to the router.
   * @param middleware
   */
  public addMiddleware(middleware: Handler): void {
    this.router.use(middleware);
  }

  public static errorCheck(res: Response): Error {
    if (res.locals.error) {
      return new Error(`${res.locals.error}`);
    }
    return null;
  }
}
