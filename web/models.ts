import { model } from 'mongoose'
import { IUser, UserSchema } from './schemas/user'
import { IDevice, DeviceSchema } from './schemas/device'
import { IPair, PairSchema } from './schemas/pair'
import { IMedia, MediaSchema } from "./schemas/media"
import {IState, StateSchema} from "./schemas/state"

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
  ),
  Media: model<IMedia>(
    'Media', MediaSchema
  ),
  State: model<IState>(
    'State', StateSchema
  )
}
