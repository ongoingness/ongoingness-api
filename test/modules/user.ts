import { describe } from 'mocha';
import axios, { AxiosResponse } from 'axios';
import { URL } from '../commons';
import { expect } from 'chai';
import { generateToken } from '../../web/controllers/auth';
import { IUser } from '../../web/schemas/user';
import { IResourceController } from '../../web/controllers/IResourceController';
import ControllerFactory from '../../web/controllers/ControllerFactory';

const userController: IResourceController<IUser> = ControllerFactory.getController('user');
let user: IUser;
let token: string;

describe('User', () => {
  before(async () => {
    const username: string = 'tester-user';
    const password: string  = 'secret';

    user = await userController.store({ username, password, iv: '12345678' });
    token = await generateToken(user);
  });

  describe('Profile', () => {
    it('Should return the users information', (done) => {
      axios.get(`${URL}/api/users/${user._id}`, { headers: { 'x-access-token': token } })
        .then((response: AxiosResponse) => {
          expect(response.data.payload.username).to.equal('tester-user');
          done();
        });
    });
  });

  describe('Destroy', () => {
    it('Should delete users profile', (done) => {
      axios.delete(`${URL}/api/users/${user._id}`, { headers: { 'x-access-token': token } })
        .then((response: AxiosResponse) => {
          expect(response.status).to.equal(200);
          done();
        });
    });
  });
});
