export default class LogHelper {

  public static getLogContent(type: LogType, content: any): object {

    var result : any = {level: 'info', code: type.toString(), user: content.user, content: content}

      if(content.user == undefined) {
        result.user = 'undefined';
        result.content.user = 'undefined';
      }

    switch(type) {

      case LogType.REGISTER:
        result.message = `New user ${content.user}`
        break

      case LogType.LOGIN:
        result.message = `User ${content.user} logged in.`
        break

      case LogType.LOGIN_DEVICE:
        result.message = `User ${content.user} logged in`
      
      case LogType.NEW_MEDIA:
        result.message = `User ${content.user} added new media ${content.media._id}.`
        break

      case LogType.DEL_MEDIA:
        result.message = `Media ${content.media} deleted.`
        break
      
      case LogType.GET_ALL_MEDIA:
        result.message = `User ${content.user} got all media.`
        break

      case LogType.GET_INF_MEDIA:
        result.message = `User ${content.user} got inferred media.`
        break

      case LogType.RECEIVED_LOGS:
        result.message = 'Received Logs.'
        break
      
    };

    return result

  }
 
}

export enum LogType {
  REGISTER             = 'REGISTER',
  LOGIN                = 'LOGIN',
  LOGIN_DEVICE         = 'LOGIN_DEVICE',
  NEW_MEDIA            = 'NEW_MEDIA',
  DEL_MEDIA            = 'DEL_MEDIA',
  GET_ALL_MEDIA        = 'GET_MEDIA',
  GET_INF_MEDIA        = 'GET_INF_MEDIA',
  RECEIVED_LOGS        = 'RECEIVED_LOGS'
}


