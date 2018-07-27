import {expect} from 'chai'
import {describe} from 'mocha'

import {IUser} from '../web/schemas/user'
import {destroyUser, storeUser} from "../web/controllers/user"
import {generateToken} from "../web/controllers/auth"
import {IDevice} from "../web/schemas/device"
import {IPair} from "../web/schemas/pair"
import {createPair, destroyDevice, storeDevice} from "../web/controllers/device"
import Axios, {AxiosError, AxiosResponse} from "axios"
import {URL} from "./commons"

let user: IUser
let token: string
let device1: IDevice
let device2: IDevice
let pair: IPair

describe('Display', function () {

  before(async () => {
    const username: string = 'tester-display'
    const password: string  = 'secret'

    user = await storeUser(username, password)
    token = await generateToken(user)

    device1 = await storeDevice(user._id, '1')
    device2 = await storeDevice(user._id, '2')

    pair = await createPair(user._id, device1._id, device2._id)
  })

  after(async () => {
    await destroyUser(user._id)

    await destroyDevice(user._id, device1._id)
    await destroyDevice(user._id, device2._id)
  })

  describe('Record media', function ()  {
    it('Should record device display', function (done) {
      const deviceData = {
        mediaId: 1,
        id: device1._id
      }
      Axios.post(`${URL}/api/media/display/store`, deviceData, {headers: {'x-access-token': token}}).then((response: AxiosResponse) => {
        expect(response.status).to.equal(200)
        done()
      }).catch((error: AxiosError) => {
        throw error
      })
    })
  })
  //
  // describe('Get media', function () {
  //   it('Should get the media id to display on device', function (done) {
  //     Axios.get(`${URL}/api/media/display/${device2._id}`, {headers: {'x-access-token': token}}).then((response: AxiosResponse) => {
  //       expect(response.status).to.equal(200)
  //       done()
  //     })
  //   })
  // })

  // describe('Get paired media', function () {
  //   it('Should return the semantic pair of a media item', function () {
  //     // const
  //   })
  // })
})
