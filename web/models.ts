import mongoose = require('mongoose')
import { IUser, UserSchema } from './schemas/user'

// Export models
export default {
  User: mongoose.model<IUser>(
      'User', UserSchema
    )
}
