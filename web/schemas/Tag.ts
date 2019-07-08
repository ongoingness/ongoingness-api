import { Schema } from 'mongoose';
import { MediaRepository } from '../repositories/MediaRepository';
import IBaseMongoResource from './IBaseMongoResource';

const schemaOptions = {
    timestamps: false,
};
const mediaController: MediaRepository = new MediaRepository();

export interface ITag extends IBaseMongoResource {
    tagname: string;

    // Functions
    getTagname(): string;
}

export const tagSchema = new Schema({
    tagname: {
        type: String,
        required: true,
        unique : true,
        dropDups: true
    }
}, schemaOptions);

tagSchema.methods.getTagName = function(): String {
    return this.tagname
}
