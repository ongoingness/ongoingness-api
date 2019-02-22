import { describe } from 'mocha';
import axios, { AxiosResponse } from 'axios';
import { URL } from '../commons';
import { generateToken } from '../../web/controllers/auth';
import { IUser } from '../../web/schemas/user';
import { expect } from 'chai';
import { IDevice } from '../../web/schemas/device';
import { IResourceController } from '../../web/controllers/IResourceController';
import ControllerFactory from '../../web/controllers/ControllerFactory';
import CryptoHelper from '../../web/CryptoHelper';

let user: IUser;
let token: string;
const userRepository: IResourceController<IUser> = ControllerFactory.getController('user');

describe('Devices', () => {
  let device1: IDevice;
  const dummyMAC: string = '02:00:00:00:00:00';

  before(async () => {
    const username: string = 'tester-middleware';
    const password: string  = 'secret';

    user = await userRepository.store({ username, password, iv: CryptoHelper.getRandomString(16) });
    token = await generateToken(user);
  });

  after(async () => {
    await userRepository.destroy(user._id);
  });

  describe('Add a device', () => {
    it('Should store a devices MAC address',  (done) => {
      const deviceData = {
        mac: dummyMAC,
      };
      axios.post(`${URL}/api/devices/`, deviceData, { headers: { 'x-access-token': token } })
        .then((response: AxiosResponse) => {
          expect(response.status).to.equal(200);
          device1 = response.data.payload;
          done();
        });
    });
  });

  describe('Destroy device', () => {
    it('Should destroy a device', (done) => {
      const url = `${URL}/api/devices/${device1._id}`;
      axios.delete(url,
                   { headers: { 'x-access-token': token } })
        .then((response: AxiosResponse) => {
          expect(response.status).to.equal(200);
          done();
        });
    });
  });
});
