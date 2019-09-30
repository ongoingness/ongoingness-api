import Models from '../Models';
import { Schema } from 'mongoose';
import IBaseMongoResource from './IBaseMongoResource';

export interface ILog extends IBaseMongoResource {
    level: string;
    code: string;
    user: Schema.Types.ObjectId;
    content: string;
    message: string;
    timestamp: string;

    //Functions
    getId(): Schema.Types.ObjectId;
    getTable(): string;
    getUserId(): Schema.Types.ObjectId;

}

export const logSchema = new Schema({
    level: {
        type: String,
        required: true
    },
    code: {
        type: String,
        required: true
    },
    user: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    timestamp: {
        type: String,
        required: true,
    },
    message: {
        type: String,
        required: true,
    },
    content: {
        type: String,
        required: true,
    }
});

logSchema.methods.getId = function (): Schema.Types.ObjectId {
    return this._id;
};
  
logSchema.methods.getTable = function (): string {
    return 'log';
};
  
logSchema.methods.getUserId = function (): Schema.Types.ObjectId {
    return this.userId;
};