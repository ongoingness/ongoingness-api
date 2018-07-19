import { Router, Response, Request, NextFunction} from 'express'
import { Reply } from '../../reply'
import { IUser } from "../../schemas/user"
import {storeUser} from "../../controllers/user"
import {generateToken, authenticateUser} from "../../controllers/auth";

let routes: Router

export const authRouter = () => {
  routes = Router()
  routes.post('/register', async (req: Request, res: Response, next: NextFunction) => {
    // Get username and password
    const username: string = req.body.username
    let password: string = req.body.password

    // abort if either username or password are null
    if (!username || !password) {
      let e: Error = new Error('400')
      return next(e)
    }

    let user: IUser
    try {
      user = await storeUser(username, password)
    } catch(error) {
      return next(error)
    }

    const token = generateToken(user)

    let response = new Reply(200, 'success', false, { user, token })
    return res.json(response)
  })

  /**
   * Authenticate a user and return a JWT token
   * @type {Object}
   */
  routes.post('/authenticate', async (req: Request, res: Response, next: NextFunction) => {
    // Get username and password from request
    const username: string = req.body.username
    let password: string = req.body.password

    let user: IUser
    try {
      user = await authenticateUser(username, password)
    } catch(error) {
      return next(error)
    }

    const token = generateToken(user)

    let response = new Reply(200, 'success', false, { token })
    return res.json(response)
  })
  return routes
}