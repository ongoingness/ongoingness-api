import * as express from "express"
import { Reply } from '../reply'

const handleResponse: express.ErrorRequestHandler = (err: Error, req: express.Request, res: express.Response, next: express.NextFunction) => {
  const code: number = parseInt(err.message)

  let response = getError(code)
  if (res.locals.customErrorMessage) {
    response.message = res.locals.customErrorMessage
  }

  if (process.env.DEBUG === 'true') {
    response.payload = err.stack
  }

  if (process.env.TEST !== 'true') {
    console.error(err.stack)
  }

  res.status(code)
  return res.json(response)
}

/**
 * Get message from error code
 * @param  code number
 * @return      Reply
 */
function getError(code: number): Reply {
  let message
  switch (code) {
    case 400:
      message = 'bad request'
    case 401:
      message = 'unauthorised'
      break
    case 403:
      message = 'forbidden'
      break
    case 404:
      message = 'not found'
      break
    case 500:
      message = 'server error'
      break
    default:
      message = 'server error'
      break
  }

  return new Reply(code, message, true, null)
}

// Export functions
export {
  handleResponse
}
