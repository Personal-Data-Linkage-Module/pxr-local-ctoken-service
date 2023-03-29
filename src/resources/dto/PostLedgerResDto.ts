/** Copyright 2022 NEC Corporation
Released under the MIT license.
https://opensource.org/licenses/mit-license.php
*/
/* eslint-disable */
/* eslint-enable */

export default class PostLedgerResDto {
    result: string;

    /**
     * レスポンス用のオブジェクトに変換する
     */
    public toJSON (): {} {
        return {
            result: this.result
        };
    }
}
