import { model } from 'mongoose';
import { IUser, userSchema } from './schemas/user';
import { IDevice, deviceSchema } from './schemas/device';
import { IPair, pairSchema } from './schemas/pair';
import { IMedia, mediaSchema } from './schemas/media';
import { ISession, sessionSchema } from './schemas/session';

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
