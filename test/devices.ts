import {describe} from "mocha";
import Axios, {AxiosResponse} from "axios";
import {URL} from "./commons";
import {generateToken} from "../web/controllers/auth";
import {destroyUser, storeUser} from "../web/controllers/user";
import {IUser} from "../web/schemas/user";
import {expect} from "chai"
import {destroyDevice, storeDevice} from "../web/controllers/device";
import {IDevice} from "../web/schemas/device";

let user: IUser
let token: string

describe('Devices', function () {
  let device1: IDevice
  let device2: IDevice
  const dummyMAC: string = '02:00:00:00:00:00'

  before(async () => {
    const username: string = 'tester-middleware'
    const password: string  = 'secret'

    user = await storeUser(username, password)
    token = await generateToken(user)
  })

  after (async () => {
    await destroyDevice(user._id, device2._id)
    await destroyUser(user._id)
  })

  describe('Add a device', function () {
    it('Should store a devices MAC address', function (done) {
      const deviceData = {
        mac: dummyMAC
      }
      Axios.post(`${URL}/api/devices/add`, deviceData, {headers: {'x-access-token': token}}).then((response: AxiosResponse) => {
        expect(response.status).to.equal(200)
        device1 = response.data.payload
        done()
      })
    })
  })

  describe('Pair devices', function () {
    before(async function () {
      device2 = await storeDevice(user._id, '03:00:00:00:00:00')
    })
    it('Should pair two devices', function (done) {
      const deviceData = {
        device1: device1._id,
        device2: device2._id
      }

      Axios.post(`${URL}/api/devices/pair`, deviceData, {headers: {'x-access-token': token}}).then((response: AxiosResponse) => {
        expect(response.status).to.equal(200)
        done()
      })
    })
  })

  describe('Destroy device', function () {
    it('Should destroy a device', function (done) {
      Axios.delete(`${URL}/api/devices/destroy/${device1._id}`, {headers: {'x-access-token': token}}).then((response: AxiosResponse) => {
        expect(response.status).to.equal(200)
        done()
      })
    })
  })
})