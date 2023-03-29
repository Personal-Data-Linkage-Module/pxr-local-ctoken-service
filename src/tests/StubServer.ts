/** Copyright 2022 NEC Corporation
Released under the MIT license.
https://opensource.org/licenses/mit-license.php
*/
/* eslint-disable */
import AppError from '../common/AppError';
import express = require('express');
import { Server } from 'net';
/* eslint-enable */

export class CtolenLedgerServer {
    app: express.Express;
    server: Server;
    constructor (status: number) {
        this.app = express();
        this.app.use(express.json({ limit: '100mb' }));
        this.app.use(express.urlencoded({ extended: false }));
        this.app.post('/ctoken-ledger/local', (req: express.Request, res: express.Response) => {
            res.status(status).end();
        });
        this.server = this.app.listen(3008);
    }
}

export class OperatorServer {
    app: express.Express;
    server: Server;
    constructor (status: number, type: number) {
        this.app = express();
        this.app.use(express.json({ limit: '100mb' }));
        this.app.use(express.urlencoded({ extended: false }));
        this.app.post('/operator/session', (req: express.Request, res: express.Response) => {
            if (status === 200) {
                res.status(200)
                    .json({
                        sessionId: '5b4fcfb619a4fd3215e3582412eecfd5ab7e06eb112c52402805a730e8737899',
                        operatorId: 1,
                        type: type,
                        loginId: 'root_member01',
                        lastLoginAt: '2020-02-18 18:07:55.906',
                        auth: {
                            member: {
                                add: true,
                                update: true,
                                delete: true
                            }
                        },
                        block: {
                            _value: 1000112,
                            _ver: 1
                        },
                        actor: {
                            _value: 1000004,
                            _ver: 1
                        }
                    })
                    .end();
            } else {
                res.status(status).end();
            }
        });
        this.server = this.app.listen(3000);
    }
}

export class BookManageServer {
    _app: express.Express;
    server: Server;
    constructor (status: number) {
        const _listener = (req: express.Request, res: express.Response) => {
            if (status === 200) {
                res.status(200).json({ result: 'success' });
                return;
            } else if (status === 0) {
            }
            res.status(status).end();
        };
        this._app = express();
        this._app.post('/book-manage/store-event/notificate', _listener);
        this.server = this._app.listen(3005);
    }
}
