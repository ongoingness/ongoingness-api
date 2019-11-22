import { NextFunction, Request, Response, Router } from 'express';
import { checkToken } from '../../middleware/Authenticate';
import { IUser } from '../../schemas/User';
import { Reply } from '../../Reply';
import { HttpMethods } from '../../HttpMethods';
import { IResourceRepository } from '../../repositories/IResourceRepository';
import RepositoryFactory from '../../repositories/RepositoryFactory';
import { BaseRouter } from '../BaseRouter';

import { LogRepository } from '../../repositories/LogRepository';
import { ILog } from '../../schemas/Log';
import Logger from '../../Logger';
import { LogType } from '../../LogHelper';

const logRepository: LogRepository = new LogRepository();
const userRepository: IResourceRepository<IUser> = RepositoryFactory.getRepository('user');

export class LogRouter extends BaseRouter {

  /**
   * @api {get} /api/log/ Get all logs
   * @apiGroup Log
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
            "_id": "logID",
            "level": "info",
            "code": "LOGCODE",
            "user": "userID",
            "content": { "example" : "test" },
            "message": "Log message",
            "timestamp": "2019-09-30T11:44:50.025Z",
            "__v": 0
          }
        ]
      }
    }
   *
   * @apiDescription Get all user's logs
   *
   * Show all logs.
   * @param {e.Request} req
   * @param {e.Response} res
   * @param {e.NextFunction} next
   * @returns {Promise<void | e.Response> | void}
   */
  async index(req: Request, res: Response, next: NextFunction): Promise<void | Response> {

    try {
      let user: IUser = await userRepository.get(res.locals.user.id);
      let logs : ILog[] = await logRepository.findManyWithFilter({ user: user._id });
      return res.json(new Reply(200, 'success', false, logs));
    } catch (e) {
      e.message = '500';
      return next(e)
    }

  }

  /**
   * @api {post} /api/log/ Store logs
   * @apiGroup Log
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
      "payload": {[]}
    }
   *
   * @apiParam {String} [Log] List of logs
   *
   * @apiDescription Upload Logs.
   * @param {e.Request} req
   * @param {e.Response} res
   * @param {e.NextFunction} next
   * @returns {Promise<void | e.Response>}
   */
  async store(req: Request, res: Response, next: NextFunction): Promise<void | Response> {

    let user: IUser;
    try {
      user = await userRepository.get(res.locals.user.id);
    
      var logs = JSON.parse(req.body.logs);

      for(var i = 0; i < logs.length; i++) {
          var data = {} as any
          data['level'] = logs[i].level
          data['code'] = logs[i].code
          data['user'] = user._id
          data['content'] = logs[i].content
          data['message'] = logs[i].message
          data['timestamp'] = new Date(logs[i].timestamp * 1).toISOString()
          await logRepository.store(data)
      }

      Logger.log(LogType.RECEIVED_LOGS, {user: res.locals.user.id})

      return res.json(new Reply(200, 'success', false, []));

    } catch (e) {
      e.message = '500';
      return next(e);
    }
   
  }

  async usersLogsAmount(req: Request, res: Response, next: NextFunction): Promise<void | Response> {
  
    try {

      var users = await userRepository.getAll();
      var usersLogsList = []
      for(var i = 0; i < users.length; i++) {
        let logs : ILog[] = await logRepository.findManyWithFilter({ user: users[i]._id });
        var userLogs = {} as any;
        userLogs['id'] = users[i]._id;
        userLogs['username'] = users[i].username;
        userLogs['nlogs'] = logs.length;
        usersLogsList.push(userLogs);
      }
      return res.json(new Reply(200, 'success', false, usersLogsList));
    
    } catch (e) {
      
      e.message = '500';
      return next(e);
    
    } 

  }

  async search(req: Request, res: Response, next: NextFunction): Promise<void | Response> {
    var codes = req.query.codes;
    var user = req.query.user;
    const firstPage = Number(req.query.firstPage);
    const pageAmount = Number(req.query.pageAmount);
    const pageSize = Number(req.query.pageSize);
  
    codes = codes.split(',');

    console.log(codes + user)

    console.log(`fistPage: ${firstPage} pageAmount: ${pageAmount} pageSize: ${pageSize}`);

    var resultLogs: ILog[] = [];

    for(var i = 0; i < codes.length; i++) {
      var result = await logRepository.findManyWithFilter({ user: user, code: codes[i]});
      resultLogs = resultLogs.concat(result);
    }

    resultLogs.sort((a: any, b: any) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())

    var pages : any = []
  
    var totalNumberOfSlices = Math.ceil(resultLogs.length / pageSize);

    for(var i = 0; i < pageAmount; i++) {
      console.log(`fistPage: ${firstPage} pageAmount: ${pageAmount} pageSize: ${pageSize} i: ${i}`);

      let endSlice = (i + firstPage) * pageSize;
      let beginSlice = endSlice - pageSize;

      console.log(beginSlice + " " + endSlice);

      var page : any = {'index': i + firstPage }
      page['logs'] = resultLogs.slice(beginSlice, endSlice);

      pages.push(page);
    }


    var payload : any = {};
    payload['logsAmount'] = resultLogs.length;
    payload['totalPages'] = totalNumberOfSlices;
    payload['pages'] = pages;

    console.log(payload);

    return res.json(new Reply(200, 'success', false, payload));
  }


  constructor() {
    super();
    this.addMiddleware(checkToken);
    this.addRoute('/', HttpMethods.GET, this.index);
    this.addRoute('/', HttpMethods.POST, this.store);
    this.addRoute('/usernlogs', HttpMethods.GET, this.usersLogsAmount);
    this.addRoute('/search', HttpMethods.GET, this.search);
  }

  setRouter(router: Router): void {
    this.router = router;
  }
}
