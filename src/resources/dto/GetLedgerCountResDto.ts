/** Copyright 2022 NEC Corporation
Released under the MIT license.
https://opensource.org/licenses/mit-license.php
*/
/* eslint-disable */
/* eslint-enable */

export default class GetLedgerCountResDto {
    count: number;

    /**
     * レスポンス用のオブジェクトに変換する
     */
    public toJSON (): {} {
        return {
            count: this.count
        };
    }
}
