import {NextFunction, Request, Response, Router} from "express"
import * as multer from 'multer'
import {getMedia, storeMedia, storeMediaRecord} from "../../controllers/media"
import checkToken from '../../middleware/authenticate'
import {IUser} from "../../schemas/user"
import {getUser} from "../../controllers/user"
import {Reply} from "../../reply"
import {IMedia} from "../../schemas/media"
import {Schema} from "mongoose";
import {IDevice} from "../../schemas/device";
import {getDevice} from "../../controllers/device";
import {IState} from "../../schemas/state";
import storeState from "../../controllers/state";
import {error} from "util";

let upload = multer({ dest: 'uploads/' })
let router: Router

export const mediaRouter = () => {
  router = Router()

  router.use(checkToken)

  /**
   * Upload media
   */
  router.post('/upload', upload.single('file'), async (req: Request, res: Response, next: NextFunction) => {
    if (res.locals.error) {
      return next(new Error(`${res.locals.error}`))
    }

    let user: IUser
    try {
      user = await getUser(res.locals.user.id)
    } catch (e) {
      e.message = '500'
      return next(e)
    }

    if (req.file === undefined) {
      return next(new Error('400'))
    }

    const mimeType = req.file.mimetype
    let ext = req.file.originalname.split('.')[req.file.originalname.split('.').length - 1]

    let imagePath: string
    let media: IMedia
    try {
      imagePath = await storeMedia(req.file.path, req.file.originalname, ext)
      media = await storeMediaRecord(imagePath, mimeType, user)
    } catch (e) {
      e.message = '500'
    }

    return res.json(new Reply(200, 'success', false, media))
  })

  /**
   * Store the current image a display is presenting
   */
  router.post('/store/display', async (req: Request, res: Response, next: NextFunction) => {
    const mediaId: Schema.Types.ObjectId = req.params.mediaId
    const deviceId: Schema.Types.ObjectId = req.params.mediaId

    let user: IUser
    try {
      user = await getUser(res.locals.user.id)
    } catch(error) {
      error.message('500')
      return next(error)
    }

    let deviceIdx: number = -1
    for (let i: number = 0; i < user.devices.length; i++) {
      if (user.devices[i] === deviceId) {
        deviceIdx = i
      }
    }

    let mediaIdx: number = -1
    for (let i: number = 0; i < user.media.length; i++) {
      if(user.media[i] === mediaId) {
        mediaIdx = i
      }
    }

    if (mediaIdx < 0 || deviceIdx < 0) {
      return next(new Error('404'))
    }
    
    let state: IState
    try {
      state = await storeState(deviceId, mediaId)
    } catch (error) {
      error.message = '500'
      return next(error)
    }

    return res.json(new Reply(200, 'success', false, state))

  })

  return router
}