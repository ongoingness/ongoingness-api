import { describe } from 'mocha';
import axios, { AxiosResponse } from 'axios';
import { URL } from '../commons';
import { generateToken } from '../../web/controllers/auth';
import { UserController } from '../../web/controllers/user';
import { IUser } from '../../web/schemas/user';
import { expect } from 'chai';
import { DeviceController } from '../../web/controllers/device';
import { IDevice } from '../../web/schemas/device';

let user: IUser;
let token: string;
const deviceController: DeviceController = new DeviceController();
const userController: UserController = new UserController();

describe('Devices', () => {
  let device1: IDevice;
  const dummyMAC: string = '02:00:00:00:00:00';

  before(async () => {
    const username: string = 'tester-middleware';
    const password: string  = 'secret';

    user = await userController.store({ username, password });
    token = await generateToken(user);
  });

  after(async () => {
    await userController.destroy(user._id);
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

  describe('Pair devices',  () => {
    let device2: IDevice;

    before(async () => {
      device2 = await deviceController.store({ owner: user._id, mac: '03:00:00:00:00:00' });
    });

    after(async () => {
      await deviceController.destroy(device2._id);
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
