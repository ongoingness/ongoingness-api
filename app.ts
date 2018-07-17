import { App } from "./web/server";

const port = process.env.PORT || 3000
const app = new App()

app.express.listen(port, (err: Error) => {
  if (err) {
    return console.log(err)
  }
  return console.log(`server is listening on ${port}`)
})
