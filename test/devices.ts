import { describe } from 'mocha';
import axios, { AxiosResponse } from 'axios';
import { URL } from './commons';
import { generateToken } from '../web/controllers/auth';
import { destroyUser, storeUser } from '../web/controllers/user';
import { IUser } from '../web/schemas/user';
import { expect } from 'chai';
import { destroyDevice, storeDevice } from '../web/controllers/device';
import { IDevice } from '../web/schemas/device';

let user: IUser;
let token: string;

describe('Devices', () => {
  let device1: IDevice;
  let device2: IDevice;
  const dummyMAC: string = '02:00:00:00:00:00';

  before(async () => {
    const username: string = 'tester-middleware';
    const password: string  = 'secret';

    user = await storeUser(username, password);
    token = await generateToken(user);
  });

  after(async () => {
    await destroyDevice(user._id, device2._id);
    await destroyUser(user._id);
  });

  describe('Add a device', () => {
    it('Should store a devices MAC address',  (done) => {
      const deviceData = {
        mac: dummyMAC,
      };
      axios.post(`${URL}/api/devices/add`, deviceData, { headers: { 'x-access-token': token } })
        .then((response: AxiosResponse) => {
          expect(response.status).to.equal(200);
          device1 = response.data.payload;
          done();
        });
    });
  });

  describe('Pair devices',  () => {
    before(async () => {
      device2 = await storeDevice(user._id, '03:00:00:00:00:00');
    });
    it('Should pair two devices', (done) => {
      const deviceData = {
        device1: device1._id,
        device2: device2._id,
      };

      axios.post(`${URL}/api/devices/pair`, deviceData, { headers: { 'x-access-token': token } })
        .then((response: AxiosResponse) => {
          expect(response.status).to.equal(200);
          done();
        });
    });
  });

  describe('Destroy device', () => {
    it('Should destroy a device', (done) => {
      axios.delete(`${URL}/api/devices/destroy/${device1._id}`,
                   { headers: { 'x-access-token': token } })
        .then((response: AxiosResponse) => {
          expect(response.status).to.equal(200);
          done();
        });
    });
  });
});
