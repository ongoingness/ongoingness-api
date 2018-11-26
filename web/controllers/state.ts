import { Schema } from 'mongoose';
import { IState } from '../schemas/state';
import models from '../models';

export async function storeState(device: Schema.Types.ObjectId,
                                 media: Schema.Types.ObjectId): Promise<IState> {
  return await models.State.create({ device, media });
}
