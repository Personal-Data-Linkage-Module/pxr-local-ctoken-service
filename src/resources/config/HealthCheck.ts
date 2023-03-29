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
/* eslint-disable */
import * as express from 'express';
import * as healthCheck from 'node-health-service';
/* eslint-enable */

/**
 * SDE-MSA-PRIN 監視に優しい設計にする （MSA-PRIN-CD-04）
 */
export default async function setupHealthCheck (app: express.Application) {
    // SDE-IMPL-RECOMMENDED 以下コードはヘルスチェックリポーターの設定値を環境変数から取得する場合は有効化してください。
    const reporterConfig = {
        errorTTL: process.env.HEALTH_CHECK_ERR_TTL || 60000, // エラー表示期間
        errorThreshold: process.env.HEALTH_CHECK_ERR_THRESHOLD || 400 // HTTPエラー番号のしきい値設定
    };
    const reporter = healthCheck.Reporter(reporterConfig);
    app.use(reporter.monitor);
    app.get('/health', reporter.lastError);
}
