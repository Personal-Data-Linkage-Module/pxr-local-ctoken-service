/** Copyright 2022 NEC Corporation
Released under the MIT license.
https://opensource.org/licenses/mit-license.php
*/
import fs = require('fs');

/**
 * 設定ファイル操作クラス
 */
export default class Config {
    /**
     * 設定ファイル読込(JSON)
     * @param path
     */
    public static ReadConfig (path: string): any {
        return JSON.parse(fs.readFileSync(path, 'utf-8'));
    }
}
