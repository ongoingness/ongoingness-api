import { Router, Response, Request, NextFunction} from 'express'
import * as crypto from 'crypto'
import * as jwt from 'jsonwebtoken'
import { Reply } from '../../reply'
import models from '../../models'
import { IUser } from "../../schemas/user"

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

/**
 * Store the user in a database
 * @param  username username
 * @param  password password
 * @return          IUser
 */
export async function storeUser(username: string, password: string): Promise<IUser> {
  let sUser: IUser
  try {
    sUser = await models.User.findOne({username})
  } catch (error) {
    error.message = '500'
    throw error
  }

  if (sUser) {
    let error: Error = new Error('403')
    throw error
  }

  let iv: string
  const hash: crypto.Hash = crypto.createHash('sha256')
  iv = crypto.randomBytes(16).toString('hex')
  hash.update(`${iv}${password}`)
  password = hash.digest('hex')

  let user: IUser = null;
  try {
    user = await models.User.create({username, password, iv})
  } catch (error) {
    error.message = '500'
    throw error
  }

  return user
}

/**
 * Authenticate a user
 * @param  username username
 * @param  password password
 * @return {IUser} Matched user
 */
export async function authenticateUser(username: string, password: string): Promise<IUser> {
  let user: IUser
  try {
    user = await models.User.findOne({username})
  } catch (error) {
    throw error
  }

  if (!user) {
    throw new Error('401')
  }

  // Hash given password with matching user's stored iv
  const hash: crypto.Hash = crypto.createHash('sha256')
  hash.update(`${user.iv}${password}`)
  password = hash.digest('hex')
  // Compare passwords and abort if no match
  if (user.password !== password) {
    throw new Error('401')
  }

  return user
}

/**
 * Create a JWT token for the user
 * @param  user IUser
 * @return
 */
export function generateToken(user: IUser): string {
  const payload = {
    id: user._id,
    username: user.username
  }
  // create and sign token against the app secret
  let token: string = jwt.sign(payload, process.env.SECRET, {
    expiresIn: '1 day' // expires in 24 hours
  })

  return token
}
