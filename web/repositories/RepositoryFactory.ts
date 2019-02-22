import IBaseMongoResource from '../schemas/IBaseMongoResource';
import { IDevice } from '../schemas/device';
import { IUser } from '../schemas/user';
import { IResourceRepository } from './IResourceRepository';
import { MongoResourceRepository } from './MongoResourceRepository';

/**
 * Generate a controller for the type of database
 */
export default class RepositoryFactory {

  /**
   * Determine database type and return fitting controller.
   * @param {string} resName
   * @returns {IResourceRepository<IBaseMongoResource | any>}
   */
  public static getRepository(resName: string): IResourceRepository<IBaseMongoResource | any> {
    switch (process.env.DB_TYPE) {
      case 'MONGO':
        return RepositoryFactory.getMongoRepository(resName);
      default:
        return RepositoryFactory.getMongoRepository(resName);
    }
  }

  /**
   * Determine table and return controller for that table.
   * @param {string} res
   * @returns {MongoResourceRepository<IBaseMongoResource>}
   */
  private static getMongoRepository(res: string): MongoResourceRepository<IBaseMongoResource> {
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
