export default class LogHelper {

  public static getLogContent(type: LogType, content: any): object {

    var result : any = {level: 'info', code: type.toString(), user: content.user, content: content}

      if(content.user == undefined) {
        result.user = 'undefined';
        result.content.user = 'undefined';
      }

    switch(type) {

      case LogType.REGISTER:
        result.message = `New user ${content.user._id}`
        break

      case LogType.LOGIN:
        result.message = `User ${content.user._id} logged in.`
        break

      case LogType.NEW_MEDIA:
        result.message = `User ${content.user._id} added new media ${content.media._id}.`
        break

      case LogType.DEL_MEDIA:
        result.message = `Media ${content.media} deleted.`
        break
      
      case LogType.GET_ALL_MEDIA:
        result.message = `User ${content.user._id} got all media.`
        break

      case LogType.GET_INF_MEDIA:
        result.message = `User ${content.user} got inferred media.`
        break
      
    };

    return result

  }
 
}

export enum LogType {
  REGISTER             = 'REGISTER',
  LOGIN                = 'LOGIN',
  NEW_MEDIA            = 'NEW_MEDIA',
  DEL_MEDIA            = 'DEL_MEDIA',
  GET_ALL_MEDIA        = 'GET_MEDIA',
  GET_INF_MEDIA        = 'GET_INF_MEDIA',
  WAKE_UP              = 'WAKE_UP',
  NEXT_IMAGE           = 'NEXT_IMAGE',
  PREV_IMAGE           = 'PREV_IMAGE',
  SLEEP                = 'SLEEP',
  ACTIVITY_STARTED     = 'ACTIVITY_STARTED',
  ACTIVITY_TERMINATED  = 'ACTIVITY_TERMINATED',
  CHARGER_CONNECTED    = 'CHARGER_CONNECTED', 
  CHARGER_DISCONNECTED = 'CHARGER_DISCONNECTED'
}


