/**
 Created:  2018-12-13
 Author:   Daniel Welsh
 Description:
 -
 */

// ------------------------------------------------------------------------------------------
// Current Permissions.
// ------------------------------------------------------------------------------------------
/**
 * @apiDefinePermission authenticated User must be authenticated by passing an auth token.
 *
 * @apiDefinePermission admin Admin access rights needed.
 * Optionally you can write here further Informations about the permission.
 *
 * An "apiDefinePermission"-block can have an "apiVersion", so you can attach the block to a specific version.
 */

// ------------------------------------------------------------------------------------------
// Current Errors.
// ------------------------------------------------------------------------------------------
/**
 * @apiDefine errorBadRequest
 * @apiError (4xx) {400} BadRequest All parameters have not been provided.
 * @apiErrorExample {json} Bad Request:
 * HTTP/1.1 400 Bad Request
 {
      "code": 400,
      "message": "bad request",
      "errors": true,
      "payload": {}
   }
 */

/**
 * @apiDefine errorTokenNotProvided
 * @apiError (4xx) {401} TokenNotProvided The <code>x-access-token</code> header was not set.
 * @apiErrorExample {json} Token Not Provided:
 * HTTP/1.1 401 Unauthorized
 {
      "code": 401,
      "message": "token not provided",
      "errors": true,
      "payload": {}
   }
 */

/**
 * @apiDefine errorResourceExists
 * @apiError (4xx) {401} ResourceExists The resource already exists.
 * @apiErrorExample {json} Resource Exists:
 * HTTP/1.1 401 Unauthorized
 {
      "code": 401,
      "message": "resource already exists",
      "errors": true,
      "payload": {}
   }
 */

/**
 * @apiDefine errorResourceNotFound
 * @apiError (4xx) {404} ResourceNotFound The resource could not be found
 * @apiErrorExample {json} Resource Not Found:
 * HTTP/1.1 404 Not Found
 {
      "code": 404,
      "message": "not found",
      "errors": true,
      "payload": {}
   }
 */

/**
 * @apiDefine errorServerError
 * @apiError (5xx) {500} ServerError Something went wrong server side...
 * @apiErrorExample {json} Server Error:
 * HTTP/1.1 500 Internal Server Error
 {
      "code": 500,
      "message": "not found",
      "errors": true,
      "payload": {}
   }
 */

/**
 * @apiDefine errorNotImplemented
 * @apiError (5xx) {501} NotImplementedError This endpoint has not been implemented
 * @apiErrorExample {json} Not Implemented Error:
 * HTTP/1.1 501 Not Implemented
 {
      "code": 501,
      "message": "server error",
      "errors": true,
      "payload": {}
   }
 */
