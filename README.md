# Ongoingess API
> A template for a Typescript Express.js API.

[![Build Status](https://travis-ci.com/danjwelsh/express-stub.svg?branch=master)](https://travis-ci.com/danjwelsh/express-stub)
[![MIT license](https://img.shields.io/badge/License-MIT-blue.svg)](https://lbesson.mit-license.org/)

## Build
Install typescript and compile to JavaScript:
```bash
npm i -g typescript && tsc && cp .env.example .env
```
This will initialise the project with dummy environment variables, the project requires:
```
DEBUG=false
TEST=false
SECRET=changetoasecret
MONGO_URI=mongodb://mongo/stub
```

## Run
```bash
npm run
```

## Test
```bash
npm test
```

## Use from browser
First you have to login to the server to get an access token, allowing you to make further requests. To do this open the terminal and paste in the command below. Replace `<USERNAME>` and `<PASSWORD>` for your username and password.
```bash
curl --data "username=<USERNAME>&password=<PASSWORD>" http://46.101.47.18:3000/api/auth/authenticate
```

It will return something like:
```json
{
  "code":200,
  "message":"success",
  "errors":false,
  "payload":{
    "token":"eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjViOWEzNTVjYTc2YTY0MDAwZmQ0MGNhZCIsInVzZXJuYW1lIjoicHJvdG8iLCJpYXQiOjE1MzY5MjA0MzUsImV4cCI6MTUzNzAwNjgzNX0.vqY17Lwxb8MPgeJLQ1aOEFlX85g35iQoHPBdkCK6uaB"
  }
}
```

Copy the long token string without the quotation marks.

### Viewing Image From the Present
First you need to get the ID of an image from the present. Run the command below. Replace `<TOKEN>` with the token you got from the last command.
```bash
curl --header "x-access-token: <TOKEN>" http://46.101.47.18:3000/api/media/request/present
```

It will return something similar to:
```json
{
  "code":200,
  "message":"success",
  "errors":false,
  "payload":"5b9a7795180bf765b93ccdb8"
}
```

Take the string in the payload is the image id. In a browser you can now paste the URL below to see your image. Replace `<id>` and `<token>` with id and token you got from the previous commands.
```
http://46.101.47.18:3000/api/media/show/<id>/<token>
```

### Viewing Image from the Past
This will show an image from the past, linked to the last seen image from the present. First you need to get the id of an image from the past. Run the command:
```bash
curl --header "x-access-token: <TOKEN>" http://46.101.47.18:3000/api/media/request/present
```

It will return something similar to:
```json
{
  "code":200,
  "message":"success",
  "errors":false,
  "payload":"5b9a7795180bf765b93ccdbD"
}
```

Take the string in the payload is the image id. In a browser you can now paste the URL below to see your image:
```
http://46.101.47.18:3000/api/media/show/<id>/<token>
```
