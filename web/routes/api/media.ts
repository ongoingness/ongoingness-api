import {NextFunction, Request, Response, Router} from "express";
import * as multer from 'multer'
import {storeMedia, storeMediaRecord} from "../../controllers/media";
import checkToken from '../../middleware/authenticate'
import {IUser} from "../../schemas/user";
import {getUser} from "../../controllers/user";
import {Reply} from "../../reply";
import {IMedia} from "../../schemas/media";

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

  return router
}