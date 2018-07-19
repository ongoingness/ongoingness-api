import * as express from 'express'
import models from '../../models'
import {IUser} from '../../schemas/user'
import { Reply } from '../../reply'

import checkToken from '../../middleware/authenticate'
import {Request} from "express";
import {Response} from "express";
import {NextFunction} from "express";

let router : express.Router

export const userRouter = () => {
  router = express.Router()

  router.use(checkToken)

  router.get('/me', async (req: Request, res: Response, next: NextFunction) => {
    if (res.locals.error) {
      return next(new Error(`${res.locals.error}`))
    }
    const userId: string = res.locals.user.id
    let user: IUser
    try {
      user = await models.User.findOne({ _id: userId })
    } catch (e) {
      return next(e)
    }
    return res.json(new Reply(200, 'success', false, { user }))
  })

  router.delete('/destroy', async function (req, res, next) {
    if (res.locals.error) {
      return next(new Error(`${res.locals.error}`))
    }
    const userId: string = res.locals.user.id
    try {
      await models.User.deleteOne({ _id: userId })
    } catch (e) {
      return next(e)
    }

    return res.json(new Reply(200, 'success', false, {}))
  })

  return router
}
