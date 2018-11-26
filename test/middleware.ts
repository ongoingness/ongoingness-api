import { describe } from 'mocha';
import axios, { AxiosError } from 'axios';
import { URL } from './commons';
import { expect } from 'chai';
import { IUser } from '../web/schemas/user';
import { destroyUser, storeUser } from '../web/controllers/user';
import { generateToken } from '../web/controllers/auth';

let user: IUser;
let token: string;

describe('Middleware', () => {
  before(async () => {
    const username: string = 'tester-middleware';
    const password: string  = 'secret';

    user = await storeUser(username, password);
    token = await generateToken(user);
  });

  after(async () => {
    await destroyUser(user._id);
  });

  describe('Authentication', () => {
    describe('Require token', () => {
      it('Should reject request if no token is given', (done) => {
        axios.get(`${URL}/api/user/me`).then(() => {
        }).catch((error: AxiosError) => {
          expect(error.response.status).to.equal(401);
          done();
        });
      });
    });

    describe('Check token is valid', () => {
      it('Should reject request if the token is invalid', (done) => {
        const invToken = `${token}0`;
        axios.get(`${URL}/api/user/me`, { headers: { 'x-access-token': invToken } }).then(() => {
        }).catch((error: AxiosError) => {
          expect(error.response.status).to.equal(401);
          done();
        });
      });
    });
  });
});
