import {destroyUser, storeUser} from "../web/controllers/user";
import {IUser} from "../web/schemas/user";
import {
  destroyMedia,
  getLinkedPastMedia,
  getRandomPresentMedia,
  storeMedia,
  storeMediaRecord,
  addEmotionsToMedia
} from "../web/controllers/media";
import * as path from "path";
import * as fs from "fs";
import {expect} from 'chai'
import {promisify} from "util";
import * as FormData from 'form-data'
import Axios, {AxiosError, AxiosResponse} from "axios";
import {generateToken} from "../web/controllers/auth";
import {describe} from "mocha";
import {destroyDevice, storeDevice} from "../web/controllers/device";
import {IDevice} from "../web/schemas/device";
import {IMedia} from "../web/schemas/media";
import {ISession} from "../web/schemas/session";
import {storeSession} from "../web/controllers/session";

const rename = promisify(fs.rename)
const URL: string = 'http://localhost:8888'
let user: IUser
let testFilePath: string
let token: string
let device1: IDevice
let device2: IDevice
let media: IMedia

describe('Media', function () {
  before(async () => {
    const username: string = 'tester-media'
    const password: string  = 'secret'

    user = await storeUser(username, password)
    token = await generateToken(user)

    device1 = await storeDevice(user._id, '1')
    device2 = await storeDevice(user._id, '2')

    const filepath: string = await storeMedia(path.join(__dirname, '../../test.jpg'), 'test.jpg', 'jpg')
    media = await storeMediaRecord(filepath, 'image/jpeg', user)

    fs.createReadStream(media.path).pipe(fs.createWriteStream(path.join(__dirname, '../../test.jpg')));
  })

  after (async () => {
    await destroyDevice(user._id, device1._id)
    await destroyDevice(user._id, device2._id)

    await rename(media.path, path.join(__dirname, '../../test.jpg'))
    await destroyMedia(media._id)

    await destroyUser(user._id)
  })

  describe('Store media', function () {
    it('Should store a file in the uploads folder', function (done) {
      storeMedia(path.join(__dirname, '../../test.jpg'), 'test.jpg', 'jpg').then((filepath) => {
        testFilePath = filepath
        expect(fs.existsSync(filepath)).to.be.true
        done()
      })
    })

    after (async () => {
      await rename(testFilePath, path.join(__dirname, '../../test.jpg'))
    })
  })

  describe('Attach emotions to media', function () {
    describe('Store emotions', function() {
      it('Should store emotion string on media', function (done) {
        const emotions = 'happy,accepted,valued'
        addEmotionsToMedia(media._id, emotions).then((media: IMedia) => {
          expect(media.emotions).to.include(emotions)
          done()
        })
      })
    })

    describe('Reject emotions in wrong format', function () {
      it('Should throw an error for emotions being in wrong format', function (done) {
        const emotions = 'happy,accepted-valued'
        addEmotionsToMedia(media._id, emotions)
        .then((media: IMedia) => {})
        .catch((error) => {
          expect(error.message).to.equal('Emotions must be three words separated by commas')
          done()
        })
      })
    })
  })

  // https://stackoverflow.com/questions/43013858/ajax-post-a-file-from-a-form-with-axios
  describe('Upload media', function () {
    it('Should post and store data', function (done) {
      let formData = new FormData()
      const file = fs.createReadStream(path.join(__dirname, '../../test.jpg'))
      formData.append("file", file)

      Axios.post(`${URL}/api/media/upload`, formData, {
        headers: {
         'Content-Type': `multipart/form-data; boundary=${formData.getBoundary()}`,
          'x-access-token': token
        }
      }).then((response: AxiosResponse) => {
        expect(response.status).to.equal(200)
        expect(fs.existsSync(response.data.payload.path)).to.be.true
        done()
      }).catch((error: AxiosError) => {
        console.log(error)
        throw error
      })
    })
  })

  describe('Record media', function ()  {
    it('Should record device display', function (done) {
      const deviceData = {
        mediaId: media._id,
        deviceId: device1._id
      }
      Axios.post(`${URL}/api/media/display/store`, deviceData, {headers: {'x-access-token': token}})
        .then((response: AxiosResponse) => {
          expect(response.status).to.equal(200)
          done()
      })
    })
  })

  describe('Get linked media', function () {
   it('Should get the media id to display on device', function (done) {
     Axios.get(`${URL}/api/media/links/${media._id}`, {headers: {'x-access-token': token}})
       .then((response: AxiosResponse) => {
          expect(response.status).to.equal(200)
          done()
     })
   })
  })

  describe('Store a semantic link between media items', function () {
    let newMedia: IMedia
    before(async function () {
      newMedia = await storeMediaRecord('path', 'image/jpeg', user, 'present')
    })
    after(async function () {
      await destroyMedia(newMedia._id)
    })
    it('should store a semantic link', function (done) {
      const linkData = {
        mediaId: media._id,
        linkId: newMedia._id
      }

      console.log(linkData)

      Axios.post(`${URL}/api/media/link/store`, linkData, {headers: {'x-access-token': token}})
        .then((response: AxiosResponse) => {
          expect(response.status).to.equal(200)
          done()
        })
    })
  })

  describe('Request media', function() {
    let record1: IMedia
    let record2: IMedia
    let record3: IMedia
    before(async () => {
      record1 = await storeMediaRecord('testpath', 'image/jpeg', user, 'past')
      record2 = await storeMediaRecord('testpath', 'image/jpeg', user, 'present')
      record3 = await storeMediaRecord('testpath', 'image/jpeg', user, 'present')

      await record2.createLink(record1._id)
    })

    after(async () => {
      await destroyMedia(record1._id)
      await destroyMedia(record2._id)
      await destroyMedia(record3._id)
    })

    describe('Get random present media', function () {
      it('Should return a random media item of the present era', function (done) {
        getRandomPresentMedia(user._id).then((media: IMedia) => {
          expect(`${media.user}`).to.equal(`${user._id}`)
          done()
        })
      })
    })

    describe('Create a media session', function () {
      it('Should create a session storing current present media for user', function (done) {
        storeSession(user, record2).then((session: ISession) => {
          expect(`${session.user}`).to.equal(`${user._id}`)
          done()
        })
      })
    })

    describe('Reject a past media session', function () {
      it('Should reject a session storing current past media for user', function (done) {
        storeSession(user, record1).then((session: ISession) => {
          console.log(session)
        }).catch((e) => {
          expect(e.message).to.equal('Media must be of the present to start a session')
          done()
        })
      })
    })

    describe ('Get present media from API', function () {
      it('API should create a session and return a media id', function (done) {
        Axios.get(`${URL}/api/media/request/present`, {headers: {'x-access-token': token}})
          .then((response: AxiosResponse) => {
            expect(response.status).to.equal(200)
            done()
        })
      })
    })

    describe('Get a past image from the session', function () {
      it('Should return media linked to an image from the past', function (done) {
        getLinkedPastMedia(record2._id).then((media: IMedia) => {
          expect(record2.links).contain(`${media._id}`)
          done()
        })
      })
    })

    describe('Get past media from API', function () {
      it('Should return a media id of a linked image from the past', function (done) {
        Axios.get(`${URL}/api/media/request/past`, { headers: { 'x-access-token': token } })
          .then(( response: AxiosResponse ) => {
            expect(response.status).to.equal(200)
            done()
        })
      })
    })
  })
})
