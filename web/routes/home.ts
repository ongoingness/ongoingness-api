import { NextFunction, Request, Response } from 'express';
import { BaseRouter } from './api/base';
import { Methods } from '../methods';

/**
 * Provide home routes.
 */
export class HomeRouter extends BaseRouter {
  constructor() {
    super();
    this.addRoute('/', Methods.GET, this.index);
  }

  /**
   * Display hello world.
   * @param {e.Request} req
   * @param {e.Response} res
   * @param {e.NextFunction} next
   * @returns {e.Response}
   */
  index(req: Request, res: Response, next: NextFunction): void {
    return res.redirect('/static/apidoc');
  }
}
