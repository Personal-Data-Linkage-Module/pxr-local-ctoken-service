/** Copyright 2022 NEC Corporation
Released under the MIT license.
https://opensource.org/licenses/mit-license.php
*/
/* eslint-disable */
import { Request, Response } from 'express';
import {
    JsonController, Post, Header, Res, Req, UseBefore
} from 'routing-controllers';
import PostLocalCTokenReqDto from './dto/PostLocalCTokenReqDto';
/* eslint-enable */
import EnableSimpleBackPressure from './backpressure/EnableSimpleBackPressure';
import OperatorService from '../services/OperatorService';
import LocalCTokenService from '../services/LocalCTokenService';
import { transformAndValidate } from 'class-transformer-validator';
import LocalCTokenRequestValidator from './validator/LocalCTokenRequestValidator';

@JsonController('/local-ctoken')
export default class LocalCTokenController {
    /**
     * Local-CToken登録
     * @param req
     * @param res
     */
    @Post()
    @Header('X-Content-Type-Options', 'nosniff')
    @Header('X-XSS-Protection', '1; mode=block')
    @Header('X-Frame-Options', 'deny')
    @EnableSimpleBackPressure()
    @UseBefore(LocalCTokenRequestValidator)
    async postLocalCToken (@Req() req: Request, @Res() res: Response): Promise<any> {
        const dto = await transformAndValidate(
            PostLocalCTokenReqDto,
            req.body
        ) as PostLocalCTokenReqDto;

        // オペレーター情報を取得
        const operator = await OperatorService.authMe(req);

        // Local-CToken登録を実行
        const ret = await LocalCTokenService.postLocalCToken(operator, dto);

        // レスポンスを返す
        return ret;
    }
}
