import * as e from 'express';
import ControllerFactory from '../controllers/ControllerFactory';
import { IResourceController } from '../controllers/IResourceController';
import { HttpMethods } from '../HttpMethods';
import { checkToken } from '../middleware/authenticate';
import { Reply } from '../reply';
import IBaseMongoResource from '../schemas/IBaseMongoResource';
import { IUser } from '../schemas/user';
import { BaseRouter } from './BaseRouter';
import { getSchema } from './index';
import IResourceRouter from './IResourceRouter';
import RouterSchema from './RouterSchema';
import { userPermission } from '../middleware/UserPermission';
import { checkAdmin } from '../middleware/Admin';

export default class MongoResourceRouter<T extends IBaseMongoResource>
  extends BaseRouter
  implements IResourceRouter<IBaseMongoResource> {
  private readonly table: string;
  private readonly isProtected: boolean;
  private readonly isOwned: boolean;
  private resourceController: IResourceController<T>;
  private userController: IResourceController<IUser>;

  constructor(table: string, options: {isProtected: boolean, isOwned: boolean}) {
    super();
    this.table = table;
    this.isProtected = options.isProtected;
    this.isOwned = options.isOwned;

    if (this.isProtected) {
      this.addMiddleware(checkToken);
      this.addMiddleware(userPermission);
    }

    this.addMiddleware(checkAdmin);

    this.addDefaultRoutes();
    this.setResourceController(ControllerFactory.getController(this.table));

    if (this.isOwned) {
      this.userController = ControllerFactory.getController('user');
    }
  }

  public addDefaultRoutes(): void {
    this.addRoute('/:id', HttpMethods.GET, this.show);
    this.addRoute('/:id', HttpMethods.DELETE, this.destroy);
    this.addRoute('/:page/:limit', HttpMethods.GET, this.paged);
    this.addRoute('/search/:field/:term', HttpMethods.GET, this.search);
    this.addRoute('/update', HttpMethods.POST, this.update);
    this.addRoute('/', HttpMethods.POST, this.store);
    this.addRoute('/', HttpMethods.GET, this.index);
  }

  public async store(req: e.Request, res: e.Response, next: e.NextFunction): Promise<void | e.Response> {
    const routeSchema: RouterSchema = getSchema(req.originalUrl);
    const cont: IResourceController<T> = ControllerFactory.getController(routeSchema.table);
    const userId = res.locals.user.id;
    let resource: T;
    const data: any = {};
    const err: Error = BaseRouter.errorCheck(res);

    if (err) {
      return next(err);
    }

    Object.keys(req.body).forEach((key: string) => {
      data[key] = req.body[key];
    });

    if (routeSchema.options.isOwned) {
      data.userId = userId;
    }

    try {
      resource = await cont.store(data);
    } catch (e) {
      e.message = '500';
      return next(e);
    }

    return res.json(new Reply(200, 'success', false, resource));
  }

  public async destroy(req: e.Request, res: e.Response, next: e.NextFunction): Promise<void | e.Response> {
    const id: string = req.params.id;
    const routeSchema: RouterSchema = getSchema(req.originalUrl);
    const cont: IResourceController<T> = ControllerFactory.getController(routeSchema.table);
    const err: Error = BaseRouter.errorCheck(res);

    if (err) { return next(err); }

    try {
      await cont.destroy(id);
      if (routeSchema.options.isOwned) {
        // remove from user.
      }
    } catch (e) {
      return next(e);
    }

    return res.json(new Reply(200, 'success', false, {}));
  }

  public async index(req: e.Request, res: e.Response, next: e.NextFunction): Promise<void | e.Response> {
    const routeSchema: RouterSchema = getSchema(req.originalUrl);
    const cont: IResourceController<T> = ControllerFactory.getController(routeSchema.table);
    const err: Error = BaseRouter.errorCheck(res);
    let resources: T[];
    const q: any = req.query;
    const filter: any = {};

    Object.keys(q).forEach((key: string) => {
      filter[key] = q[key];
    });

    if (err) { return next(err); }

    try {
      if (res.locals.admin) {
        resources = await cont.getAll();
      } else {
        filter.userId = res.locals.user.id;
        resources = await cont.findManyWithFilter(filter);
      }

    } catch (e) {
      e.message = '500';
      return next(e);
    }

    return res.json(new Reply(200, 'success', false, resources));
  }

  public async paged(req: e.Request, res: e.Response, next: e.NextFunction): Promise<void | e.Response> {
    const routeSchema: RouterSchema = getSchema(req.originalUrl);
    const cont: IResourceController<T> = ControllerFactory.getController(routeSchema.table);
    const err: Error = BaseRouter.errorCheck(res);
    const page: number = parseInt(req.params.page, 10) || 0;
    const size: number = parseInt(req.params.limit, 10) || 0;
    const q: any = req.query;
    const filter: any = {};
    let count: number = 0;
    let skip: number = (page - 1) * size || 0;
    let resources: T[];

    if (skip < 0) { skip = 0; }

    Object.keys(q).forEach((key: string) => {
      filter[key] = q[key];
    });

    if (isNaN(page) || isNaN(size)) { return next(new Error('400')); }

    if (err) { return next(err); }

    try {
      if (res.locals.admin) {
        resources = await cont.findManyWithFilter(filter);
      } else {
        filter.userId = res.locals.user.id;
        resources = await cont.findManyWithFilter(filter , { skip, limit: size });
      }

      count = await cont.getCount(filter);

    } catch (e) {
      e.message = '500';
      return next(e);
    }

    return res.json(new Reply(200, 'success', false, { count, resources }));
  }

  public async show(req: e.Request, res: e.Response, next: e.NextFunction): Promise<void | e.Response> {
    let resource: T;
    const id: string = req.params.id;
    const routeSchema: RouterSchema = getSchema(req.originalUrl);
    const cont: IResourceController<T> = ControllerFactory.getController(routeSchema.table);
    const err: Error = BaseRouter.errorCheck(res);

    console.log(`In SHOW for: ${routeSchema.table}, getting resource: ${id}`);

    if (err) {
      if (err.message === '403') {
        if (!res.locals.admin) {
          return next(err);
        }
      } else {
        return next(err);
      }
    }

    try {
      resource = await cont.get(id);
    } catch (e) {
      e.message = '500';
      return next(e);
    }

    if (!resource) {
      return next(new Error('404'));
    }

    return res.json(new Reply(200, 'success', false, resource));
  }

  public async search(req: e.Request, res: e.Response, next: e.NextFunction): Promise<void | e.Response> {
    let resources: T[];
    const routeSchema: RouterSchema = getSchema(req.originalUrl);
    const cont: IResourceController<T> = ControllerFactory.getController(routeSchema.table);
    const err: Error = BaseRouter.errorCheck(res);
    const field = req.params.field;
    const term = req.params.term;
    const filter: any = {
      userId: res.locals.user.id,
    };

    filter[field] = { $regex: `${term}` };

    if (err) {
      if (err.message === '403') {
        if (!res.locals.admin) {
          return next(err);
        }
      } else {
        return next(err);
      }
    }

    try {
      resources = await cont.findManyWithFilter(filter);
    } catch (e) {
      e.message = '500';
      return next(e);
    }

    return res.json(new Reply(200, 'success', false, resources));
  }

  public async update(req: e.Request, res: e.Response, next: e.NextFunction): Promise<void | e.Response> {
    const routeSchema: RouterSchema = getSchema(req.originalUrl);
    const cont: IResourceController<T> = ControllerFactory.getController(routeSchema.table);
    let resource: T;
    const data: any = {};
    const err: Error = BaseRouter.errorCheck(res);

    if (err) {
      if (err.message === '403') {
        if (!res.locals.admin) {
          return next(err);
        }
      } else {
        return next(err);
      }
    }

    Object.keys(req.body).forEach((key: string) => {
      if (key === '_id') { return; }
      data[key] = req.body[key];
    });

    try {
      resource = await cont.edit(req.body.id || req.body._id, data);
    } catch (e) {
      e.message = '500';
      return next(e);
    }

    return res.json(new Reply(200, 'success', false, resource));
  }

  public setResourceController(cont: IResourceController<T>): void {
    this.resourceController = cont;
  }

  public checkForErrors(res: e.Response): Error {
    console.log('CHECKING FOR ERRORS');
    if (!this.isProtected) { return null; }

    if (res.locals.error) {
      return new Error(`${res.locals.error}`);
    }
    return null;
  }

  public getUserId(res: e.Response): string {
    if (!this.isOwned) { return null; }
    return res.locals.user.id;
  }

  public async userHasPermission(userId: string, id: string): Promise<boolean> {
    if (!this.isOwned) {
      return true;
    }

    const res: T = await this.resourceController.get(id);
    if (res.getUserId()) {
      return res.getUserId().toString() === userId;
    }

    return res._id.toString() === id;
  }
}
