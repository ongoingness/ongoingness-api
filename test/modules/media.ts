import { UserController } from '../../web/controllers/user';
import { IUser } from '../../web/schemas/user';
import { MediaController } from '../../web/controllers/media';
import * as path from 'path';
import * as fs from 'fs';
import { expect } from 'chai';
import * as FormData from 'form-data';
import axios, { AxiosError, AxiosResponse } from 'axios';
import { generateToken } from '../../web/controllers/auth';
import { describe } from 'mocha';
import { DeviceController } from '../../web/controllers/device';
import { IDevice } from '../../web/schemas/device';
import { IMedia } from '../../web/schemas/media';
import { ISession } from '../../web/schemas/session';
import { SessionController } from '../../web/controllers/session';
import { Schema } from 'mongoose';

const URL: string = 'http://localhost:8888';
let user: IUser;
let token: string;
let device1: IDevice;
let device2: IDevice;
let media: IMedia;
const deviceController: DeviceController = new DeviceController();
const mediaController: MediaController = new MediaController();
const sessionController: SessionController = new SessionController();
const userController: UserController = new UserController();

describe('Media', () => {
  const imagePath: string = path.join(__dirname, '../../../test.jpg');

  before(async () => {
    const username: string = 'random';
    const password: string  = 'secret';
    let filepath: string;

    user = await userController.store({ username, password });
    token = await generateToken(user);

    device1 = await deviceController.store({ owner: user._id, mac: '1' });
    device2 = await deviceController.store({ owner: user._id, mac: '2' });

    filepath = await mediaController.storeMedia(imagePath,
                                                'test.jpg',
                                                'jpg',
                                                user._id,
    );

    if (filepath) {
      media = await mediaController.store({
        user,
        path: filepath,
        mimetype: 'image/jpeg',
        era: 'past',
      });
    }
  });

  after(async () => {
    await deviceController.destroy(device1._id);
    await deviceController.destroy(device2._id);
    await mediaController.destroy(media._id);
    await userController.destroy(user._id);
  });

  describe('Store media',  () => {
    it('Should store a file in the uploads folder', (done) => {
      mediaController.storeMedia(imagePath, 'test.jpg', 'jpg', user._id).then((filepath) => {
        console.log(filepath);
        expect(filepath.length).to.be.greaterThan(1);
        done();
      });
    });
  });

  describe('Attach emotions to media',  () => {
    describe('Store emotions',  () => {
      it('Should store emotion string on media',  (done) => {
        const emotions = 'happy,accepted,valued';
        mediaController.addEmotionsToMedia(media._id, emotions).then((media: IMedia) => {
          expect(media.emotions).to.include(emotions);
          done();
        });
      });
    });

    describe('Reject emotions in wrong format',  () => {
      it('Should throw an error for emotions being in wrong format',  (done) => {
        const emotions = 'happy,accepted-valued';
        mediaController.addEmotionsToMedia(media._id, emotions)
        .then()
        .catch((error) => {
          expect(error.message).to.equal('Emotions must be three words separated by commas');
          done();
        });
      });
    });
  });

  describe('Link media by emotional tags',  () => {
    let media1: IMedia;
    let media2: IMedia;
    let media3: IMedia;
    before(async () => {
      media1 = await mediaController.store({
        user,
        path: 'test-path',
        mimetype: 'image/jpeg',
        era: 'past',
      });
      media2 = await mediaController.store({
        user,
        path: 'test-path',
        mimetype: 'image/jpeg',
        era: 'past',
      });
      media3 = await mediaController.store({
        user,
        path: 'test-path',
        mimetype: 'image/jpeg',
        era: 'past',
      });

      media1 = await mediaController.addEmotionsToMedia(media1._id, 'happy,accepted,valued');
      media2 = await mediaController.addEmotionsToMedia(media2._id, 'happy,content,joyful');
      media3 = await mediaController.addEmotionsToMedia(media3._id, 'happy,accepted,respected');

      media1.era = 'present';
      await media1.save();
    });

    after(async () => {
      await mediaController.destroy(media1._id);
      await mediaController.destroy(media2._id);
      await mediaController.destroy(media3._id);
    });

    it('Should return ids of matching media', (done) => {
      mediaController.getEmotionalLinks(media1).then((matches: Schema.Types.ObjectId[][]) => {
        expect(matches[0].length).to.equal(3);
        expect(matches[1].length).to.equal(2);
        expect(matches[2].length).to.equal(1);
        done();
      });
    });
  });

  // https://stackoverflow.com/questions/43013858/ajax-post-a-file-from-a-form-with-axios
  describe('Upload media', () => {
    it('Should post and store data', (done) => {
      const formData = new FormData();
      const file = fs.createReadStream(imagePath);
      formData.append('file', file);

      axios.post(`${URL}/api/media`, formData, {
        headers: {
          'Content-Type': `multipart/form-data; boundary=${formData.getBoundary()}`,
          'x-access-token': token,
        },
      }).then((response: AxiosResponse) => {
        expect(response.status).to.equal(200);
        done();
      }).catch((error: AxiosError) => {
        console.log(error);
        throw error;
      });
    });
  });

  describe('Get all media', () => {
    it('Should return all media belonging to the user', (done) => {
      axios.get(`${URL}/api/media`, { headers: { 'x-access-token': token } })
      .then((response: AxiosResponse) => {
        expect(response.status).to.equal(200);
        done();
      })
    });
  });

  describe('Get linked media', () => {
    it('Should get the media id to display on device', (done) => {
      axios.get(`${URL}/api/media/links/${media._id}`, { headers: { 'x-access-token': token } })
       .then((response: AxiosResponse) => {
         expect(response.status).to.equal(200);
         done();
       });
    });
  });

  describe('Store a semantic link between media items', () => {
    let newMedia: IMedia;
    before(async () => {
      newMedia = await mediaController.store({
        user,
        path: 'path',
        mimetype: 'image/jpeg',
        era: 'present',
      });
    });
    after(async () => {
      await mediaController.destroy(newMedia._id);
    });
    it('should store a semantic link', (done) => {
      const linkData = {
        mediaId: media._id,
        linkId: newMedia._id,
      };

      axios.post(`${URL}/api/media/links`, linkData, { headers: { 'x-access-token': token } })
        .then((response: AxiosResponse) => {
          expect(response.status).to.equal(200);
          done();
        });
    });
  });

  describe('Request media', () => {
    let record1: IMedia;
    let record2: IMedia;
    let record3: IMedia;

    before(async () => {
      record1 = await mediaController.store({
        user,
        path: 'testpath',
        mimetype: 'image/jpeg',
        era: 'past',
      });
      record2 = await mediaController.store({
        user,
        path: 'testpath',
        mimetype: 'image/jpeg',
        era: 'present',
      });
      record3 = await mediaController.store({
        user,
        path: 'testpath',
        mimetype: 'image/jpeg',
        era: 'present',
      });

      await record2.createLink(record1._id);
    });

    after(async () => {
      await mediaController.destroy(record1._id);
      await mediaController.destroy(record2._id);
      await mediaController.destroy(record3._id);
    });

    describe('Get random present media', () => {
      it('Should return a random media item of the present era', (done) => {
        mediaController.getRandomPresentMedia(user._id).then((media: IMedia) => {
          expect(`${media.user}`).to.equal(`${user._id}`);
          done();
        });
      });
    });

    describe('Create a media session', () => {
      it('Should create a session storing current present media for user', (done) => {
        sessionController.store({ user: user._id, media: record2 }).then((session: ISession) => {
          expect(`${session.user}`).to.equal(`${user._id}`);
          done();
        });
      });
    });

    describe('Reject a past media session', () => {
      it('Should reject a session storing current past media for user', (done) => {
        sessionController.store({ user: user._id, media: record1 }).then((session: ISession) => {
          console.log(session);
        }).catch((e) => {
          expect(e.message).to.equal('Media must be of the present to start a session');
          done();
        });
      });
    });

    describe('Get present media from API', () => {
      it('API should create a session and return a media id', (done) => {
        axios.get(`${URL}/api/media/request`, { headers: { 'x-access-token': token } })
          .then((response: AxiosResponse) => {
            expect(response.status).to.equal(200);
            done();
          });
      });
    });

    describe('Get a past image from the session', () => {
      it('Should return media linked to an image from the past', (done) => {
        mediaController.getLinkedPastMedia(record2._id).then((media: IMedia) => {
          expect(record2.links).contain(`${media._id}`);
          done();
        });
      });
    });
  });
});
