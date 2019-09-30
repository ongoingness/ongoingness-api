import { NextFunction, Request, Response, Router } from 'express';
import { checkToken } from '../../middleware/Authenticate';
import { IUser } from '../../schemas/User';
import { Reply } from '../../Reply';
import { SessionRepository } from '../../repositories/SessionRepository';
import { HttpMethods } from '../../HttpMethods';
import { IResourceRepository } from '../../repositories/IResourceRepository';
import RepositoryFactory from '../../repositories/RepositoryFactory';
import { BaseRouter } from '../BaseRouter';
import MediaController from '../../controllers/MediaController';
import { GraphAdaptor } from '../../repositories/GraphAdaptor';

import Logger from '../../Logger';
import { LogType } from '../../LogHelper';
import { LogRepository } from '../../repositories/LogRepository';
import { ILog } from '../../schemas/Log';

const logRepository: LogRepository = new LogRepository();
const sessionController: SessionRepository = new SessionRepository();
const userRepository: IResourceRepository<IUser> = RepositoryFactory.getRepository('user');

var previousAccess = new Map();

export class LogRouter extends BaseRouter {

  /**
   * @api {get} /api/media/ Get all media
   * @apiGroup Media
   * @apiPermission authenticated
   *
   * @apiUse isAuthenticated
   * @apiUse errorTokenNotProvided
   * @apiUse errorServerError
   * @apiUse errorResourceNotFound
   * @apiUse errorBadRequest
   *
   * @apiSuccessExample {json} Success-Response:
   *  HTTP/1.1 200 OK
   {
      "code": 200,
      "message": "success",
      "errors": false,
      "payload": {
        [
          {
            "links": [],
            "era": "past",
            "emotions": [],
            "_id": "media_id",
            "path": "path_to_file",
            "mimetype": "image/jpeg",
            "user": "user_id",
            "createdAt": "2018-12-13T13:23:34.081Z",
            "updatedAt": "2018-12-13T13:23:34.081Z",
            "__v": 0
          }
        ]
      }
    }
   *
   * @apiDescription Get all user's media
   *
   * Show all media.
   * @param {e.Request} req
   * @param {e.Response} res
   * @param {e.NextFunction} next
   * @returns {Promise<void | e.Response> | void}
   */
  async index(req: Request, res: Response, next: NextFunction): Promise<void | Response> {
  
    let user: IUser;
    try {
      user = await userRepository.get(res.locals.user.id);
    } catch (e) {
      e.message = '500';
    }
 
    let logs : ILog[] = [];
    try {
      logs = await logRepository.findManyWithFilter({ user: user._id });
    } catch (e) {
      e.message = '500';
    }

    return res.json(new Reply(200, 'success', false, logs));
  }

  /**
   * @api {post} /api/media/ Store media
   * @apiGroup Media
   * @apiPermission authenticated
   *
   * @apiUse isAuthenticated
   * @apiUse errorTokenNotProvided
   * @apiUse errorServerError
   * @apiUse errorResourceNotFound
   * @apiUse errorBadRequest
   *
   * @apiSuccessExample {json} Success-Response:
   *  HTTP/1.1 200 OK
   {
      "code": 200,
      "message": "success",
      "errors": false,
      "payload": {
        "links": [],
        "era": "past",
        "emotions": [],
        "_id": "media_id",
        "path": "path_to_file",
        "mimetype": "image/jpeg",
        "user": "user_id",
        "createdAt": "2018-12-13T13:23:34.081Z",
        "updatedAt": "2018-12-13T13:23:34.081Z",
        "__v": 0
      }
    }
   *
   * @apiParam {File} file  Image to upload.
   * @apiParam {String} [era]  Era the image is from, must be 'past' or 'present'. Default is past.
   *
   * @apiDescription Upload media.
   * @param {e.Request} req
   * @param {e.Response} res
   * @param {e.NextFunction} next
   * @returns {Promise<void | e.Response>}
   */
  async store(req: Request, res: Response, next: NextFunction): Promise<void | Response> {

    let user: IUser;
    try {
      user = await userRepository.get(res.locals.user.id);
    } catch (e) {
      e.message = '500';
      return next(e);
    }
    
    var logs = JSON.parse(req.body.logs);

    for(var i = 0; i < logs.length; i++) {
      try {
        var data = {} as any
        data['level'] = logs[i].level
        data['code'] = logs[i].code
        data['user'] = user._id
        data['content'] = logs[i].content
        data['message'] = logs[i].message
        data['timestamp'] = new Date(logs[i].timestamp * 1).toISOString()
        await logRepository.store(data)
      } catch (error) {
        console.log(error)
      }
    }
    return res.json(new Reply(200, 'success', false, []));
  }

  constructor() {
    super();
    this.addMiddleware(checkToken);
    this.addRoute('/', HttpMethods.GET, this.index);
    this.addRoute('/', HttpMethods.POST, this.store);
  }

  setRouter(router: Router): void {
    this.router = router;
  }
}
