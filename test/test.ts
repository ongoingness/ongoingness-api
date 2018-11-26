import { describe } from 'mocha';
import { App } from '../web/server';
import { Server } from 'http';

let server: Server;

describe('api', () => {
  before(() => {
    const port: number = 8888;
    process.env.TEST = 'true';

    try {
      server = new App().express.listen(port);
    } catch (e) {
      console.error(e);
    }
  });

  after(async () => {
    await server.close();
  });

  /**
   * Import tests from files
   */
  require('./media');
  require('./home');
  require('./auth');
  require('./middleware');
  require('./user');
  require('./devices');
});
