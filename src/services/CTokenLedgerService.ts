/** Copyright 2022 NEC Corporation
Released under the MIT license.
https://opensource.org/licenses/mit-license.php
*/
/* eslint-disable */
import CTokenLedgerDto from './dto/CTokenLedgerDto';
import { CoreOptions } from 'request';
/* eslint-enable */
import { doPostRequest } from '../common/DoRequest';
import AppError from '../common/AppError';
import { ResponseCode } from '../common/ResponseCode';

export default class CTokenLedgerService {
    /**
     * CToken台帳サービスの差分登録APIを実行
     * @param cTokenLedgerDto
     */
    public async postLocal (cTokenLedgerDto: CTokenLedgerDto): Promise<any> {
        const operator = cTokenLedgerDto.getOperator();
        const message = cTokenLedgerDto.getMessage();
        const bodyStr = JSON.stringify(cTokenLedgerDto.toJsonRequestBody());

        // 接続のためのオプションを生成
        const options: CoreOptions = {
            headers: {
                accept: 'application/json',
                'Content-Type': 'application/json',
                session: operator.encoded,
                'Content-Length': Buffer.byteLength(bodyStr)
            },
            body: bodyStr
        };

        try {
            // 差分登録APIを実行
            const result = await doPostRequest(cTokenLedgerDto.getUrl(), options);

            // レスポンスコードが200以外の場合
            // ステータスコードを判定
            const statusCode: string = result.response.statusCode.toString();
            if (result.response.statusCode === ResponseCode.BAD_REQUEST || result.response.statusCode === ResponseCode.NOT_FOUND) {
                // 応答が400の場合、エラーを返す
                throw new AppError(message.FAILED_CTOKEN_LEDGER_LOCAL, ResponseCode.BAD_REQUEST);
            } else if (statusCode.match(/^5.+/)) {
                // 応答が500系の場合、エラーを返す
                throw new AppError(message.FAILED_CTOKEN_LEDGER_LOCAL, ResponseCode.SERVICE_UNAVAILABLE);
            } else if (result.response.statusCode !== ResponseCode.OK &&
                result.response.statusCode !== ResponseCode.NOT_FOUND) {
                // 応答が200以外の場合、エラーを返す
                throw new AppError(message.FAILED_CTOKEN_LEDGER_LOCAL, ResponseCode.UNAUTHORIZED);
            }
            // 利用者ID連携取得情報を戻す
            return result.body;
        } catch (err) {
            if (err.name === AppError.NAME) {
                throw err;
            }
            // サービスへの接続に失敗した場合
            throw new AppError(message.FAILED_CONNECT_TO_CTOKEN_LEDGER, ResponseCode.SERVICE_UNAVAILABLE, err);
        }
    }
}
