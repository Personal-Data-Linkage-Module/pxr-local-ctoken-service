/** Copyright 2022 NEC Corporation
Released under the MIT license.
https://opensource.org/licenses/mit-license.php
*/
/* eslint-disable */
import { Request, Response } from 'express';
import {
    JsonController, Post, Body, Header, Res, Req, UseBefore, Get
} from 'routing-controllers';
/* eslint-enable */
import EnableSimpleBackPressure from './backpressure/EnableSimpleBackPressure';
import OperatorService from '../services/OperatorService';
import LedgerService from '../services/LedgerService';
import PostLedgerReqDto from './dto/PostLedgerReqDto';
import { transformAndValidate } from 'class-transformer-validator';
import LedgerRequestValidator from './validator/LedgerRequestValidator';

@JsonController('/local-ctoken')
export default class LedgerController {
    /**
     * Local-CToken台帳連携
     * @param req
     * @param res
     */
    @Post('/ledger')
    @Header('X-Content-Type-Options', 'nosniff')
    @Header('X-XSS-Protection', '1; mode=block')
    @Header('X-Frame-Options', 'deny')
    @EnableSimpleBackPressure()
    @UseBefore(LedgerRequestValidator)
    async postLedger (@Req() req: Request, @Res() res: Response): Promise<any> {
        // オペレーター情報を取得
        const operator = await OperatorService.authMe(req);

        // パラメータを取得
        let dto = await transformAndValidate(PostLedgerReqDto, req.body);
        dto = <PostLedgerReqDto>dto;

        // 台帳登録を実行
        const ret = await LedgerService.postLedger(operator, dto);

        // レスポンスを返す
        return ret;
    }

    /**
     * Local-CToken台帳連携対象件数
     * @param req
     * @param res
     */
    @Get('/ledger/count')
    @Header('X-Content-Type-Options', 'nosniff')
    @Header('X-XSS-Protection', '1; mode=block')
    @Header('X-Frame-Options', 'deny')
    @EnableSimpleBackPressure()
    async getLedgerCount (@Req() req: Request, @Res() res: Response): Promise<any> {
        // オペレーター情報をチェック
        await OperatorService.authMe(req);

        // 台帳登録対象件数を取得
        const ret = await LedgerService.getLedgerCount();

        // レスポンスを返す
        return ret;
    }
}
