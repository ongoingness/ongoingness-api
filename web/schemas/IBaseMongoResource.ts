import { Document, Schema } from 'mongoose';

export default interface IBaseMongoResource extends Document {
  getId(): Schema.Types.ObjectId;
  getTable(): string;
  getUserId(): Schema.Types.ObjectId;
}
