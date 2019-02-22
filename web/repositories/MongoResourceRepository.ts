import { Schema } from 'mongoose';
import { getModel } from '../models';
import IBaseMongoResource from '../schemas/IBaseMongoResource';
import { IResourceRepository } from './IResourceRepository';

/**
 * MongoDB specific resource controller.
 */
export class MongoResourceRepository<T extends IBaseMongoResource>
  implements IResourceRepository<T> {
  private table: string;

  /**
   * Destroy a record
   * @param {Schema.Types.ObjectId} id
   * @returns {Promise<void>}
   */
  public async destroy(id: Schema.Types.ObjectId): Promise<void> {
    await getModel(this.getTableName()).deleteOne({ _id: id });
  }

  /**
   * Update a record
   * @param {Schema.Types.ObjectId} id
   * @param {{}} data
   * @returns {Promise<T>}
   */
  public async edit(id: Schema.Types.ObjectId, data: {}): Promise<T> {
    return await getModel(this.getTableName()).findByIdAndUpdate(id, data, { new: true }) as T;
  }

  /**
   * Get a record
   * @param {Schema.Types.ObjectId} id
   * @returns {Promise<T>}
   */
  public async get(id: Schema.Types.ObjectId): Promise<T> {
    return await getModel(this.getTableName()).findOne({ _id: id }) as T;
  }

  /**
   * Find a record matching search params
   * @param {{}} filter
   * @param options
   * @returns {Promise<T[]>}
   */
  public async findManyWithFilter(filter: {}, options?: {
    skip: number,
    limit: number,
  }): Promise<T[]> {
    if (!options) {
      return await getModel(this.getTableName())
        .find(filter) as T[];
    }
    return await getModel(this.getTableName())
      .find(filter)
      .sort({ createdAt: -1 })
      .skip(options.skip)
      .limit(options.limit) as T[];
  }

  /**
   * Find many matching records with search params
   * @param {{}} filter
   * @returns {Promise<T>}
   */
  public async findOneWithFilter(filter: {}): Promise<T> {
    return await getModel(this.getTableName()).findOne(filter) as T;
  }

  /**
   * Get all records
   * @returns {Promise<T[]>}
   */
  public async getAll(): Promise<T[]> {
    return await getModel(this.getTableName())
      .find()
      .sort({ createdAdded: -1 })as T[];
  }

  /**
   * Store a record.
   * @param data
   * @returns {Promise<T>}
   */
  public async store(data: any): Promise<T> {
    return await getModel(this.getTableName()).create(data) as T;
  }

  /**
   * Count the number of matching records.
   * @param {{}} filter
   * @returns {Promise<number>}
   */
  public async getCount(filter: {}): Promise<number> {
    return await getModel(this.getTableName()).find(filter).count();
  }

  /**
   * Get the table name for record type.
   * @returns {string}
   */
  public getTableName(): string {
    return this.table;
  }

  /**
   * Set the table name for record type.
   * @param {string} table
   */
  public setTableName(table: string): void {
    this.table = table;
  }
}
