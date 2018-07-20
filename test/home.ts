// For the home routes.
import {describe} from "mocha";
import {AxiosResponse} from "axios";
import Axios from "axios";
import {URL} from "./commons";
import {expect} from "chai"

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