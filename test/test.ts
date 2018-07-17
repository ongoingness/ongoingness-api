import {expect} from 'chai'
import {describe} from 'mocha'
import {App} from "../web/server"
import Axios, {AxiosError, AxiosResponse} from 'axios'
import {Server} from 'http'

let server: Server
const URL: string = 'http://localhost:8888'
let token: string

describe('api', function () {
  // let server = null
  before(function () {
    const port: number = 8888
    process.env.TEST = 'true'

    try {
      server = new App().express.listen(port)
    } catch (e) {
      console.error(e)
    }
  })

  after(async function () {
    await server.close()
  })

  // For the home routes.
  describe('Home', function () {
    // Test the landing page renders
    describe('Render', function () {
      it("Should return the home page from '/'", function (done) {
        Axios.get(`${URL}/`).then((response: AxiosResponse) => {
          expect(response.status).to.equal(200)
          done()
        })
      })
    })
  })

  describe('Auth', function () {
    describe('Register', function () {
      it("Should register a user and return a token", function (done) {
        const userData = {
          username: 'tester',
          password: 'secret'
        }
        Axios.post(`${URL}/api/auth/register`, userData).then((response: AxiosResponse) => {
          expect(response.data.payload.token).to.have.length.above(10)
          done()
        })
      })
    })

    describe('Rejects creating existing account', function () {
      it("Should prevent the user from creating an account with an existing username", function (done) {
        const userData = {
          username: 'tester',
          password: 'secret'
        }
        Axios.post(`${URL}/api/auth/register`, userData).then(() => {
        }).catch((error: AxiosError) => {
          expect(error.response.status).to.equal(403)
          done()
        })
      })
    })

    describe('Authenticate', function () {
      it("Should return a JWT token", function (done) {
        const userData = {
          username: 'tester',
          password: 'secret'
        }
        Axios.post(`${URL}/api/auth/authenticate`, userData).then((response: AxiosResponse) => {
          expect(response.data.payload.token).to.have.length.above(10)
          token = response.data.payload.token

          done()
        })
      })
    })

    describe('Reject incorrect password', function () {
      it("Should reject request if invalid password is given", function (done) {
        const userData = {
          username: 'tester',
          password: 'password'
        }
        Axios.post(`${URL}/api/auth/authenticate`, userData).then(() => {
        }).catch((error: AxiosError) => {
          expect(error.response.status).to.equal(401)
          done()
        })
      })
    })

    describe('Reject incorrect username', function () {
      it("Should reject request if invalid username is given", function (done) {
        const userData = {
          username: 'tester1',
          password: 'secret'
        }
        Axios.post(`${URL}/api/auth/authenticate`, userData).then(() => {
        }).catch((error: AxiosError) => {
          expect(error.response.status).to.equal(401)
          done()
        })
      })
    })
  })

  describe('Middleware', function () {
    describe('Authentication', function () {
      describe('Require token', function () {
        it("Should reject request if no token is given", function (done) {
          Axios.get(`${URL}/api/user/me`).then(() => {
          }).catch((error) => {
            expect(error.response.status).to.equal(401)
            done()
          })
        })
      })

      describe('Check token is valid', function () {
        it("Should reject request if the token is invalid", function (done) {
          const invToken = `${token}0`
          Axios.get(`${URL}/api/user/me`, {headers: {'x-access-token': invToken}}).then(() => {
          }).catch((error: AxiosError) => {
            expect(error.response.status).to.equal(401)
            done()
          })
        })
      })
    })
  })

  describe('User', function () {
    describe('Profile', function () {
      it('Should return the users information', function (done) {
        Axios.get(`${URL}/api/user/me`, {headers: {'x-access-token': token}}).then((response: AxiosResponse) => {
          expect(response.data.payload.user.username).to.equal('tester')
          done()
        })
      })
    })

    describe('Destroy', function () {
      it('Should delete users profile', function (done) {
        Axios.delete(`${URL}/api/user/destroy`, {headers: {'x-access-token': token}}).then((response: AxiosResponse) => {
          expect(response.status).to.equal(200)
          done()
        })
      })
    })
  })

  describe('Devices', function () {
    let device1Id: string = ''
    let device2Id: string = ''
    const dummyMAC: string = '02:00:00:00:00:00'

    after(function () {
      Axios.delete(`${URL}/api/devices/destory/${device2Id}`).then((response: AxiosResponse) => {
        expect(response.status).to.equal(200)
      })
    })

    describe('Add a device', function () {
      it('Should store a devices MAC address', function (done) {
        const deviceData = {
          mac: dummyMAC
        }
        Axios.post(`${URL}/api/devices/add`, deviceData).then((response: AxiosResponse) => {
          expect(response.status).to.equal(200)
          device1Id = response.data.payload._id
          done()
        })
      })
    })

    describe('Pair devices', function () {
      before(function () {
        const deviceData = {
          mac: '03:00:00:00:00:00'
        }
        Axios.post(`${URL}/api/devices/add`, deviceData).then((response: AxiosResponse) => {
          expect(response.status).to.equal(200)
          device2Id = response.data.payload._id
        })
      })
      it('Should pair two devices', function (done) {
        const deviceData = {
          device_1: device1Id,
          device_2: device2Id
        }

        Axios.post(`${URL}/api/devices/pair`, deviceData).then((response: AxiosResponse) => {
          expect(response.status).to.equal(200)
          done()
        })
      })
    })

    describe('Destroy device', function () {
      it('Should destroy a device', function (done) {
        Axios.delete(`${URL}/api/devices/destory/${device1Id}`).then((response: AxiosResponse) => {
          expect(response.status).to.equal(200)
          done()
        })
      })
    })
  })
})
