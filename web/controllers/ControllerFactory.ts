import IBaseMongoResource from '../schemas/IBaseMongoResource';
import { IDevice } from '../schemas/device';
import { IUser } from '../schemas/user';
import { IResourceController } from './IResourceController';
import { MongoResourceRepository } from './MongoResourceRepository';

/**
 * Generate a controller for the type of database
 */
export default class ControllerFactory {

  /**
   * Determine database type and return fitting controller.
   * @param {string} resName
   * @returns {IResourceController<IBaseMongoResource | any>}
   */
  public static getController(resName: string): IResourceController<IBaseMongoResource | any> {
    switch (process.env.DB_TYPE) {
      case 'MONGO':
        return ControllerFactory.getMongoController(resName);
      default:
        return ControllerFactory.getMongoController(resName);
    }
  }

  /**
   * Determine table and return controller for that table.
   * @param {string} res
   * @returns {MongoResourceRepository<IBaseMongoResource>}
   */
  private static getMongoController(res: string): MongoResourceRepository<IBaseMongoResource> {
    let cont: MongoResourceRepository<IBaseMongoResource>;

    switch (res) {
      case 'user':
        cont = new MongoResourceRepository<IUser>();
        break;
      case 'device':
        cont = new MongoResourceRepository<IDevice>();
        break;
      default:
        cont = new MongoResourceRepository<IBaseMongoResource>();
        break;
    }

    cont.setTableName(res);
    return cont;
  }
}
