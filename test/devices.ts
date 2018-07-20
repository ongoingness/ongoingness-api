import {describe} from "mocha";
import Axios, {AxiosResponse} from "axios";
import {URL} from "./commons";
import {generateToken} from "../web/controllers/auth";
import {destroyUser, storeUser} from "../web/controllers/user";
import {IUser} from "../web/schemas/user";
import {expect} from "chai"

let user: IUser
let token: string

describe('Devices', function () {
  let device1Id: string = ''
  let device2Id: string = ''
  const dummyMAC: string = '02:00:00:00:00:00'

  before(async () => {
    const username: string = 'tester-middleware'
    const password: string  = 'secret'

    user = await storeUser(username, password)
    token = await generateToken(user)
  })

  after (async () => {
    await destroyUser(user._id)
  })

  describe('Add a device', function () {
    it('Should store a devices MAC address', function (done) {
      const deviceData = {
        mac: dummyMAC
      }
      Axios.post(`${URL}/api/devices/add`, deviceData, {headers: {'x-access-token': token}}).then((response: AxiosResponse) => {
        expect(response.status).to.equal(200)
        device1Id = response.data.payload._id
        done()
      })
    })
  })

  describe('Pair devices', function () {
    before(async function () {
      const deviceData = {
        mac: '03:00:00:00:00:00'
      }
      const response: AxiosResponse = await Axios.post(`${URL}/api/devices/add`, deviceData, {headers: {'x-access-token': token}})
      device2Id = response.data.payload._id
    })
    it('Should pair two devices', function (done) {
      const deviceData = {
        device1: device1Id,
        device2: device2Id
      }

      Axios.post(`${URL}/api/devices/pair`, deviceData, {headers: {'x-access-token': token}}).then((response: AxiosResponse) => {
        expect(response.status).to.equal(200)
        done()
      })
    })
  })

  describe('Destroy device', function () {
    it('Should destroy a device', function (done) {
      Axios.delete(`${URL}/api/devices/destroy/${device1Id}`, {headers: {'x-access-token': token}}).then((response: AxiosResponse) => {
        expect(response.status).to.equal(200)
        done()
      })
    })
  })

  after(async function () {
    await Axios.delete(`${URL}/api/devices/destroy/${device2Id}`, {headers: {'x-access-token': token}})
    await Axios.delete(`${URL}/api/user/destroy`, {headers: {'x-access-token': token}})
  })
})