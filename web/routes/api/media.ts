import { NextFunction, Request, Response, Router } from 'express';
import * as multer from 'multer';
import { MediaController } from '../../controllers/media';
import { checkToken } from '../../middleware/authenticate';
import { IUser } from '../../schemas/user';
import { UserController } from '../../controllers/user';
import { Reply } from '../../reply';
import { IMedia } from '../../schemas/media';
import { Schema } from 'mongoose';
import { SessionController } from '../../controllers/session';
import { ISession } from '../../schemas/session';
import * as jwt from 'jsonwebtoken';

const upload = multer({ dest: 'uploads/' });
const mediaController: MediaController = new MediaController();
const sessionController: SessionController = new SessionController();
const userController: UserController = new UserController();

let router: Router;

export const mediaRouter = () => {
  router = Router();

  /**
   * Get an item of media by id
   */
  router.get('/show/:id/:token', async (req: Request, res: Response, next: NextFunction) => {
    const token : string = req.params.token;
    const mediaId: Schema.Types.ObjectId = req.params.id;
    let rawUser: any = null;
    let user: IUser;
    let media: IMedia;

    if (token) {
      jwt.verify(token, process.env.SECRET, (err: Error, user: IUser) => {
        if (err) {
          return next(new Error('401'));
        }
        rawUser = user;
      });
    } else {
      return next(new Error('401'));
    }

    try {
      user = await userController.get(rawUser.id);
      media = await user.getMedia(mediaId);
    } catch (e) {
      e.message = '500';
      return next(e);
    }

    if (!media) {
      return next(new Error('404'));
    }

    try {
      return res.sendFile(media.path);
    } catch (e) {
      return next(new Error('404'));
    }
  });

  router.use(checkToken);

  /**
   * Upload media
   */
  router.post('/upload', upload.single('file'), async (req: Request,
                                                       res: Response,
                                                       next: NextFunction) => {
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
      imagePath = await mediaController.storeMedia(req.file.path, req.file.originalname, ext);
      media = await mediaController.store({
        mimetype,
        user,
        path: imagePath,
        era: <string>req.headers['era'] || 'past',
      });
    } catch (e) {
      e.message = '500';
      return next(e);
    }

    return res.json(new Reply(200, 'success', false, media));
  });

  /**
   * Get paired media
   */
  router.get('/links/:id', async (req: Request, res: Response, next: NextFunction) => {
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
  });

  /**
   * Store a link between two media items
   */
  router.post('/link/store', async (req: Request, res: Response, next: NextFunction) => {
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
  });

  /**
   * Return a present piece of media and return a new sessionSava
   */
  router.get('/request/present', async (req: Request, res: Response, next: NextFunction) => {
    if (res.locals.error) {
      return next(new Error(`${res.locals.error}`));
    }

    let user: IUser;
    let media: IMedia;

    try {
      user = await userController.get(res.locals.user.id);
    } catch (e) {
      e.message = '500';
      return next(e);
    }

    try {
      media = await mediaController.getRandomPresentMedia(user._id);
    } catch (e) {
      e.message = '500';
      return next(e);
    }

    if (!media) {
      return next(new Error('404'));
    }

    try {
      await sessionController.store({ media, user: user._id });
    } catch (e) {
      return next(e);
    }

    return res.json(new Reply(200, 'success', false, media._id));
  });

  router.get('/request/past', async (req: Request, res: Response, next: NextFunction) => {
    if (res.locals.error) {
      return next(new Error(`${res.locals.error}`));
    }

    let user: IUser;
    let media: IMedia;
    let session: ISession;

    try {
      user = await userController.get(res.locals.user.id);
    } catch (e) {
      e.message = '500';
      return next(e);
    }

    try {
      session = await sessionController.getLastSession(user);
    } catch (e) {
      e.message = '500';
      return next(e);
    }

    if (session) {
      try {
        media = await mediaController.getLinkedPastMedia(session.media);
        if (media) {
          return res.json(new Reply(200, 'success', false, media._id));
        }

        return res.json(new Reply(200, 'success', false, null));

      } catch (e) {
        console.log(e);
        e.message = '500';
        return next(e);
      }
    }

    try {
      media = await mediaController.getRandomPresentMedia(user._id);
      await sessionController.store({ media, user: user._id });

      media = await mediaController.getLinkedPastMedia(session.media);

      return res.json(new Reply(200, 'success', false, media._id));
    } catch (e) {
      // console.log(e)
      e.message = '500';
      return next(e);
    }
  });

  return router;
};
