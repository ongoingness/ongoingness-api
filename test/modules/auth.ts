import { describe } from 'mocha';
import axios, { AxiosError, AxiosResponse } from 'axios';
import { URL } from '../commons';
import { expect } from 'chai';
import { IUser } from '../../web/schemas/user';
import { UserController } from '../../web/controllers/user';
import { IDevice } from '../../web/schemas/device';
import { IResourceController } from '../../web/controllers/IResourceController';
import ControllerFactory from '../../web/controllers/ControllerFactory';

let user: IUser;
const deviceRepository: IResourceController<IDevice> = ControllerFactory.getController('device');
const userController: UserController = new UserController();

describe('Auth', () => {
  after(async () => {
    await userController.destroy(user._id);
  });

  describe('Register', () => {
    it('Should register a user and return a token', (done) => {
      const userData = {
        username: 'tester-auth',
        password: 'secret',
      };
      axios.post(`${URL}/api/auth/register`, userData).then((response: AxiosResponse) => {
        expect(response.data.payload.token).to.have.length.above(10);
        user = response.data.payload.user;
        done();
      });
    });
  });

  describe('Rejects creating existing account', () => {
    it('Should prevent the user from creating an account with an existing username', (done) => {
      const userData = {
        username: 'tester-auth',
        password: 'secret',
      };
      axios.post(`${URL}/api/auth/register`, userData).then(() => {
      }).catch((error: AxiosError) => {
        expect(error.response.status).to.equal(403);
        done();
      });
    });
  });

  describe('Authenticate', () => {
    it('Should return a JWT token', (done) => {
      const userData = {
        username: 'tester-auth',
        password: 'secret',
      };
      axios.post(`${URL}/api/auth/authenticate`, userData).then((response: AxiosResponse) => {
        expect(response.data.payload.token).to.have.length.above(10);
        done();
      });
    });
  });

  describe('Authenticate with MAC address', () => {
    let device: IDevice;
    const dummyMAC = '00:00:00:00:00:00';

    before(async () => {
      device = await deviceRepository.store({ userId: user._id, mac: dummyMAC });
    });

    after(async () => {
      await deviceRepository.destroy(device._id);
    });

    it('Should return a JWT token for the user who owns a device with a matching MAC address',
       (done) => {
         const userData = {
           mac: dummyMAC,
         };
         axios.post(`${URL}/api/auth/mac`, userData).then((response: AxiosResponse) => {
           expect(response.status).to.equal(200);
           expect(response.data.payload).to.have.length.above(10);
           done();
         });
       });
  });

  describe('Reject incorrect password', () => {
    it('Should reject request if invalid password is given', (done) => {
      const userData = {
        username: 'tester-auth',
        password: 'password',
      };
      axios.post(`${URL}/api/auth/authenticate`, userData).then(() => {
      }).catch((error: AxiosError) => {
        expect(error.response.status).to.equal(401);
        done();
      });
    });
  });

  describe('Reject incorrect username', () => {
    it('Should reject request if invalid username is given', (done) => {
      const userData = {
        username: 'tester-auth-1',
        password: 'secret',
      };
      axios.post(`${URL}/api/auth/authenticate`, userData).then(() => {
      }).catch((error: AxiosError) => {
        expect(error.response.status).to.equal(401);
        done();
      });
    });
  });
});
