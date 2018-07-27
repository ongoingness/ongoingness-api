import {destroyUser, storeUser} from "../web/controllers/user";
import {IUser} from "../web/schemas/user";
import {destroyMedia, storeMedia, storeMediaRecord} from "../web/controllers/media";
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
      Axios.post(`${URL}/api/media/display/store`, deviceData, {headers: {'x-access-token': token}}).then((response: AxiosResponse) => {
        expect(response.status).to.equal(200)
        done()
      }).catch((error: AxiosError) => {
        throw error
      })
    })
  })

   describe('Get linked media', function () {
     it('Should get the media id to display on device', function (done) {
       Axios.get(`${URL}/api/media/links/${media._id}`, {headers: {'x-access-token': token}}).then((response: AxiosResponse) => {
         expect(response.status).to.equal(200)
         done()
       })
     })
   })
})
