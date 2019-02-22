import IBaseMongoResource from '../schemas/IBaseMongoResource';
import IResourceRouter from './IResourceRouter';
import MongoResourceRouter from './MongoResourceRouter';

export default class ResourceRouterFactory {
  public static getResourceRouter(table: string, options: {isProtected: boolean, isOwned: boolean}):
    IResourceRouter<IBaseMongoResource | any> {
    switch (process.env.DB_TYPE) {
      case 'MONGO':
        return ResourceRouterFactory.getMongoResourceRouter(table, options);
      default:
        return ResourceRouterFactory.getMongoResourceRouter(table, options);
    }
  }

  private static getMongoResourceRouter(table: string, options: {isProtected: boolean, isOwned: boolean}) {
    return new MongoResourceRouter(table, options);
  }
}
