import * as express from 'express'
import {NextFunction, Request, Response} from "express";
let router

/**
 * Get routes
 * @param  app Express.express
 * @return     Router
 */
function home(): express.Router {
  router = express.Router()
  router.get('/', (req: Request, res: Response, next: NextFunction) => {
    return res.send('Hello World')
  })

  return router
}

export default home
