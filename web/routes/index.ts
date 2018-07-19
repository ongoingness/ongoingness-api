import { Express } from 'express'

import home from './home'
import { authRouter } from './api/auth'
import { userRouter } from './api/user'
import { devicesRouter } from './api/devices'

/**
 * [use description]
 * @param  '/'   [description]
 * @param  home( [description]
 * @return       [description]
 */
const addRoutes = (app: Express) => {
  app.use('/', home())
  app.use('/api/auth', authRouter())
  app.use('/api/user', userRouter())
  app.use('/api/devices', devicesRouter())
  return app
}

export default addRoutes
