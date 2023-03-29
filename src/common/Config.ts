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
        if (path === './config/config.json') {
            let config: any = null;
            config = JSON.parse(fs.readFileSync('./config/config.json', 'utf-8'));
            if (fs.existsSync('./config/block-common-conf.json')) {
                config = this.mergeDeeply(config, JSON.parse(fs.readFileSync('./config/block-common-conf.json', 'utf-8')));
            }
            if (fs.existsSync('./config/common-conf.json')) {
                config = this.mergeDeeply(config, JSON.parse(fs.readFileSync('./config/common-conf.json', 'utf-8')));
            }
            if (config['ext_name'] || (config['block'] && config['block']['_value'])) {
                let configString: any = JSON.stringify(config);
                if (config['ext_name']) {
                    configString = configString.replace(/{ext_name}/g, config['ext_name']);
                }
                if (config['block'] && config['block']['_value']) {
                    configString = configString.replace(/{block_code}/g, config['block']['_value']);
                }
                config = JSON.parse(configString);
            }
            return config;
        } else {
            return JSON.parse(fs.readFileSync(path, 'utf-8'));
        }
    }

    /**
     * jsonマージ処理
     * @param target
     * @param source
     * @returns
     */
    private static mergeDeeply (target: any, source: any) {
        const isObject = (obj: any) => obj && typeof obj === 'object' && !Array.isArray(obj);
        const result = Object.assign({}, target);
        for (const [sourceKey, sourceValue] of Object.entries(source)) {
            const targetValue = target[sourceKey];
            if (isObject(sourceValue) && isObject(targetValue)) {
                result[sourceKey] = this.mergeDeeply(targetValue, sourceValue);
            } else {
                Object.assign(result, { [sourceKey]: sourceValue });
            }
        }
        return result;
    }
}
