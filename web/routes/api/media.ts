import { NextFunction, Request, Response } from 'express';
import * as multer from 'multer';
import { MediaController } from '../../controllers/media';
import { checkToken } from '../../middleware/authenticate';
import { IUser } from '../../schemas/user';
import { UserController } from '../../controllers/user';
import { Reply } from '../../reply';
import { IMedia } from '../../schemas/media';
import { Schema } from 'mongoose';
import { SessionController } from '../../controllers/session';
import { ResourceRouter } from './base';
import { Methods } from '../../methods';

const upload = multer({ dest: 'uploads/' });
const mediaController: MediaController = new MediaController();
const sessionController: SessionController = new SessionController();
const userController: UserController = new UserController();

export class MediaRouter extends ResourceRouter {
  /**
   * Destroy media
   * TODO: Implement
   * @param {e.Request} req
   * @param {e.Response} res
   * @param {e.NextFunction} next
   * @returns {Promise<void | e.Response> | void}
   */
  destroy(req: Request, res: Response, next: NextFunction): Promise<void | Response> | void {
    return undefined;
  }

  /**
   * @api {get} /api/media/:id Get media by id.
   * @apiGroup Media
   * @apiPermission authenticated
   *
   * @apiUse isAuthenticated
   * @apiUse errorTokenNotProvided
   * @apiUse errorServerError
   * @apiUse errorResourceNotFound
   *
   * @apiParam {String} id  Media id
   *
   * @apiDescription Returns the media as an image.
   *
   * Display media
   * @param {e.Request} req
   * @param {e.Response} res
   * @param {e.NextFunction} next
   * @returns {Promise<void | e.Response>}
   */
  async show(req: Request, res: Response, next: NextFunction): Promise<void | Response> {
    const mediaId: Schema.Types.ObjectId = req.params.id;
    let user: IUser;
    let media: IMedia;

    if (res.locals.error) {
      return next(new Error(`${res.locals.error}`));
    }

    try {
      user = await userController.get(res.locals.user.id);
      media = await user.getMedia(mediaId);
    } catch (e) {
      e.message = '500';
      return next(e);
    }

    if (!media) {
      return next(new Error('404'));
    }

    let data: any;
    try {
      data = await mediaController.getMediaFromS3(media.path);
    } catch (e) {
      return next(new Error('500'));
    }

    res.writeHead(200, { 'Content-Type': 'image/jpeg' });
    res.write(data, 'binary');
    res.end(null, 'binary');
  }

  /**
   * @api {get} /api/media/links/:id Get all media links
   * @apiGroup Media
   * @apiPermission authenticated
   *
   * @apiUse isAuthenticated
   * @apiUse errorTokenNotProvided
   * @apiUse errorServerError
   * @apiUse errorResourceNotFound
   *
   * @apiParam {String} id  Media id.
   *
   * @apiSuccessExample {json} Success-Response:
   *  HTTP/1.1 200 OK
   {
      "code": 200,
      "message": "success",
      "errors": false,
      "payload": {
        [
          'link_id',
          'link_id2'
        ]
      }
    }
   *
   * @apiDescription Get all media that an item has semantic links with.
   *
   * Get links attached to media.
   * @param {e.Request} req
   * @param {e.Response} res
   * @param {e.NextFunction} next
   * @returns {Promise<void | e.Response>}
   */
  async getLinks(req: Request, res: Response, next: NextFunction): Promise<void | Response> {
    const mediaId: Schema.Types.ObjectId = req.params.id;
    let media: IMedia;
    try {
      media = await mediaController.get(mediaId);
    } catch (e) {
      e.message = '500';
      return next(e);
    }
    if (!media) {
      return next(new Error('404'));
    }

    return res.json(new Reply(200, 'success', false, media.links));
  }

  /**
   * @api {get} /api/media/request Request media from the present.
   * @apiGroup Media
   * @apiPermission authenticated
   *
   * @apiUse isAuthenticated
   * @apiUse errorTokenNotProvided
   * @apiUse errorServerError
   * @apiUse errorResourceNotFound
   *
   * @apiSuccessExample {json} Success-Response:
   *  HTTP/1.1 200 OK
   {
      "code": 200,
      "message": "success",
      "errors": false,
      "payload": 'media_id'
    }
   *
   * @apiDescription Get an item of media from the present archive.
   *
   * Get media from the present
   * @param {e.Request} req
   * @param {e.Response} res
   * @param {e.NextFunction} next
   * @returns {Promise<void | e.Response>}
   */
  async getPresent(req: Request, res: Response, next: NextFunction): Promise<void | Response> {
    let user: IUser;
    let media: IMedia;

    if (res.locals.error) {
      return next(new Error(`${res.locals.error}`));
    }

    try {
      const userId: Schema.Types.ObjectId = res.locals.user.id;
      user = await userController.get(userId);
      media = await mediaController.getRandomPresentMedia(user._id);

      if (!media) {
        return next(new Error('404'));
      }

      await sessionController.store({ media, user: user._id });
    } catch (e) {
      e.message = '500';
      return next(e);
    }

    return res.json(new Reply(200, 'success', false, media._id));
  }

  /**
   * @api {post} /api/media/link Store a link between media.
   * @apiGroup Media
   * @apiPermission authenticated
   *
   * @apiUse isAuthenticated
   * @apiUse errorTokenNotProvided
   * @apiUse errorServerError
   * @apiUse errorResourceNotFound
   *
   * @apiSuccessExample {json} Success-Response:
   *  HTTP/1.1 200 OK
   {
      "code": 200,
      "message": "success",
      "errors": false,
      "payload": {}
    }
   *
   * @apiParam {String} mediaId  Media from the past to add the link to.
   * @apiParam {String} linkId  Media from the past to link to.
   *
   * @apiDescription Link two devices together
   *
   * Store links in the database.
   * @param {e.Request} req
   * @param {e.Response} res
   * @param {e.NextFunction} next
   * @returns {Promise<void | e.Response>}
   */
  async storeLink(req: Request, res: Response, next: NextFunction): Promise<void | Response> {
    const mediaId: Schema.Types.ObjectId = req.body.mediaId;
    const linkId: Schema.Types.ObjectId = req.body.linkId;

    let user: IUser;
    try {
      user = await userController.get(res.locals.user.id);
    } catch (e) {
      e.message = '500';
    }

    const media = await user.getMedia(mediaId);
    const link = await user.getMedia(linkId);

    if (!media || !link) {
      return next(new Error('404'));
    }

    await media.createLink(link._id);

    return res.json(new Reply(200, 'success', false, null));
  }

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
    // return next(new Error('501'));

    let user: IUser;
    try {
      user = await userController.get(res.locals.user.id);
    } catch (e) {
      e.message = '500';
    }

    let media: IMedia[];
    try {
      media = await user.getAllMedia();
    } catch (e) {
      e.message = '500';
    }

    return res.json(new Reply(200, 'success', false, media));
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
    if (res.locals.error) {
      return next(new Error(`${res.locals.error}`));
    }

    let user: IUser;
    try {
      user = await userController.get(res.locals.user.id);
    } catch (e) {
      e.message = '500';
      return next(e);
    }

    if (req.file === undefined) {
      return next(new Error('400'));
    }

    const mimetype = req.file.mimetype;
    const ext = req.file.originalname.split('.')[req.file.originalname.split('.').length - 1];

    let imagePath: string;
    let media: IMedia;
    try {
      imagePath = await mediaController.storeMedia(
        req.file.path,
        req.file.originalname,
        ext,
        user._id,
      );
      media = await mediaController.store({
        mimetype,
        user,
        path: imagePath,
        era: <string>req.headers['era'] || 'past',
        locket: <string>req.headers['locket'] || 'none',
      });
    } catch (e) {
      e.message = '500';
      return next(e);
    }

    return res.json(new Reply(200, 'success', false, media));
  }

  /**
   * Update media
   * @param {e.Request} req
   * @param {e.Response} res
   * @param {e.NextFunction} next
   * @returns {Promise<void | e.Response> | void}
   */
  update(req: Request, res: Response, next: NextFunction): Promise<void | Response> | void {
    return next(new Error('501'));
  }

  constructor() {
    super();
    this.setFileUploadHandler(upload.single('file'));
    this.addMiddleware(checkToken);
    this.addRoute('/links/:id', Methods.GET, this.getLinks);
    this.addRoute('/links', Methods.POST, this.storeLink);
    this.addRoute('/request', Methods.GET, this.getPresent);
    this.addDefaultRoutes();
  }
}
