/** Copyright 2022 NEC Corporation
Released under the MIT license.
https://opensource.org/licenses/mit-license.php
*/
/**
 * レスポンスコード
 */
export namespace ResponseCode {
    /**
     * OK(200)
     */
    export const OK: number = 200;

    /**
     * NoContent(204)
     */
    export const NO_CONTENT: number = 204;

    /**
     * BadRequest(400)
     */
    export const BAD_REQUEST: number = 400;

    /**
     * UnAutorized(401)
     */
    export const UNAUTHORIZED: number = 401;
    /**
     * NotFound(404)
     */
    export const NOT_FOUND: number = 404;

    /**
     * MethodNotAllowed(405)
     */
    export const METHOD_NOT_ALLOWED: number = 405;

    /**
     * Conflict(409)
     */
    export const CONFLICT: number = 409;

    /**
     * UnsupportedMediaType(415)
     */
    export const UNSUPPORT_MEDIA_TYPE: number = 415;

    /**
     * InternalServerError(500)
     */
    export const INTERNAL_SERVER_ERROR: number = 500;

    /**
     * ServiceUnavailable(503)
     */
    export const SERVICE_UNAVAILABLE: number = 503;
}
