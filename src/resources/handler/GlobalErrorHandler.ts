/** Copyright 2022 NEC Corporation
Released under the MIT license.
https://opensource.org/licenses/mit-license.php
*/
/**
 *
 *
 *
 * $Date$
 * $Revision$
 * $Author$
 *
 * TEMPLATE VERSION :  76463
 */
/* eslint-disable */
import { ExpressErrorMiddlewareInterface, Middleware } from 'routing-controllers';
import { ValidationError } from 'class-validator';
import * as express from 'express';
import Config from '../../common/Config';
import { applicationLogger } from '../../common/logging';
import AppError from '../../common/AppError';
/* eslint-enable */

const Message = Config.ReadConfig('./config/message.json');

@Middleware({ type: 'after' })
export default class GlobalErrorHandler implements ExpressErrorMiddlewareInterface {
    public async error (err: any, request: express.Request, response: express.Response, next: express.NextFunction) {
        // エラーオブジェクト毎のエラーハンドリング
        if (err) {
            // Validationエラー時のハンドリング
            const reason: any[] = [];
            const parser = async (target: any[]) => {
                const targets = Array.isArray(target) ? target : [target];
                for (const child of targets) {
                    if (Array.isArray(child)) {
                        await parser(child);
                    } else if (child instanceof ValidationError && Array.isArray(child.children) && child.children.length > 0) {
                        await parser(child.children);
                    } else if (child instanceof ValidationError) {
                        const { constraints } = child;
                        for (const num in constraints) {
                            if (constraints.isDefined && num !== 'isDefined') {
                                continue;
                            }
                            const res = {
                                property: child.property,
                                value: child.value && child.value !== 0 && child.value !== ''
                                    ? child.value : null,
                                message: Message.validation[num]
                            };
                            reason.push(res);
                        }
                    }
                }
            };
            await parser(err);
            // Validationエラーが発生していた場合、レスポンスを生成する
            if (reason.length > 0 && !response.finished) {
                // レスポンスを生成する
                response.status(400).send({
                    status: 400,
                    reasons: reason
                });

            // AppError時のハンドリング
            } else if (err instanceof AppError && !response.finished) {
                // ログ出力する
                applicationLogger.error('Application internal error.', err);
                // レスポンスを生成する
                response.status(err.statusCode).send({
                    status: err.statusCode,
                    message: err.message
                });

            // body-parserにて、SyntaxErrorが起きた想定で、レスポンスデータを生成
            } else if (err instanceof SyntaxError && !response.finished) {
                applicationLogger.error('Requested body has an error, that is invalid.', err);
                response.status(400).send({
                    status: 400,
                    message: 'リクエストボディにエラー、JSONへの変換に失敗しました'
                });

            // エラーにhttpCodeというプロパティが含まれている場合
            } else if (err.httpCode > 0 && !response.finished) {
                applicationLogger.error(`${err.name} has occured.`, err);
                response.status(err.httpCode).send({
                    status: err.httpCode,
                    message: err.name
                });

            // その他エラーが発生してしまった場合
            } else if (!response.finished) {
                // ログ出力する
                applicationLogger.error('Undefined error.', err);
                // レスポンスを生成する
                response.status(503).send({
                    status: 503,
                    message: Message.UNDEFINED_ERROR
                });
            }
        }

        if (next) {
            next(err);
        }
    }
}
