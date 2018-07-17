import { Express } from 'express'

import home from './home'
import auth from './api/auth'
import user from './api/user'
import devices from './api/devices'

/**
 * [use description]
 * @param  '/'   [description]
 * @param  home( [description]
 * @return       [description]
 */
const addRoutes = (app: Express) => {
  app.use('/', home())
  app.use('/api/auth', auth())
  app.use('/api/user', user())
  app.use('/api/devices', devices())
  return app
}

export default addRoutes
