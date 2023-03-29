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
import { NextFunction, Request, Response } from 'express'
import OperatorDomain from '../../domains/OperatorDomain';
import * as log4js from 'log4js';
import * as config from 'config';
/* eslint-enable */
import { applicationLogger, httpLogger, accessLogger } from '../../common/logging';
import Config from '../../common/Config';
import { v4 as uuid } from 'uuid';

const requestContext = require('request-context');
const retRequestId = (): string => {
    return requestContext.get('request:id');
};
const retSessionId = (): string => {
    return requestContext.get('session:id');
};

export default function setupLogging (app: express.Application, level: any = config.get('loglevel')) {
    // request 毎に uuid を採番して request-context に保存
    app.use(requestContext.middleware('request'));
    app.use((req: Request, res: Response, next: NextFunction) => {
        const requestId: string = uuid();
        requestContext.set('request:id', requestId);
        // sessionId を request-context に保存
        const { cookies } = req;
        let sessionId = null;
        if (cookies) {
            sessionId = cookies[OperatorDomain.TYPE_PERSONAL_KEY]
                ? cookies[OperatorDomain.TYPE_PERSONAL_KEY]
                : cookies[OperatorDomain.TYPE_APPLICATION_KEY]
                    ? cookies[OperatorDomain.TYPE_APPLICATION_KEY]
                    : cookies[OperatorDomain.TYPE_MANAGER_KEY];
        }
        if (!sessionId && req.headers.session) {
            let headersSession = decodeURIComponent(req.headers.session + '');
            while (typeof headersSession === 'string') {
                headersSession = JSON.parse(headersSession);
            }
            sessionId = headersSession['sessionId'];
        }
        requestContext.set('session:id', sessionId);
        next();
    });

    // ログ設定ファイルを読込
    const log4Config = Config.ReadConfig('./config/log4js.config.json');
    // layout に pattern で [%x{requestId}], [%x{sessionId}] を使用できるよう、tokens を設定
    for (const key in log4Config.appenders) {
        const appender = log4Config.appenders[key];
        if (appender['layout'] && appender['layout']['pattern'] && appender['layout']['pattern'].indexOf('requestId') > 0) {
            appender['layout']['tokens'] = {
                requestId: retRequestId,
                sessionId: retSessionId
            };
        }
    }

    // Configure log4js
    log4js.configure(log4Config);
    applicationLogger.level = level;

    // setting up express
    setupExpress(app, level);
}

function setupExpress (app: express.Application, level: string) {
    // access log
    app.use(log4js.connectLogger(accessLogger, { level: 'auto' }));

    // request log
    app.use(function (req: any, res: any, next: any) {
        if (req.method === 'GET' || req.method === 'DELETE') {
            httpLogger.info(JSON.stringify(
                {
                    method: req.method,
                    url: req.url,
                    query: req.query
                }
            ));
        } else {
            httpLogger.info(JSON.stringify(
                {
                    method: req.method,
                    url: req.url,
                    body: req.body
                }
            ));
        }
        next();
    });
}
