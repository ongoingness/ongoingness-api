import { model } from 'mongoose'
import { IUser, UserSchema } from './schemas/user'
import { IDevice, DeviceSchema } from './schemas/device'
import { IPair, PairSchema } from './schemas/pair'

// Export models
export default {
  User: model<IUser>(
    'User', UserSchema
  ),
  Device: model<IDevice>(
    'Device', DeviceSchema
  ),
  Pair: model<IPair>(
    'Pair', PairSchema
  )
}
