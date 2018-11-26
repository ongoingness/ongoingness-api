// For the home routes.
import { describe } from 'mocha';
import axios, { AxiosResponse } from 'axios';
import { URL } from './commons';
import { expect } from 'chai';

describe('Home', () => {
  // Test the landing page renders
  describe('Render', () => {
    it("Should return the home page from '/'", (done) => {
      axios.get(`${URL}/`).then((response: AxiosResponse) => {
        expect(response.status).to.equal(200);
        done();
      });
    });
  });
});
