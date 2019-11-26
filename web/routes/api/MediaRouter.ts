import { NextFunction, Request, Response, Router } from 'express';
import * as multer from 'multer';
import { MediaRepository } from '../../repositories/MediaRepository';
import { checkToken } from '../../middleware/Authenticate';
import { IUser } from '../../schemas/User';
import { Reply } from '../../Reply';
import { IMedia } from '../../schemas/Media';
import { Schema } from 'mongoose';
import { SessionRepository } from '../../repositories/SessionRepository';
import { HttpMethods } from '../../HttpMethods';
import { IResourceRepository } from '../../repositories/IResourceRepository';
import RepositoryFactory from '../../repositories/RepositoryFactory';
import IResourceRouter from '../IResourceRouter';
import { BaseRouter } from '../BaseRouter';
import MediaController from '../../controllers/MediaController';
import { GraphAdaptor } from '../../repositories/GraphAdaptor';
import ResourceRouterFactory from '../ResourceRouterFactory';
import Logger from '../../Logger';
import { LogType } from '../../LogHelper';
import CryptoHelper from '../../CryptoHelper';

const upload = multer({ dest: 'uploads/' });
const mediaRepository: MediaRepository = new MediaRepository();
const sessionController: SessionRepository = new SessionRepository();
const userRepository: IResourceRepository<IUser> = RepositoryFactory.getRepository('user');
const mime = require('mime-types');

var previousAccess = new Map();

export class MediaRouter
  extends BaseRouter
  implements IResourceRouter<IMedia> {

    

  /**
   * Destroy media
   * 
   * @param {e.Request} req
   * @param {e.Response} res
   * @param {e.NextFunction} next
   * @returns {Promise<void | e.Response> | void}
   */
  async destroy(req: Request, res: Response, next: NextFunction): Promise<void | Response> {
    const mediaId: any = req.params.id;

   try{
     let ga = new GraphAdaptor();
     await ga.delete_media(res.locals.user.id, mediaId);
   }
   catch(e)
   {
     return(e);
   }

    Logger.log(LogType.DEL_MEDIA, {user: res.locals.user.id, media: mediaId})

    return res.json(new Reply(200, 'success', false, null));
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
    
    //AWFUL
    req.setTimeout(1000000, () => {next(new Error("Timeout"))});

    const mediaId: any = req.params.id;
    const rsize: string = req.query.size;
    let size: number;
    const defaultSize: number = 600;
    const maxSize: number = 1024;
    const minSize: number = 100;
    const mediaController: MediaController = new MediaController();
    let user: IUser;
    let media: any;

    // Sanitize size.
    if (rsize) {
      if (/\D+/g.test(rsize)) {
        size = defaultSize;
      } else {
        size = parseInt(rsize, 10);
        if (size > maxSize) size = maxSize;
        if (size < minSize) size = minSize;
      }
    } else {
      size = defaultSize;
    }

    if (res.locals.error) {
      return next(new Error(`${res.locals.error}`));
    }

    try {
      let ga = new GraphAdaptor();
      media = await ga.get_media_item(res.locals.user.id,mediaId,1);

    } catch (e) {
      e.message = '500';
      return next(e);
    }

    if (!media) {
      return next(new Error('404'));
    }

    let data: any;

    try {
      data = await mediaController.getMediaFromS3(media, size);
    } catch (e) {
      return next(new Error('500'));
    }

    res.writeHead(200, { 'Content-Type': media.mimetype });
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
    const mediaId: Schema.Types.ObjectId = new Schema.Types.ObjectId(req.params.id);
    let media: IMedia;
    try {
      media = await mediaRepository.get(mediaId);
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
    const mediaController: MediaController = new MediaController();
    let user: IUser;
    let media: IMedia;

    if (res.locals.error) {
      return next(new Error(`${res.locals.error}`));
    }

    try {
      const userId: Schema.Types.ObjectId = res.locals.user.id;
      user = await userRepository.get(userId);
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
   * Returns media from the user's specified collection.
   */
  async getCollectionMedia(req: Request, res: Response, next: NextFunction): Promise<void | Response> {
    try {
      const userId: any = res.locals.user.id;
      const collectionName : string = req.query.collection;
      let ga = new GraphAdaptor();
      
      var results = await ga.get_collection_media(userId,collectionName,[],-1,0,1);

      return res.json(results);
    }
    catch(e){
      return res.json(e);
    }
  }

  /**
   * 
   * Get linked media, based on inferred links from any tag, place, person or time.
   * 
   * @param req 
   * @param res 
   * @param next 
   */
  async getInferredLinkedMedia(req: Request, res: Response, next: NextFunction): Promise<void | Response> {
    try {
      const userId: any = res.locals.user.id;
      const mediaId: string = req.query.mediaId;
      const numResults: number = req.query.numResults;
      let ga = new GraphAdaptor();

      var results = await ga.get_related_media_all(mediaId, [], numResults, 0);
      return res.json(results);
    }
    catch(e){
      return res.json(e);
    }
  }

  /**
   * 
   * Get linked media, based on inferred links from any tag, place, person or time. Weights value of results, 
   * and splits results across 
   * 
   * @param req 
   * @param res 
   * @param next 
   */
  async getInferredLinkedMedia_Weighted(req: Request, res: Response, next: NextFunction): Promise<void | Response> {
    try {      
      
      const userId: any = res.locals.user.id;
      let mediaId: string = req.query.mediaId;
      const drawIfNew: number = req.query.drawIfNew

      let ga = new GraphAdaptor();

      let draw: boolean = true


      var access = previousAccess.get(res.locals.user.id);
      var currentTime = Date.now()
      previousAccess.set(res.locals.user.id, currentTime)

      if(access != null) {
        console.log(Math.abs(access - currentTime))
        if(Math.abs(access - currentTime) < 10000) {
          draw = false;
        }
      }

      var presentMedia = await ga.get_collection_media(userId, "present", [], -1)
      var payload = (presentMedia as any).payload
      if(payload.length == 0) draw = false

      if(draw) {
        if(drawIfNew == 1) {
          if(payload[payload.length-1]._id != mediaId)
            mediaId = payload[payload.length-1]._id
          else
            draw = false
        } else if(drawIfNew == 0) {
          try {
            await ga.get_media_item(userId, mediaId) as any
          } catch(e) {
            draw = false;
          }   
        }
      }
      let results : any = [];

      if(draw) {
        //Weights for individual types (tags,people etc) can be set, to prioritise one kind of link over another. All set to 1.0 for now.
        results = await ga.get_related_media_all_weighted(mediaId, [], -1, 1,0,1.0,1.0,1.0,1.0);

        //remove the images from the present collection
        let past_results = []
        for(var i = 0; i < results.payload.length; i++) {
          let collection = await ga.get_media_collections(results.payload[i].id, null, -1, 0, 1) as any;
          if(collection[0].name == 'past') {
            past_results.push(results.payload[i]);
          }
        }
 
        let max = past_results.length;
        let temp_payload : any = [];

        //This needs refining, currently expects to return 5 images based on the specified image ID
        if(max > 5)
        {
          //Will pick one image from the lower 20% 
          let rand1 = Math.floor((Math.random()*((max*0.2)-1+1)+1));

          //Will pick two images from the middle 40 percent
          let rand2 = Math.floor((Math.random()*((max*0.6)-(max*0.2)+1)+(max*0.2)));
          let rand3 = Math.floor((Math.random()*((max*0.6)-(max*0.2)+1)+(max*0.2)));

          //Will pick two images from the 'top' 40 percent.
          let rand4 = Math.floor((Math.random()*((max)-(max*0.6)+1)+(max*0.6)));
          let rand5 = Math.floor((Math.random()*((max)-(max*0.6)+1)+(max*0.6)));

          let media = await ga.get_media_item(userId, mediaId) as any

          temp_payload.push(media.payload)
          temp_payload.push(past_results[rand1]);
          temp_payload.push(past_results[rand2]);
          temp_payload.push(past_results[rand3]);
          temp_payload.push(past_results[rand4]);
          temp_payload.push(past_results[rand5]);

          results.payload = temp_payload;

          Logger.log(LogType.GET_INF_MEDIA, {media: results.payload, user: userId})

        }
      } else {
        Logger.log(LogType.GET_INF_MEDIA, {media: results, user: userId})
      }

      return res.json(results);
    }
    catch(e){
      return res.json(e);
    }
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
      user = await userRepository.get(res.locals.user.id);
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
    let ga = new GraphAdaptor();
    try {
      user = await userRepository.get(res.locals.user.id);
    } catch (e) {
      e.message = '500';
    }

    let media : any = [];
    try {
      media = await ga.get_account_media(user._id,[],-1,0,1);
      Logger.log(LogType.GET_ALL_MEDIA, {user: user._id});
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
    req.setTimeout(1000000, () => {next(new Error("Timeout"))});

    let mimetype
    if(req.file.mimetype.includes("video") || req.file.mimetype == "application/octet-stream") {
      mimetype = "image/gif"
    } else {
      mimetype = req.file.mimetype
    }

    const ext = req.file.originalname.split('.')[req.file.originalname.split('.').length - 1];
    const mediaController: MediaController = new MediaController();
    let user: IUser;
    let imagePath: string;
    let media: any;

    const emotionArray: string = req.headers['emotions'] as string;
    const emotions: string[] = emotionArray === undefined ? [] : emotionArray.split(',') || [];
    
    if (res.locals.error) {
      return next(new Error(`${res.locals.error}`));
    }

    try {
      user = await userRepository.get(res.locals.user.id);
    } catch (e) {
      e.message = '500';
      return next(e);
    }

    if (req.file === undefined) {
      return next(new Error('400'));
    }

    try {

      //This stores the actual media
      imagePath = await mediaController.storeMedia(
        req.file.path,
        req.file.originalname,
        ext,
        user._id,
      );

      //Group 'emotions' into various tag groups
      var tags_array : string[] = [];
      var people_array : string[] = [];
      var places_array : string[] = [];
      var time_array: string[] = [];

      emotions.forEach( await (async(element : string) => {
        if(element.includes('p/')){
          //Place
          element = element.replace('p/','');
          places_array.push(element.trim().toLowerCase());
        }else if(element.includes('t/')){
          //Time
          element = element.replace('t/','');
          time_array.push(element.trim().toLowerCase());
        }else if(element.includes('@')){
          //People
          element = element.replace('@','');
          people_array.push(element.trim().toLowerCase());
        }else{
          //Tag
          element = element.replace('#', '');
          tags_array.push(element.trim().toLowerCase());
        }
      }));

     let ga = new GraphAdaptor();
     media = await ga.create_media_object(user._id,"'" + imagePath + "'","'" + mimetype + "'",req.headers['links'],tags_array,places_array,people_array,time_array,req.headers['locket'] as string);
    } catch (e) {       
      console.error(e);
      e.message = '500';
      return next(e);
    }

    try {
      let data = await mediaController.getMediaFromS3(media.payload, 600);
      let dataString = String(data);
      let dataHash = CryptoHelper.hashString(dataString);
      Logger.log(LogType.NEW_MEDIA, {user: user._id, hash: dataHash, media: media.payload})
    } catch (e) {
      console.log(e)
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

  async getTagSuggestions(req: Request, res: Response, next: NextFunction): Promise<void | Response> {
    try {
      const userId: any = res.locals.user.id;
      const term = req.query.term.toLowerCase();

      let ga = new GraphAdaptor();

      let results
      if(term.includes('t/')) {
        results = await ga.get_account_times(userId, [["value like '%" + term.replace('t/','') + "%'"]], 5)
      } else if(term.includes('@')) {
        results = await ga.get_account_people(userId, [["name like '%" + term.replace('@','') + "%'"]], 5)
      } else if(term.includes('p/')) {
        results = await ga.get_account_places(userId, [["name like '%" + term.replace('p/','') + "%'"]], 5)
      } else {
        results = await ga.get_account_tags(userId, ["name like '%" + term + "%'"], 5)
      }
      return res.json(results);
    }
    catch(e){
      return res.json(e);
    }
  }

  async getAllTags(req: Request, res: Response, next: NextFunction): Promise<void | Response> {
    try {
      const userId: any = res.locals.user.id;
      let ga = new GraphAdaptor();

      let results = {
        time:   ((await ga.get_account_times(userId, [], -1)) as any).payload ,
        people: ((await ga.get_account_people(userId, [], -1)) as any).payload,
        places: ((await ga.get_account_places(userId, [], -1)) as any).payload,
        tags:   ((await ga.get_account_tags(userId, [], -1)) as any).payload
      };
      
      return res.json(results);
    }
    catch(e){
      return res.json(e);
    }
  }

  constructor() {
    super();
    this.setFileUploadHandler(upload.single('file'));
    this.addMiddleware(checkToken);
    this.addRoute('/links/:id', HttpMethods.GET, this.getLinks);
    this.addRoute('/links', HttpMethods.POST, this.storeLink);
    this.addRoute('/request', HttpMethods.GET, this.getPresent);
    this.addRoute('/collectionMedia', HttpMethods.GET, this.getCollectionMedia);
    this.addRoute('/linkedMediaAll', HttpMethods.GET, this.getInferredLinkedMedia);
    this.addRoute('/linkedMediaAll_Weighted', HttpMethods.GET, this.getInferredLinkedMedia_Weighted);
    this.addRoute('/tags', HttpMethods.GET, this.getTagSuggestions);
    this.addRoute('/tagsall', HttpMethods.GET, this.getAllTags);

    this.addDefaultRoutes();
  }

  /**
   * Setup router
   * Add all default routes to router.
   */
  addDefaultRoutes(): void {
    this.router.get('/:id', this.show);
    this.router.delete('/:id', this.destroy);
    this.router.post('/update', this.update);
    this.router.get('/', this.index);

    if (this.fileUploadHandler) {
      this.router.post('/', this.fileUploadHandler, this.store);
    } else {
      this.router.post('/', this.store);
    }
  }

  paged(req: Request, res: Response, next: NextFunction): Promise<void | Response> | void {
    return undefined;
  }

  search(req: Request, res: Response, next: NextFunction): Promise<void | Response> | void {
    return undefined;
  }

  setRouter(router: Router): void {
    this.router = router;
  }
}
