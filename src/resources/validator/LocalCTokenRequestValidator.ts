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
import PostLocalCTokenReqDto from '../dto/PostLocalCTokenReqDto';
import { transformAndValidate } from 'class-transformer-validator';
const Message = Config.ReadConfig('./config/message.json');

/**
 * Local-CToken登録のバリデーションチェック
 */
@Middleware({ type: 'before' })
export default class LocalCTokenRequestValidator implements ExpressMiddlewareInterface {
    async use (request: Request, response: Response, next: NextFunction) {
        // リクエストが空か確認
        if (!request.body || JSON.stringify(request.body) === JSON.stringify({})) {
            throw new AppError(Message.REQUEST_IS_EMPTY, ResponseCode.BAD_REQUEST);
        }

        const dto = await transformAndValidate(
            PostLocalCTokenReqDto,
            request.body
        );
        if (Array.isArray(dto)) {
            throw new AppError('リクエストボディが配列であることを許容しません', 400);
        }

        // 全てが空配列の場合
        if (dto.add.length === 0 &&
            dto.update.length === 0 &&
            dto.delete.length === 0
        ) {
            throw new AppError(Message.ALL_ARRAY_IS_EMPTY, 400);
        }

        next();
    }
}
