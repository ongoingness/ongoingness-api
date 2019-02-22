import { describe } from 'mocha';
import axios, { AxiosError } from 'axios';
import { URL } from '../Commons';
import { expect } from 'chai';
import { IUser } from '../../web/schemas/User';
import AuthController from '../../web/controllers/AuthController';
import { IResourceRepository } from '../../web/repositories/IResourceRepository';
import RepositoryFactory from '../../web/repositories/RepositoryFactory';
import CryptoHelper from '../../web/CryptoHelper';

const userRepository: IResourceRepository<IUser> = RepositoryFactory.getRepository('user');
const authController: AuthController = new AuthController();

let user: IUser;
let token: string;

describe('Middleware', () => {
  before(async () => {
    const username: string = 'tester-middleware';
    const password: string  = 'secret';

    user = await userRepository.store({ username, password, iv: CryptoHelper.getRandomString(16) });
    token = await authController.generateToken(user);
  });

  after(async () => {
    await userRepository.destroy(user._id);
  });

  describe('Authentication', () => {
    describe('Require token', () => {
      it('Should reject request if no token is given', (done) => {
        axios.get(`${URL}/api/users/${user._id}`).then(() => {
        }).catch((error: AxiosError) => {
          expect(error.response.status).to.equal(401);
          done();
        });
      });
    });

    describe('Check token is valid', () => {
      it('Should reject request if the token is invalid', (done) => {
        const invToken = `${token}0`;
        axios.get(`${URL}/api/users/${user._id}`, { headers: { 'x-access-token': invToken } })
          .then()
          .catch((error: AxiosError) => {
            expect(error.response.status).to.equal(401);
            done();
          });
      });
    });
  });
});
