import {describe} from "mocha"
import Axios, {AxiosError} from "axios"
import {URL} from "./commons"
import {expect} from "chai"
import {IUser} from "../web/schemas/user";
import {destroyUser, storeUser} from "../web/controllers/user";
import {generateToken} from "../web/controllers/auth";

let user: IUser
let token: string

describe('Middleware', function () {
  before(async () => {
    const username: string = 'tester-middleware'
    const password: string  = 'secret'

    user = await storeUser(username, password)
    token = await generateToken(user)
  })

  after (async () => {
    await destroyUser(user._id)
  })

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