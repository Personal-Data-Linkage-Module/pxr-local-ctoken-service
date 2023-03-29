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
import * as config from 'config';
import * as log4js from 'log4js';

export const applicationLogger: log4js.Logger = log4js.getLogger('application');

export const systemLogger: log4js.Logger = log4js.getLogger('system');

export const httpLogger: log4js.Logger = log4js.getLogger('http');

export const accessLogger: log4js.Logger = log4js.getLogger('access');

export function getBuildInfo () {
    // ログへ埋め込むJenkinsビルド情報を生成
    let jobName: string = 'none';
    let buildNumber: string = 'none';
    let buildTag: string = 'none';
    if (config.has('buildInfo.jobName')) {
        jobName = String(config.get('buildInfo.jobName'));
    }
    if (config.has('buildInfo.buildNumber')) {
        buildNumber = String(config.get('buildInfo.buildNumber'));
    }
    if (config.has('buildInfo.buildTag')) {
        buildTag = String(config.get('buildInfo.buildTag'));
    }
    const buildInfo = '[Jenkins-Job-Name=' + jobName +
                    ',Jenkins-Build-Number=' + buildNumber +
                    ',Jenkins-Build-Tag=' + buildTag + ']';

    return buildInfo;
}

process.on('unhandledRejection', function (reason: any, p: any) {
    systemLogger.error(getBuildInfo(), 'Possibly Unhandled Rejection at: Promise ', p, ' reason: ', reason);
});
