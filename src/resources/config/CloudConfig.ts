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
import * as cloudConfig from 'cloud-config-client';

import { systemLogger, getBuildInfo } from '../../common/logging';

/**
 * SDE-MSA-PRIN 外部依存を動的に特定する仕組みを準備する （MSA-PRIN-CD-02）
 */
export class CloudConfig {
    configData: any;
    configName: string;

    constructor (configName: string, private cconf: any = cloudConfig) {
        this.configName = configName;
    }

    getConfigData: () => Promise<{}> = () => {
        return new Promise((resolve, reject) => {
            this.cconf.load({
                endpoint: process.env.CONFIG_SERVER_URL,
                name: this.configName
            }).then((config: any) => {
                this.configData = config;
                resolve(null);
            }).catch((err: any) => {
                systemLogger.error(getBuildInfo(), err);
                reject(err);
            });
        });
    };
}
