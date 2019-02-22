import { Model, model } from 'mongoose';
import { IUser, userSchema } from './schemas/User';
import { IDevice, deviceSchema } from './schemas/Device';
import { IPair, pairSchema } from './schemas/pair';
import { IMedia, mediaSchema } from './schemas/Media';
import { ISession, sessionSchema } from './schemas/session';
import IBaseMongoResource from './schemas/IBaseMongoResource';

// Export models
export default {
  User: model<IUser>(
    'User', userSchema,
  ),
  Device: model<IDevice>(
    'Device', deviceSchema,
  ),
  Pair: model<IPair>(
    'Pair', pairSchema,
  ),
  Media: model<IMedia>(
    'Media', mediaSchema,
  ),
  Session: model<ISession>(
    'Session', sessionSchema,
  ),
};

export function getModel(t: string): Model<IBaseMongoResource> {
  switch (t) {
    case 'device':
      return model<IDevice>(
        'Device', deviceSchema,
      );
    case 'user':
      return model<IUser>(
        'User', userSchema,
      );
    default:
      return null;
  }
}
