import { App } from './web/Server';

const port = process.env.PORT || 80;
const app = new App();

app.express.listen(port, () => {
  return console.log(`server is listening on ${port}`);
});
