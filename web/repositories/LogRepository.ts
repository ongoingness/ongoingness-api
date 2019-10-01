import { ILog } from '../schemas/Log';
import { getModel } from '../Models';
import { MongoResourceRepository } from './MongoResourceRepository';

export class LogRepository extends MongoResourceRepository<ILog> {
  constructor() {
    super();
    this.setTableName('log');
  }

  /**
   * Store a log record.
   * @param {{path: string; mimetype: string; user: IUser; era?: string}} data
   * @returns {Promise<IMedia>}
   */
  async store(data: {
    level: string,
    code: string,
    user: string,
    content: string,
    message: string,
    timestamp: string,
  }): Promise<ILog> {
    const log: ILog = await getModel('log').create({
      level: data.level || '',
      code: data.code || '',
      user: data.user,
      content: JSON.stringify(data.content)|| '{}',
      message: data.message || '',
      timestamp: data.timestamp || '',
    }) as ILog;

    return log;
  }

}
