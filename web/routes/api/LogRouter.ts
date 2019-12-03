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
import { UserRole } from '../../UserRole';

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
      let currentUser = await userRepository.get(res.locals.user.id);
      if(currentUser.role != UserRole.ADMIN)
        return res.json(new Reply(404, 'success', false, []));

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

    let currentUser = await userRepository.get(res.locals.user.id);
    if(currentUser.role != UserRole.ADMIN)
      return res.json(new Reply(404, 'success', false, []));

    var codes = req.query.codes;
    var user = req.query.user;
    const firstPage = Number(req.query.firstPage);
    const pageAmount = Number(req.query.pageAmount);
    const pageSize = Number(req.query.pageSize);
    const from = req.query.from;
    const to = req.query.to;
  
    codes = codes.split(',');

    console.log(codes + user)

    console.log(`fistPage: ${firstPage} pageAmount: ${pageAmount} pageSize: ${pageSize}`);

    var resultLogs: ILog[] = [];

    var searchParameters : any = {user: user};

    if(from != 0 && to != 0) {
      var fromDate = new Date(Number(from)).toISOString();
      var toDate = new Date(Number(to)).toISOString();
      searchParameters['timestamp'] = {$gt: fromDate, $lt: toDate }
    }

    if(codes.length == 0 || codes.includes("ALL"))
      resultLogs = await logRepository.findManyWithFilter(searchParameters);  
    else {
      if(codes.includes("WEBSITE")) {
        if(!codes.includes("REGISTER")) codes.push("REGISTER");
        if(!codes.includes("LOGIN")) codes.push("LOGIN");
        if(!codes.includes("NEW_MEDIA")) codes.push("NEW_MEDIA");
        if(!codes.includes("DEL_MEDIA")) codes.push("DEL_MEDIA");
        if(!codes.includes("GET_MEDIA")) codes.push("GET_MEDIA");
        if(!codes.includes("GET_INF_MEDIA")) codes.push("GET_INF_MEDIA");
        if(!codes.includes("RECEIVED_LOGS")) codes.push("RECEIVED_LOGS");
      } else if (codes.includes("PIECE")) {
        if(!codes.includes("LOGIN_DEVICE")) codes.push("LOGIN_DEVICE");
        if(!codes.includes("WAKE_UP")) codes.push("WAKE_UP");
        if(!codes.includes("CONTENT_DISPLAYED")) codes.push("CONTENT_DISPLAYED");
        if(!codes.includes("SLEEP")) codes.push("SLEEP");
        if(!codes.includes("ACTIVITY_STARTED")) codes.push("ACTIVITY_STARTED");
        if(!codes.includes("ACTIVITY_TERMINATED")) codes.push("ACTIVITY_TERMINATED");
        if(!codes.includes("CHARGER_CONNECTED")) codes.push("CHARGER_CONNECTED");
        if(!codes.includes("CHARGER_DISCONNECTED")) codes.push("CHARGER_DISCONNECTED");
        if(!codes.includes("PULLED_CONTENT")) codes.push("PULLED_CONTENT");
        if(!codes.includes("PUSHED_LOGS")) codes.push("PUSHED_LOGS");
        if(!codes.includes("NEW_CONTENT_ADDED")) codes.push("NEW_CONTENT_ADDED");
        if(!codes.includes("CONTENT_REMOVED")) codes.push("CONTENT_REMOVED");
        if(!codes.includes("STARTED_WATCHFACE")) codes.push("STARTED_WATCHFACE");
        if(!codes.includes("STOPPED_WATCHFACE")) codes.push("STOPPED_WATCHFACE");
      }
      searchParameters['code'] = codes;
      resultLogs = await logRepository.findManyWithFilter(searchParameters);
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

  async numberOfSessions(req: Request, res: Response, next: NextFunction): Promise<void | Response> {

    let currentUser = await userRepository.get(res.locals.user.id);
    if(currentUser.role != UserRole.ADMIN)
      return res.json(new Reply(404, 'success', false, []));

    const user = req.query.user;
    const from = req.query.from;
    const to = req.query.to;
    const timescale = req.query.timescale;

    var fromDate = new Date(Number(from)).toISOString();
    var toDate = new Date(Number(to)).toISOString();
    var searchParameters: any = {user: user};
    searchParameters['timestamp'] = {$gt: fromDate, $lt: toDate }
    searchParameters['code'] = ["WAKE_UP", "CONTENT_DISPLAYE", "SLEEP", "ACTIVITY_TERMINATED"];

    var resultLogs: ILog[] = await logRepository.findManyWithFilter(searchParameters);
    resultLogs.sort((a: any, b: any) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())

    var chartData = [];
    var maxSession = 0;

    var sessions : any = [];
    var timeStart = new Date();
    var timeEnd = new Date();

    if(timescale == 'd') {
      timeStart = new Date(Number(from));
      timeEnd =  new Date(timeStart.getFullYear(), timeStart.getMonth(), timeStart.getDate(), 23, 59, 59, 999);
    } else if (timescale == 'w') {
      timeStart = new Date(Number(from));
      var timeAux = new Date(timeStart);
      timeAux.setDate(timeStart.getDate()+6);
      timeEnd = new Date(timeAux.getFullYear(), timeAux.getMonth(), timeAux.getDate(), 23, 59, 59, 999);
    } else if (timescale == 'm') {
      var timeStartAux = new Date(Number(from));
      timeStart = new Date(timeStartAux.getFullYear(), timeStartAux.getMonth(), 1, 0, 0, 0, 0);
      timeStartAux.setMonth(timeStartAux.getMonth() + 1);
      timeEnd = new Date(timeStartAux.getFullYear(), timeStartAux.getMonth(), 1, 0, 0, 0, 0);
    }
    
    var stop = false;

    while(!stop){

      let distinctSessions = 0;
      for(let i = 0; i < resultLogs.length; i++) {
        let timestamp = new Date(resultLogs[i].timestamp).getTime();
        if(timestamp >= timeStart.getTime() &&  timestamp < timeEnd.getTime()) {
          var contentJSON = JSON.parse(resultLogs[i].content);
          if(contentJSON.hasOwnProperty('session') && !sessions.includes(contentJSON.session)){
            distinctSessions++;
            sessions.push(contentJSON.session);
          }
        }
      }

      var timestampResult = '';
      if(timescale == 'd') {
        timestampResult = `${timeStart.getMonth() + 1}/${timeStart.getDate()}`;
      } else if(timescale == 'w') {
        timestampResult = `${timeStart.getMonth() + 1}/${timeStart.getDate()}`;
      } else if(timescale == 'm') {
        timestampResult = `${timeStart.getMonth() + 1}`;
      }

      chartData.push({timestamp: timestampResult, sessions: distinctSessions});
      if(distinctSessions > maxSession) maxSession = distinctSessions;

      if(timeEnd.getTime() == new Date(Number(to)).getTime()) {
        stop = true;
      } else {
        if(timescale == 'd') {
          timeStart.setDate(timeStart.getDate() + 1);
          timeEnd =  new Date(timeStart.getFullYear(), timeStart.getMonth(), timeStart.getDate(), 23, 59, 59, 999);
        } else if (timescale == 'w') {
          
          timeStart.setDate(timeStart.getDate() + 7);
          timeAux = new Date(timeStart);
          timeAux.setDate(timeStart.getDate()+6);
          timeEnd = new Date(timeAux.getFullYear(), timeAux.getMonth(), timeAux.getDate(), 23, 59, 59, 999);

          if(timeEnd.getTime() > new Date(Number(to)).getTime()) {
            timeEnd = new Date(Number(to));
          }
    
        } else if (timescale == 'm') {        
          timeStart.setMonth(timeStart.getMonth() + 1);
          timeEnd.setMonth(timeEnd.getMonth() + 1);

          if(timeEnd.getTime() > new Date(Number(to)).getTime()) {
            timeEnd = new Date(Number(to));
          }

        }
    }
      
  }

    return res.json(new Reply(200, 'success', false, {maxSession, chartData}));
  }


  constructor() {
    super();
    this.addMiddleware(checkToken);
    this.addRoute('/', HttpMethods.GET, this.index);
    this.addRoute('/', HttpMethods.POST, this.store);
    this.addRoute('/usernlogs', HttpMethods.GET, this.usersLogsAmount);
    this.addRoute('/search', HttpMethods.GET, this.search);
    this.addRoute('/numberOfSessions', HttpMethods.GET, this.numberOfSessions);
  }

  setRouter(router: Router): void {
    this.router = router;
  }
}
