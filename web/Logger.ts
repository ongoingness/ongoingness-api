import LogHelper, { LogType } from "./LogHelper";
import { LogRepository } from "./repositories/LogRepository";

const { createLogger, format } = require('winston');
const { combine, timestamp, prettyPrint } = format;
const Transport = require('winston-transport');

// https://www.npmjs.com/package/winston#transports
class MongoDBTransport extends Transport {

    private logRepository: LogRepository = new LogRepository();

    log(info : any, callback : any) {
      setImmediate(() => {
        this.emit('logged', info.message);
      });
   
      console.log(`${info.timestamp} - ${info.message}`)
      // Perform the writing to the remote service
      this.logRepository.store(info)

      callback();
    }  
};


export default class Logger {
    private static logger = createLogger({
        level: 'info',
        format: combine(
        timestamp(),
        prettyPrint()
        ),
        transports: [new MongoDBTransport()]
    });

    static log(type: LogType, content: object) {
        Logger.logger.log(LogHelper.getLogContent(type, content));  
    }
}





