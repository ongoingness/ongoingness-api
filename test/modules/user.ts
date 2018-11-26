import { describe } from 'mocha';
import axios, { AxiosResponse } from 'axios';
import { URL } from '../commons';
import { expect } from 'chai';
import { generateToken } from '../../web/controllers/auth';
import { storeUser } from '../../web/controllers/user';
import { IUser } from '../../web/schemas/user';

let user: IUser;
let token: string;

describe('User', () => {
  before(async () => {
    const username: string = 'tester-user';
    const password: string  = 'secret';

    user = await storeUser(username, password);
    token = await generateToken(user);
  });

  describe('Profile', () => {
    it('Should return the users information', (done) => {
      axios.get(`${URL}/api/user/me`, { headers: { 'x-access-token': token } })
        .then((response: AxiosResponse) => {
          expect(response.data.payload.user.username).to.equal('tester-user');
          done();
        });
    });
  });

  describe('Destroy', () => {
    it('Should delete users profile', (done) => {
      axios.delete(`${URL}/api/user/destroy`, { headers: { 'x-access-token': token } })
        .then((response: AxiosResponse) => {
          expect(response.status).to.equal(200);
          done();
        });
    });
  });
});
