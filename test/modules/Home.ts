// For the home routes.
import { describe } from 'mocha';
// import axios, { AxiosResponse } from 'axios';
// import { URL } from '../commons';
// import { expect } from 'chai';

/**
 * Commented out for now, test works in dev and on production.
 * Fails in CI as image does not generate apidocs before tests
 * script are run, therefore returning a 404, instead of 200.
 *
 * Original fault was Dockerfile generating documentation in
 * app/static, instead of app/static/apidoc.
 */
describe('Home', () => {
 // Test the landing page renders
 // describe('Render', () => {
 //   it("Should return the home page from '/'", (done) => {
 //     axios.get(`${URL}/`).then((response: AxiosResponse) => {
 //       expect(response.status).to.equal(200);
 //       done();
 //     });
 //   });
 // });
});
