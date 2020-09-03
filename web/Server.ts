import * as express from 'express';
import * as bodyParser from 'body-parser';
import * as cors from 'cors';
import * as handler from './middleware/Handler';
import * as mongoose from 'mongoose';
import { addRoutes } from './routes';
import * as dotenv from 'dotenv';


var mongoUriBuilder = require('mongo-uri-builder');

dotenv.load();

/**
 * Class that Models the server application.
 * Initialises a new instance of an express application in the constructor.
 * Can be started with App.express.listen(PORT: number).
 */
export class App {
  public express: express.Express;

  constructor() {
    this.express = express();

    /**
     * Skip auth if in development.
     */
    if (process.env.LOCAL === 'true') {
      mongoose.connect(process.env.MONGO_URI_LOCAL, {reconnectTries: Number.MAX_VALUE, reconnectInterval: 5000} );
    } else {
      mongoose.connect(process.env.MONGO_URI, {
        user: process.env.MONGODB_USER,
        pass: process.env.MONGODB_PASS,
        dbName: process.env.MONGODB_DATABASE,
        authdb: 'admin',
        reconnectTries: Number.MAX_VALUE,
        reconnectInterval: 5000,
      });
    }

    // Descriptions of each in method declaration.
    this.prepareStatic();
    this.setViewEngine();
    this.setBodyParser();
    this.addCors();
    this.setAppSecret();
    this.addRoutes(this.express);
    this.setErrorHandler();


    this.express.use(express.static(__dirname + '/webapp/'));

    // Handle MPA
    this.express.get('/webapp/anew/', (req, res) => res.sendFile(__dirname + '/webapp/anew.html'));
    this.express.get('/webapp/ivvor/', (req, res) => res.sendFile(__dirname + '/webapp/ivvor.html'));
    this.express.get('/webapp/locket/', (req, res) => res.sendFile(__dirname + '/webapp/locket.html'));
    this.express.get('/webapp/logs/', (req, res) => res.sendFile(__dirname + '/webapp/logs.html'));
    this.express.get('/webapp/refind/', (req, res) => res.sendFile(__dirname + '/webapp/refind.html'));
    
  }

  /**
   * Prepare the static folder.
   * Contains api docs.
   */
  private prepareStatic(): void {
    this.express.use('/', express.static(`${__dirname}/../../static/apidoc`));
  }

  /**
   * Set view engine for html.
   */
  private setViewEngine(): void {
    this.express.set('view engine', 'ejs');
    this.express.engine('html', require('ejs').renderFile);
  }

  /**
   * Create and add the routers, must pass the app.
   * @param {e.Express} app
   */
  private addRoutes (app: express.Express): void {
    this.express = addRoutes(app);
  }

  /**
   * Set body parser to access post parameters.
   */
  private setBodyParser(): void {
    this.express.use(bodyParser.json({limit: '50mb'}));
    this.express.use(bodyParser.urlencoded({
      limit: '50mb',
      extended: true,
      parameterLimit:50000,
    }));
  }

  /**
   * Add CORS
   */
  private addCors(): void {
    this.express.use(cors());
    this.express.options('*', cors());
  }

  /**
   * Set the application secret to sign JWT tokens.
   */
  private setAppSecret(): void {
    this.express.set('secret', process.env.SECRET);
  }

  /**
   * Set the error handler.
   */
  private setErrorHandler(): void {
    this.express.use(handler.handleResponse);
  }
}
