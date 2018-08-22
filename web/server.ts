import * as express from "express"
import * as path from "path"
import * as bodyParser from 'body-parser'
import * as cors from 'cors'
import * as dotenv from 'dotenv'
import * as handler from './middleware/handler'
import * as mongoose from 'mongoose'
import addRoutes from './routes'
dotenv.load()

export class App {
    public express: express.Express

    constructor() {
      this.express = express()

      mongoose.connect(process.env.MONGO_URI, {
        user: process.env.MONGODB_USER,
        pass: process.env.MONGODB_PASS,
        dbName: process.env.MONGODB_DATABASE,
        authdb: 'admin'
      })

      this.prepareStatic()
      this.setViewEngine()
      this.setBodyParser()
      this.addCors()
      this.setAppSecret()
      this.addRoutes(this.express)
      this.setErrorHandler()
    }

    // This serves everything in `static` as static files
    private prepareStatic(): void {
     this.express.use(express.static(path.join(__dirname, "/../static/")))
    }

    // Sets up handlebars as a view engine
    private setViewEngine(): void {
      this.express.set("view engine", "ejs")
      this.express.engine('html', require('ejs').renderFile)
    }

    private addRoutes (app: express.Express): void {
      this.express = addRoutes(app)
    }

    private setBodyParser(): void {
      this.express.use(bodyParser.json())
      this.express.use(bodyParser.urlencoded({
        extended: true
      }))
    }

    private addCors(): void {
      this.express.use(cors())
      this.express.options('*', cors())
    }

    private setAppSecret(): void {
      this.express.set('secret', process.env.SECRET)
    }

    private setErrorHandler(): void {
      this.express.use(handler.handleResponse)
    }
}
