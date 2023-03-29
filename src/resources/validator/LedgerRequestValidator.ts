/** Copyright 2022 NEC Corporation
Released under the MIT license.
https://opensource.org/licenses/mit-license.php
*/
/* eslint-disable */
import { Request, Response, NextFunction } from 'express';
import { Middleware, ExpressMiddlewareInterface } from 'routing-controllers';
/* eslint-enable */
import AppError from '../../common/AppError';
import { ResponseCode } from '../../common/ResponseCode';
import Config from '../../common/Config';
import { transformAndValidate } from 'class-transformer-validator';
import PostLedgerReqDto from '../../resources/dto/PostLedgerReqDto';
const Message = Config.ReadConfig('./config/message.json');

/**
 * Local-CToken台帳連携のバリデーションチェック
 */
@Middleware({ type: 'before' })
export default class LedgerRequestValidator implements ExpressMiddlewareInterface {
    async use (request: Request, response: Response, next: NextFunction) {
        // リクエストが空か確認
        if (!request.body || JSON.stringify(request.body) === JSON.stringify({})) {
            throw new AppError(Message.REQUEST_IS_EMPTY, ResponseCode.BAD_REQUEST);
        }
        const dto = await transformAndValidate(
            PostLedgerReqDto,
            request.body
        );
        if (Array.isArray(dto)) {
            throw new AppError('リクエストボディが配列であることを許容しません', 400);
        }
        next();
    }
}
