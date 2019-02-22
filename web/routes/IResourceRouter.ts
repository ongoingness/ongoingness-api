import { Handler, NextFunction, Request, Response, Router } from 'express';
import { IResourceController } from '../controllers/IResourceController';
import { HttpMethods } from '../HttpMethods';
import IBaseMongoResource from '../schemas/IBaseMongoResource';

export default interface IResourceRouter<T extends IBaseMongoResource> {
  store(req: Request, res: Response, next: NextFunction): Promise<void | Response> | void;
  index(req: Request, res: Response, next: NextFunction): Promise<void | Response> | void;
  show(req: Request, res: Response, next: NextFunction): Promise<void | Response> | void;
  search(req: Request, res: Response, next: NextFunction): Promise<void | Response> | void;
  paged(req: Request, res: Response, next: NextFunction): Promise<void | Response> | void;
  update(req: Request, res: Response, next: NextFunction): Promise<void | Response> | void;
  destroy(req: Request, res: Response, next: NextFunction): Promise<void | Response> | void;

  addDefaultRoutes(): void;
  addRoute(path: string, method: HttpMethods, handler: Handler): void;
  getRouter(): Router;
  setRouter(router: Router): void;

  setResourceController(cont: IResourceController<T>): void;

  checkForErrors(err: Response): Error;
  getUserId(res: Response): string;
  userHasPermission(userId: string, resourceId: string): Promise<boolean>;
}
