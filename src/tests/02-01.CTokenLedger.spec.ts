/** Copyright 2022 NEC Corporation
Released under the MIT license.
https://opensource.org/licenses/mit-license.php
*/
/* eslint-disable */
import supertest = require('supertest');
import { connectDatabase } from '../common/Connection';
import { Application } from '../resources/config/Application';
import { BookManageServer, OperatorServer, CtolenLedgerServer } from './StubServer';
import { clear } from './testDatabase';
import { Request } from './Request';
import { Session } from './Session';
import Config from '../common/Config';
/* eslint-enable */
const Message = Config.ReadConfig('./config/message.json');

// 対象アプリケーションを取得
const app = new Application();
const expressApp = app.express.app;

// Unit対象のURL（ベース）
const baseURI = '/local-ctoken/ledger';

// スタブサーバー（オペレータサービス）
let _operatorServer: OperatorServer = null;

// スタブサーバー（CToken台帳サービス）
let _ctokenLedgerServer: CtolenLedgerServer = null;

// スタブサーバー（Book管理サービス）
let _bookManageServer: BookManageServer = null;

// Local-CToken Serviceのユニットテスト
describe('Local-CToken Service', () => {
    beforeAll(async () => {
        // サーバを起動
        app.start();
        await clear();
    });
    afterAll(async () => {
        // サーバ停止
        app.stop();
    });
    /**
     * 各テスト実行の後処理
     */
    afterEach(async () => {
        if (_operatorServer) {
            _operatorServer.server.close();
            _operatorServer = null;
        }
        if (_ctokenLedgerServer) {
            _ctokenLedgerServer.server.close();
            _ctokenLedgerServer = null;
        }
        if (_bookManageServer) {
            _bookManageServer.server.close();
            _bookManageServer = null;
        }
    });
    describe('台帳登録API POST: ' + baseURI, () => {
        test('パラメータ異常: 空のオブジェクト', async () => {
            const response = await supertest(expressApp)
                .post(baseURI)
                .set({ accept: 'application/json', 'Content-Type': 'application/json' })
                .send({});

            // Expect status is bad request
            expect(response.status).toBe(400);
            expect(response.body.message).toBe(Message.REQUEST_IS_EMPTY);
        });
        test('パラメータ異常: リクエストが配列', async () => {
            const response = await supertest(expressApp)
                .post(baseURI)
                .set({ accept: 'application/json', 'Content-Type': 'application/json' })
                .send([]);

            // Expect status is bad request
            expect(response.status).toBe(400);
            expect(response.body.message).toBe('リクエストボディが配列であることを許容しません');
        });
        test('パラメータ異常: offset未定義', async () => {
            _ctokenLedgerServer = new CtolenLedgerServer(200);

            const response = await supertest(expressApp)
                .post(baseURI)
                .set({ accept: 'application/json', 'Content-Type': 'application/json' })
                .set({ session: JSON.stringify(Session.wfStaff) })
                .send({
                    count: 1000
                });

            expect(response.status).toBe(400);
            expect(response.body.reasons.length).toBe(1);
            expect(response.body.reasons[0].property).toBe('offset');
            expect(response.body.reasons[0].value).toBe(null);
            expect(response.body.reasons[0].message).toBe(Message.validation.isDefined);
        });
        test('パラメータ異常: count未定義', async () => {
            _ctokenLedgerServer = new CtolenLedgerServer(200);

            const response = await supertest(expressApp)
                .post(baseURI)
                .set({ accept: 'application/json', 'Content-Type': 'application/json' })
                .set({ session: JSON.stringify(Session.wfStaff) })
                .send({
                    offset: 0
                });

            expect(response.status).toBe(400);
            expect(response.body.reasons.length).toBe(1);
            expect(response.body.reasons[0].property).toBe('count');
            expect(response.body.reasons[0].value).toBe(null);
            expect(response.body.reasons[0].message).toBe(Message.validation.isDefined);
        });
        test('パラメータ異常: offset最小値', async () => {
            _ctokenLedgerServer = new CtolenLedgerServer(200);

            const response = await supertest(expressApp)
                .post(baseURI)
                .set({ accept: 'application/json', 'Content-Type': 'application/json' })
                .set({ session: JSON.stringify(Session.wfStaff) })
                .send({
                    offset: -1,
                    count: 1000
                });

            expect(response.status).toBe(400);
            expect(response.body.reasons.length).toBe(1);
            expect(response.body.reasons[0].property).toBe('offset');
            expect(response.body.reasons[0].value).toBe(-1);
            expect(response.body.reasons[0].message).toBe(Message.validation.min);
        });
        test('パラメータ異常: count最小値', async () => {
            _ctokenLedgerServer = new CtolenLedgerServer(200);

            const response = await supertest(expressApp)
                .post(baseURI)
                .set({ accept: 'application/json', 'Content-Type': 'application/json' })
                .set({ session: JSON.stringify(Session.wfStaff) })
                .send({
                    offset: 0,
                    count: 0
                });

            expect(response.status).toBe(400);
            expect(response.body.reasons.length).toBe(1);
            expect(response.body.reasons[0].property).toBe('count');
            expect(response.body.reasons[0].value).toBe(null);
            expect(response.body.reasons[0].message).toBe(Message.validation.min);
        });
        test('パラメータ異常: count最大値', async () => {
            _ctokenLedgerServer = new CtolenLedgerServer(200);

            const response = await supertest(expressApp)
                .post(baseURI)
                .set({ accept: 'application/json', 'Content-Type': 'application/json' })
                .set({ session: JSON.stringify(Session.wfStaff) })
                .send({
                    offset: 0,
                    count: 1001
                });

            expect(response.status).toBe(400);
            expect(response.body.reasons.length).toBe(1);
            expect(response.body.reasons[0].property).toBe('count');
            expect(response.body.reasons[0].value).toBe(1001);
            expect(response.body.reasons[0].message).toBe(Message.validation.max);
        });
        test('正常: データ無し', async () => {
            _ctokenLedgerServer = new CtolenLedgerServer(200);
            _bookManageServer = new BookManageServer(200);

            const response = await supertest(expressApp)
                .post(baseURI)
                .set({ accept: 'application/json', 'Content-Type': 'application/json' })
                .set({ session: JSON.stringify(Session.wfStaff) })
                .send({
                    offset: 0,
                    count: 1000
                });

            expect(response.status).toBe(200);
        });
        test('正常: 追加', async () => {
            _ctokenLedgerServer = new CtolenLedgerServer(200);
            _bookManageServer = new BookManageServer(200);

            // テストデータの登録
            await supertest(expressApp)
                .post('/local-ctoken')
                .set({ accept: 'application/json', 'Content-Type': 'application/json' })
                .set({ session: JSON.stringify(Session.wfStaff) })
                .send(Request.TestData02);

            // テストデータの登録
            await supertest(expressApp)
                .post('/local-ctoken')
                .set({ accept: 'application/json', 'Content-Type': 'application/json' })
                .set({ session: JSON.stringify(Session.wfStaff) })
                .send(Request.TestData03);

            const response = await supertest(expressApp)
                .post(baseURI)
                .set({ accept: 'application/json', 'Content-Type': 'application/json' })
                .set({ session: JSON.stringify(Session.wfStaff) })
                .send({
                    offset: 0,
                    count: 1000
                });

            expect(response.status).toBe(200);
        });
        test('正常: 追加', async () => {
            _ctokenLedgerServer = new CtolenLedgerServer(200);
            _bookManageServer = new BookManageServer(200);

            // テストデータの登録
            await supertest(expressApp)
                .post('/local-ctoken')
                .set({ accept: 'application/json', 'Content-Type': 'application/json' })
                .set({ session: JSON.stringify(Session.wfStaff) })
                .send(Request.AddInDoc);

            // テストデータの登録
            await supertest(expressApp)
                .post('/local-ctoken')
                .set({ accept: 'application/json', 'Content-Type': 'application/json' })
                .set({ session: JSON.stringify(Session.wfStaff) })
                .send(Request.TestData01);

            // テストデータの登録
            await supertest(expressApp)
                .post('/local-ctoken')
                .set({ accept: 'application/json', 'Content-Type': 'application/json' })
                .set({ session: JSON.stringify(Session.wfStaff) })
                .send(Request.TestData04);

            const response = await supertest(expressApp)
                .post(baseURI)
                .set({ accept: 'application/json', 'Content-Type': 'application/json' })
                .set({ session: JSON.stringify(Session.wfStaff) })
                .send({
                    offset: 0,
                    count: 1000
                });

            expect(response.status).toBe(200);
        });
        test('正常: 更新', async () => {
            _ctokenLedgerServer = new CtolenLedgerServer(200);
            _bookManageServer = new BookManageServer(200);

            // テストデータの登録
            await supertest(expressApp)
                .post('/local-ctoken')
                .set({ accept: 'application/json', 'Content-Type': 'application/json' })
                .set({ session: JSON.stringify(Session.wfStaff) })
                .send(Request.Update);

            // テストデータの登録
            await supertest(expressApp)
                .post('/local-ctoken')
                .set({ accept: 'application/json', 'Content-Type': 'application/json' })
                .set({ session: JSON.stringify(Session.wfStaff) })
                .send(Request.UpdateInDoc);

            const response = await supertest(expressApp)
                .post(baseURI)
                .set({ accept: 'application/json', 'Content-Type': 'application/json' })
                .set({ session: JSON.stringify(Session.wfStaff) })
                .send({
                    offset: 0,
                    count: 1000
                });

            expect(response.status).toBe(200);
        });
        test('正常: 削除', async () => {
            _ctokenLedgerServer = new CtolenLedgerServer(200);
            _bookManageServer = new BookManageServer(200);

            // テストデータの登録
            await supertest(expressApp)
                .post('/local-ctoken')
                .set({ accept: 'application/json', 'Content-Type': 'application/json' })
                .set({ session: JSON.stringify(Session.wfStaff) })
                .send(Request.Delete);

            // テストデータの登録
            await supertest(expressApp)
                .post('/local-ctoken')
                .set({ accept: 'application/json', 'Content-Type': 'application/json' })
                .set({ session: JSON.stringify(Session.wfStaff) })
                .send(Request.DeleteInDoc);

            const response = await supertest(expressApp)
                .post(baseURI)
                .set({ accept: 'application/json', 'Content-Type': 'application/json' })
                .set({ session: JSON.stringify(Session.wfStaff) })
                .send({
                    offset: 0,
                    count: 1000
                });

            expect(response.status).toBe(200);
        });
        test('正常: Cookie（個人）', async () => {
            _operatorServer = new OperatorServer(200, 0);
            _bookManageServer = new BookManageServer(200);

            const response = await supertest(expressApp)
                .post(baseURI)
                .set({ accept: 'application/json', 'Content-Type': 'application/json' })
                .set('Cookie', ['operator_type0_session=' + '5b4fcfb619a4fd3215e3582412eecfd5ab7e06eb112c52402805a730e8737899'])
                .send({
                    offset: 0,
                    count: 1000
                });

            expect(response.status).toBe(200);
        });
        test('異常: Cookie（WF職員）', async () => {
            _operatorServer = new OperatorServer(200, 1);
            _bookManageServer = new BookManageServer(200);

            const response = await supertest(expressApp)
                .post(baseURI)
                .set({ accept: 'application/json', 'Content-Type': 'application/json' })
                .set('Cookie', ['operator_type1_session=' + '5b4fcfb619a4fd3215e3582412eecfd5ab7e06eb112c52402805a730e8737899'])
                .send({
                    offset: 0,
                    count: 1000
                });

            expect(response.status).toBe(401);
            expect(response.body.message).toBe(Message.NOT_AUTHORIZED);
        });
        test('正常: Cookie（アプリケーション）', async () => {
            _operatorServer = new OperatorServer(200, 2);
            _bookManageServer = new BookManageServer(200);

            const response = await supertest(expressApp)
                .post(baseURI)
                .set({ accept: 'application/json', 'Content-Type': 'application/json' })
                .set('Cookie', ['operator_type2_session=' + '5b4fcfb619a4fd3215e3582412eecfd5ab7e06eb112c52402805a730e8737899'])
                .send({
                    offset: 0,
                    count: 1000
                });

            expect(response.status).toBe(200);
        });
        test('正常: Cookie（運営メンバー）', async () => {
            _operatorServer = new OperatorServer(200, 3);
            _bookManageServer = new BookManageServer(200);

            const response = await supertest(expressApp)
                .post(baseURI)
                .set({ accept: 'application/json', 'Content-Type': 'application/json' })
                .set('Cookie', ['operator_type3_session=' + '5b4fcfb619a4fd3215e3582412eecfd5ab7e06eb112c52402805a730e8737899'])
                .send({
                    offset: 0,
                    count: 1000
                });

            expect(response.status).toBe(200);
        });
        test('異常: 未ログイン', async () => {
            _bookManageServer = new BookManageServer(200);
            const response = await supertest(expressApp)
                .post(baseURI)
                .set({ accept: 'application/json', 'Content-Type': 'application/json' })
                .send({
                    offset: 0,
                    count: 1000
                });

            expect(response.status).toBe(401);
            expect(response.body.message).toBe(Message.NOT_AUTHORIZED);
        });
        test('異常: オペレーターサービスからの応答が204', async () => {
            _operatorServer = new OperatorServer(204, 1);
            _bookManageServer = new BookManageServer(200);

            const response = await supertest(expressApp)
                .post(baseURI)
                .set({ accept: 'application/json', 'Content-Type': 'application/json' })
                .set('Cookie', ['operator_type2_session=' + '5b4fcfb619a4fd3215e3582412eecfd5ab7e06eb112c52402805a730e8737899'])
                .send({
                    offset: 0,
                    count: 1000
                });

            expect(response.status).toBe(401);
            expect(response.body.message).toBe(Message.NOT_AUTHORIZED);
        });
        test('異常: オペレーターサービスからの応答が400', async () => {
            _operatorServer = new OperatorServer(400, 1);
            _bookManageServer = new BookManageServer(200);

            const response = await supertest(expressApp)
                .post(baseURI)
                .set({ accept: 'application/json', 'Content-Type': 'application/json' })
                .set('Cookie', ['operator_type2_session=' + '5b4fcfb619a4fd3215e3582412eecfd5ab7e06eb112c52402805a730e8737899'])
                .send({
                    offset: 0,
                    count: 1000
                });

            expect(response.status).toBe(401);
            expect(response.body.message).toBe(Message.NOT_AUTHORIZED);
        });
        test('異常: オペレーターサービスからの応答が500', async () => {
            _operatorServer = new OperatorServer(500, 1);
            _bookManageServer = new BookManageServer(200);

            const response = await supertest(expressApp)
                .post(baseURI)
                .set({ accept: 'application/json', 'Content-Type': 'application/json' })
                .set('Cookie', ['operator_type2_session=' + '5b4fcfb619a4fd3215e3582412eecfd5ab7e06eb112c52402805a730e8737899'])
                .send({
                    offset: 0,
                    count: 1000
                });

            expect(response.status).toBe(500);
            expect(response.body.message).toBe(Message.FAILED_TAKE_SESSION);
        });
        test('異常: オペレーターサービスとの接続に失敗', async () => {
            _bookManageServer = new BookManageServer(200);
            const response = await supertest(expressApp)
                .post(baseURI)
                .set({ accept: 'application/json', 'Content-Type': 'application/json' })
                .set('Cookie', ['operator_type2_session=' + '5b4fcfb619a4fd3215e3582412eecfd5ab7e06eb112c52402805a730e8737899'])
                .send({
                    offset: 0,
                    count: 1000
                });

            expect(response.status).toBe(500);
            expect(response.body.message).toBe(Message.FAILED_CONNECT_TO_OPERATOR);
        });
        test('異常: CToken台帳サービスからの応答が400', async () => {
            _ctokenLedgerServer = new CtolenLedgerServer(400);
            _bookManageServer = new BookManageServer(200);

            // テストデータの登録
            await supertest(expressApp)
                .post('/local-ctoken')
                .set({ accept: 'application/json', 'Content-Type': 'application/json' })
                .set({ session: JSON.stringify(Session.wfStaff) })
                .send(Request.TestData01);

            const response = await supertest(expressApp)
                .post(baseURI)
                .set({ accept: 'application/json', 'Content-Type': 'application/json' })
                .set({ session: JSON.stringify(Session.wfStaff) })
                .send({
                    offset: 0,
                    count: 1000
                });

            expect(response.status).toBe(400);
            expect(response.body.message).toBe(Message.FAILED_CTOKEN_LEDGER_LOCAL);
        });
        test('異常: CToken台帳サービスからの応答が500', async () => {
            _ctokenLedgerServer = new CtolenLedgerServer(500);
            _bookManageServer = new BookManageServer(200);

            const response = await supertest(expressApp)
                .post(baseURI)
                .set({ accept: 'application/json', 'Content-Type': 'application/json' })
                .set({ session: JSON.stringify(Session.wfStaff) })
                .send({
                    offset: 0,
                    count: 1000
                });

            expect(response.status).toBe(503);
            expect(response.body.message).toBe(Message.FAILED_CTOKEN_LEDGER_LOCAL);
        });
        test('異常: CToken台帳サービスからの応答が204', async () => {
            _ctokenLedgerServer = new CtolenLedgerServer(204);
            _bookManageServer = new BookManageServer(200);

            const response = await supertest(expressApp)
                .post(baseURI)
                .set({ accept: 'application/json', 'Content-Type': 'application/json' })
                .set({ session: JSON.stringify(Session.wfStaff) })
                .send({
                    offset: 0,
                    count: 1000
                });

            expect(response.status).toBe(401);
            expect(response.body.message).toBe(Message.FAILED_CTOKEN_LEDGER_LOCAL);
        });
        test('異常: CToken台帳サービスとの接続に失敗', async () => {
            _bookManageServer = new BookManageServer(200);
            const response = await supertest(expressApp)
                .post(baseURI)
                .set({ accept: 'application/json', 'Content-Type': 'application/json' })
                .set({ session: JSON.stringify(Session.wfStaff) })
                .send({
                    offset: 0,
                    count: 1000
                });

            expect(response.status).toBe(503);
            expect(response.body.message).toBe(Message.FAILED_CONNECT_TO_CTOKEN_LEDGER);
        });
    });
    describe('台帳登録対象件数取得API GET: ' + baseURI + '/count', () => {
        test('正常: データ無し', async () => {
            _ctokenLedgerServer = new CtolenLedgerServer(200);
            _bookManageServer = new BookManageServer(200);
            // データ準備
            const connection = await connectDatabase();
            await connection.query(`
                UPDATE pxr_local_ctoken.document
                SET is_disabled = true
                ;
                UPDATE pxr_local_ctoken.row_hash
                SET is_disabled = true
                ;
            `);

            const response = await supertest(expressApp)
                .get(baseURI + '/count')
                .set({ accept: 'application/json', 'Content-Type': 'application/json' })
                .set({ session: JSON.stringify(Session.wfStaff) });

            // テストデータ戻し
            await connection.query(`
            UPDATE pxr_local_ctoken.document
            SET is_disabled = false
            ;
            UPDATE pxr_local_ctoken.row_hash
            SET is_disabled = false
            ;
            `);
            expect(response.status).toBe(200);
            expect(response.body).toEqual({ count: 0 });
        });
        test('正常: 追加', async () => {
            _ctokenLedgerServer = new CtolenLedgerServer(200);
            _bookManageServer = new BookManageServer(200);

            // テストデータの登録
            await supertest(expressApp)
                .post('/local-ctoken')
                .set({ accept: 'application/json', 'Content-Type': 'application/json' })
                .set({ session: JSON.stringify(Session.wfStaff) })
                .send(Request.TestData02);

            // テストデータの登録
            await supertest(expressApp)
                .post('/local-ctoken')
                .set({ accept: 'application/json', 'Content-Type': 'application/json' })
                .set({ session: JSON.stringify(Session.wfStaff) })
                .send(Request.TestData03);

            const response = await supertest(expressApp)
                .get(baseURI + '/count')
                .set({ accept: 'application/json', 'Content-Type': 'application/json' })
                .set({ session: JSON.stringify(Session.wfStaff) });

            expect(response.status).toBe(200);
            expect(response.body).toEqual({ count: 3 });
        });
        test('正常: 追加', async () => {
            _ctokenLedgerServer = new CtolenLedgerServer(200);
            _bookManageServer = new BookManageServer(200);

            // テストデータの登録
            await supertest(expressApp)
                .post('/local-ctoken')
                .set({ accept: 'application/json', 'Content-Type': 'application/json' })
                .set({ session: JSON.stringify(Session.wfStaff) })
                .send(Request.AddInDoc);

            // テストデータの登録
            await supertest(expressApp)
                .post('/local-ctoken')
                .set({ accept: 'application/json', 'Content-Type': 'application/json' })
                .set({ session: JSON.stringify(Session.wfStaff) })
                .send(Request.TestData01);

            const response = await supertest(expressApp)
                .get(baseURI + '/count')
                .set({ accept: 'application/json', 'Content-Type': 'application/json' })
                .set({ session: JSON.stringify(Session.wfStaff) });

            expect(response.status).toBe(200);
            expect(response.body).toEqual({ count: 5 });
        });
        test('正常: 更新', async () => {
            _ctokenLedgerServer = new CtolenLedgerServer(200);
            _bookManageServer = new BookManageServer(200);

            // テストデータの登録
            await supertest(expressApp)
                .post('/local-ctoken')
                .set({ accept: 'application/json', 'Content-Type': 'application/json' })
                .set({ session: JSON.stringify(Session.wfStaff) })
                .send(Request.Update);

            // テストデータの登録
            await supertest(expressApp)
                .post('/local-ctoken')
                .set({ accept: 'application/json', 'Content-Type': 'application/json' })
                .set({ session: JSON.stringify(Session.wfStaff) })
                .send(Request.UpdateInDoc);

            const response = await supertest(expressApp)
                .get(baseURI + '/count')
                .set({ accept: 'application/json', 'Content-Type': 'application/json' })
                .set({ session: JSON.stringify(Session.wfStaff) });

            expect(response.status).toBe(200);
            expect(response.body).toEqual({ count: 7 });
        });
        test('正常: 削除', async () => {
            _ctokenLedgerServer = new CtolenLedgerServer(200);
            _bookManageServer = new BookManageServer(200);

            // テストデータの登録
            await supertest(expressApp)
                .post('/local-ctoken')
                .set({ accept: 'application/json', 'Content-Type': 'application/json' })
                .set({ session: JSON.stringify(Session.wfStaff) })
                .send(Request.Delete);

            // テストデータの登録
            await supertest(expressApp)
                .post('/local-ctoken')
                .set({ accept: 'application/json', 'Content-Type': 'application/json' })
                .set({ session: JSON.stringify(Session.wfStaff) })
                .send(Request.DeleteInDoc);

            const response = await supertest(expressApp)
                .get(baseURI + '/count')
                .set({ accept: 'application/json', 'Content-Type': 'application/json' })
                .set({ session: JSON.stringify(Session.wfStaff) });

            expect(response.status).toBe(200);
            expect(response.body).toEqual({ count: 9 });
        });
        test('正常: Cookie（個人）', async () => {
            _operatorServer = new OperatorServer(200, 0);
            _bookManageServer = new BookManageServer(200);

            const response = await supertest(expressApp)
                .get(baseURI + '/count')
                .set({ accept: 'application/json', 'Content-Type': 'application/json' })
                .set('Cookie', ['operator_type0_session=' + '5b4fcfb619a4fd3215e3582412eecfd5ab7e06eb112c52402805a730e8737899']);

            expect(response.status).toBe(200);
            expect(response.body).toEqual({ count: 9 });
        });
        test('異常: Cookie（WF職員）', async () => {
            _operatorServer = new OperatorServer(200, 1);
            _bookManageServer = new BookManageServer(200);

            const response = await supertest(expressApp)
                .get(baseURI + '/count')
                .set({ accept: 'application/json', 'Content-Type': 'application/json' })
                .set('Cookie', ['operator_type1_session=' + '5b4fcfb619a4fd3215e3582412eecfd5ab7e06eb112c52402805a730e8737899']);

            expect(response.status).toBe(401);
            expect(response.body.message).toBe(Message.NOT_AUTHORIZED);
        });
        test('正常: Cookie（アプリケーション）', async () => {
            _operatorServer = new OperatorServer(200, 2);
            _bookManageServer = new BookManageServer(200);

            const response = await supertest(expressApp)
                .get(baseURI + '/count')
                .set({ accept: 'application/json', 'Content-Type': 'application/json' })
                .set('Cookie', ['operator_type2_session=' + '5b4fcfb619a4fd3215e3582412eecfd5ab7e06eb112c52402805a730e8737899']);

            expect(response.status).toBe(200);
            expect(response.body).toEqual({ count: 9 });
        });
        test('正常: Cookie（運営メンバー）', async () => {
            _operatorServer = new OperatorServer(200, 3);
            _bookManageServer = new BookManageServer(200);

            const response = await supertest(expressApp)
                .get(baseURI + '/count')
                .set({ accept: 'application/json', 'Content-Type': 'application/json' })
                .set('Cookie', ['operator_type3_session=' + '5b4fcfb619a4fd3215e3582412eecfd5ab7e06eb112c52402805a730e8737899']);

            expect(response.status).toBe(200);
            expect(response.body).toEqual({ count: 9 });
        });
        test('異常: 未ログイン', async () => {
            _bookManageServer = new BookManageServer(200);
            const response = await supertest(expressApp)
                .get(baseURI + '/count')
                .set({ accept: 'application/json', 'Content-Type': 'application/json' });

            expect(response.status).toBe(401);
            expect(response.body.message).toBe(Message.NOT_AUTHORIZED);
        });
        test('異常: オペレーターサービスからの応答が204', async () => {
            _operatorServer = new OperatorServer(204, 1);
            _bookManageServer = new BookManageServer(200);

            const response = await supertest(expressApp)
                .get(baseURI + '/count')
                .set({ accept: 'application/json', 'Content-Type': 'application/json' })
                .set('Cookie', ['operator_type2_session=' + '5b4fcfb619a4fd3215e3582412eecfd5ab7e06eb112c52402805a730e8737899'])
                .send();

            expect(response.status).toBe(401);
            expect(response.body.message).toBe(Message.NOT_AUTHORIZED);
        });
        test('異常: オペレーターサービスからの応答が400', async () => {
            _operatorServer = new OperatorServer(400, 1);
            _bookManageServer = new BookManageServer(200);

            const response = await supertest(expressApp)
                .get(baseURI + '/count')
                .set({ accept: 'application/json', 'Content-Type': 'application/json' })
                .set('Cookie', ['operator_type2_session=' + '5b4fcfb619a4fd3215e3582412eecfd5ab7e06eb112c52402805a730e8737899']);

            expect(response.status).toBe(401);
            expect(response.body.message).toBe(Message.NOT_AUTHORIZED);
        });
        test('異常: オペレーターサービスからの応答が500', async () => {
            _operatorServer = new OperatorServer(500, 1);
            _bookManageServer = new BookManageServer(200);

            const response = await supertest(expressApp)
                .get(baseURI + '/count')
                .set({ accept: 'application/json', 'Content-Type': 'application/json' })
                .set('Cookie', ['operator_type2_session=' + '5b4fcfb619a4fd3215e3582412eecfd5ab7e06eb112c52402805a730e8737899']);

            expect(response.status).toBe(500);
            expect(response.body.message).toBe(Message.FAILED_TAKE_SESSION);
        });
        test('異常: オペレーターサービスとの接続に失敗', async () => {
            _bookManageServer = new BookManageServer(200);
            const response = await supertest(expressApp)
                .get(baseURI + '/count')
                .set({ accept: 'application/json', 'Content-Type': 'application/json' })
                .set('Cookie', ['operator_type2_session=' + '5b4fcfb619a4fd3215e3582412eecfd5ab7e06eb112c52402805a730e8737899']);

            expect(response.status).toBe(500);
            expect(response.body.message).toBe(Message.FAILED_CONNECT_TO_OPERATOR);
        });
    });
});
