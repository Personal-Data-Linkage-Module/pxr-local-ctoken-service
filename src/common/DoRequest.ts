/** Copyright 2022 NEC Corporation
Released under the MIT license.
https://opensource.org/licenses/mit-license.php
*/
/* eslint-disable */
import { systemLogger } from './logging';
import AppError from './AppError';
/* eslint-enable */
import Config from './Config';
import request = require('request');
const Message = Config.ReadConfig('./config/message.json');

/**
 * GETリクエストを実行する
 * @param uri 宛先となるURI
 * @param options リクエストオプション
 */
export async function doGetRequest (uri: string, options?: request.CoreOptions) {
    return new Promise<{
        response: request.Response,
        body: any
    }>((resolve, reject) => {
        request.get(uri, options, (error: Error, response: request.Response, body: any) => {
            if (error) {
                reject(error);
                return;
            }
            let data: any = body;
            try {
                const contentType = response.headers['content-type'] + '';
                if (data && contentType.indexOf('application/json') >= 0) {
                    while (typeof data === 'string') {
                        data = JSON.parse(data);
                    }
                }
            } catch (err) {
                if (err instanceof SyntaxError) {
                    systemLogger.warn('Failed parse to JSON with exception.', err);
                } else {
                    throw new AppError(Message.RESPONSE_ERROR, 500);
                }
            }
            resolve({
                response: response,
                body: data
            });
        });
    });
}

/**
 * POSTリクエストを実行する
 * @param uri 宛先となるURI
 * @param options リクエストオプション
 */
export async function doPostRequest (uri: string, options?: request.CoreOptions) {
    return new Promise<{
        response: request.Response,
        body: any
    }>((resolve, reject) => {
        request.post(uri, options, (error: Error, response: request.Response, body: any) => {
            if (error) {
                reject(error);
                return;
            }
            let data: any = body;
            try {
                const contentType = response.headers['content-type'] + '';
                if (data && contentType.indexOf('application/json') >= 0) {
                    while (typeof data === 'string') {
                        data = JSON.parse(data);
                    }
                }
            } catch (err) {
                if (err instanceof SyntaxError) {
                    systemLogger.warn('Failed parse to JSON with exception.', err);
                } else {
                    throw new AppError(Message.RESPONSE_ERROR, 500);
                }
            }
            resolve({
                response: response,
                body: data
            });
        });
    });
}

/**
 * PUTリクエストを実行する
 * @param uri 宛先となるURI
 * @param options リクエストオプション
 */
export async function doPutRequest (uri: string, options?: request.CoreOptions) {
    return new Promise<{
        response: request.Response,
        body: any
    }>((resolve, reject) => {
        request.put(uri, options, (error: Error, response: request.Response, body: any) => {
            if (error) {
                reject(error);
                return;
            }
            let data: any = body;
            try {
                const contentType = response.headers['content-type'] + '';
                if (data && contentType.indexOf('application/json') >= 0) {
                    while (typeof data === 'string') {
                        data = JSON.parse(data);
                    }
                }
            } catch (err) {
                if (err instanceof SyntaxError) {
                    systemLogger.warn('Failed parse to JSON with exception.', err);
                } else {
                    throw new AppError(Message.RESPONSE_ERROR, 500);
                }
            }
            resolve({
                response: response,
                body: data
            });
        });
    });
}

/**
 * DELETEリクエストを実行する
 * @param uri 宛先となるURI
 * @param options リクエストオプション
 */
export async function doDeleteRequest (uri: string, options?: request.CoreOptions) {
    return new Promise<{
        response: request.Response,
        body: any
    }>((resolve, reject) => {
        request.delete(uri, options, (error: Error, response: request.Response, body: any) => {
            if (error) {
                reject(error);
                return;
            }
            let data: any = body;
            try {
                const contentType = response.headers['content-type'] + '';
                if (data && contentType.indexOf('application/json') >= 0) {
                    while (typeof data === 'string') {
                        data = JSON.parse(data);
                    }
                }
            } catch (err) {
                if (err instanceof SyntaxError) {
                    systemLogger.warn('Failed parse to JSON with exception.', err);
                } else {
                    throw new AppError(Message.RESPONSE_ERROR, 500);
                }
            }
            resolve({
                response: response,
                body: data
            });
        });
    });
}
