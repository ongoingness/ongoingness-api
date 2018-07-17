import { Router, Response, Request, NextFunction} from 'express'
import * as crypto from 'crypto'
import * as jwt from 'jsonwebtoken'
import { Reply } from '../../reply'
import models from '../../models'
import { IUser } from "../../schemas/user"

let routes: Router

const auth = () => {
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

    // check for an existing user
    let sUser: IUser
    try {
      sUser = await models.User.findOne({username})
    } catch (error) {
      error.message = '500'
      return next(error)
    }

    if (sUser) {
      let e: Error = new Error('403')
      return next(e)
    }

    // Hash user's given password after mixing with a random id
    let iv: string
    const hash: crypto.Hash = crypto.createHash('sha256')
    iv = crypto.randomBytes(16).toString('hex')
    hash.update(`${iv}${password}`)
    password = hash.digest('hex')

    let user = null;
    try {
      user = await models.User.create({username, password, iv})
    } catch (e) {
      e.message = '500'
      return next(e)
    }

    // create a payload
    const payload = {
      id: user._id,
      username: user.username
    }
    // create and sign token against the app secret
    const token = jwt.sign(payload, process.env.SECRET, {
      expiresIn: '1 day' // expires in 24 hours
    })

    // let response = responses.success
    let response = new Reply(200, 'success', false, { user, token })
    // response.payload = { user, token }
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

    // Look for user with matching username
    let user: IUser
    try {
      user = await models.User.findOne({username})
    } catch (e) {
      return next(e)
    }

    if (!user) {
      res.locals.customErrorMessage = 'password or email is incorrect'
      let e = new Error('401')
      return next(e)
    }

    // Hash given password with matching user's stored iv
    const hash: crypto.Hash = crypto.createHash('sha256')
    hash.update(`${user.iv}${password}`)
    password = hash.digest('hex')
    // Compare passwords and abort if no match
    if (user.password !== password) {
      res.locals.customErrorMessage = 'password or email is incorrect'
      let e = new Error('401')
      return next(e)
    }

    // create a payload
    let payload = {
      id: user.id,
      username: user.username
    }

    // create and sign token against the app secret
    const token = jwt.sign(payload, process.env.SECRET, {
      expiresIn: '1 day' // expires in 24 hours
    })

    let response = new Reply(200, 'success', false, { token })
    return res.json(response)
  })
  return routes
}

export default auth
