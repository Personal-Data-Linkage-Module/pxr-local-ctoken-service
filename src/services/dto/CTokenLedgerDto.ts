/** Copyright 2022 NEC Corporation
Released under the MIT license.
https://opensource.org/licenses/mit-license.php
*/
/* eslint-disable */
import OperatorDomain from '../../domains/OperatorDomain';
import { transformFromDateTimeToString } from '../../common/Transform';
import Config from '../../common/Config';
const Confiure = Config.ReadConfig('./config/config.json');
/* eslint-enable */

/**
 * My-Condition-Book管理サービスデータ
 */
export default class CTokenLedgerDto {
    /**
     * オペレータ情報
     */
    private operator: OperatorDomain = null;

    /**
     * リクエストボディ
     */
    private requestBody: LedgerRequest = null;

    /**
     * My-Condition-Book管理サービスURL
     */
    private url: string = null;

    /**
     * message
     */
    private message: any = null;

    /**
     * オペレータ情報取得
     */
    public getOperator (): OperatorDomain {
        return this.operator;
    }

    /**
     * オペレータ情報設定
     * @param operator
     */
    public setOperator (operator: OperatorDomain) {
        this.operator = operator;
    }

    /**
     * My-Condition-Book管理サービスURL取得
     */
    public getUrl (): string {
        return this.url;
    }

    /**
     * My-Condition-Book管理サービスURL設定
     * @param url
     */
    public setUrl (url: string) {
        this.url = url;
    }

    /**
     * requestBody
     */
    public getRequestBody (): LedgerRequest {
        return this.requestBody;
    }

    /**
     * requestBody
     * @param requestBody
     */
    public setRequestBody (requestBody: LedgerRequest) {
        this.requestBody = requestBody;
    }

    /**
     * message
     */
    public getMessage (): any {
        return this.message;
    }

    /**
     * message
     * @param message
     */
    public setMessage (message: any) {
        this.message = message;
    }

    public toJsonRequestBody (): any {
        const req = {
            add: this.toJsonCMatrix(this.requestBody.add),
            update: this.toJsonCMatrix(this.requestBody.update),
            delete: this.toJsonCMatrixForDelete(this.requestBody.delete)
        };
        return req;
    }

    private toJsonCMatrix (cMatrixs: CMatrix[]): any[] {
        const reqs: any[] = [];
        for (const cMatrix of cMatrixs) {
            const reqDocument: any[] = [];
            for (const documentEle of cMatrix.document) {
                const reqDocumentEle = {
                    '2_n_1_1': documentEle.docIdentifier,
                    '2_n_1_2_1': documentEle.docCatalogCode ? Number(documentEle.docCatalogCode) : null,
                    '2_n_1_2_2': documentEle.docCatalogVersion ? Number(documentEle.docCatalogVersion) : null,
                    '2_n_2_1': transformFromDateTimeToString(Confiure.timezone, documentEle.docCreateAt),
                    '2_n_3_1_1': documentEle.docActorCode ? Number(documentEle.docActorCode) : null,
                    '2_n_3_1_2': documentEle.docActorVersion ? Number(documentEle.docActorVersion) : null,
                    '2_n_3_5_1': documentEle.docAppCatalogCode ? Number(documentEle.docAppCatalogCode) : null,
                    '2_n_3_5_2': documentEle.docAppCatalogVersion ? Number(documentEle.docAppCatalogVersion) : null
                };
                reqDocument.push(reqDocumentEle);
            }
            const reqThing: any[] = [];
            for (const thingEle of cMatrix.thing) {
                const reqthingEle = {
                    '4_1_1': thingEle.thingIdentifier,
                    '4_1_2_1': thingEle.thingCatalogCode ? Number(thingEle.thingCatalogCode) : null,
                    '4_1_2_2': thingEle.thingCatalogVersion ? Number(thingEle.thingCatalogVersion) : null,
                    '4_4_1_1': thingEle.thingActorCode ? Number(thingEle.thingActorCode) : null,
                    '4_4_1_2': thingEle.thingActorVersion ? Number(thingEle.thingActorVersion) : null,
                    '4_4_5_1': thingEle.thingAppCatalogCode ? Number(thingEle.thingAppCatalogCode) : null,
                    '4_4_5_2': thingEle.thingAppCatalogVersion ? Number(thingEle.thingAppCatalogVersion) : null,
                    rowHash: thingEle.rowHash,
                    rowHashCreateAt: transformFromDateTimeToString(Confiure.timezone, thingEle.rowHashCreateAt)
                };
                reqThing.push(reqthingEle);
            }
            const reqCmatrix = {
                '1_1': cMatrix.userId,
                document: reqDocument,
                event: {
                    '3_1_1': cMatrix.event.eventIdentifier,
                    '3_1_2_1': cMatrix.event.eventCatalogCode ? Number(cMatrix.event.eventCatalogCode) : null,
                    '3_1_2_2': cMatrix.event.eventCatalogVersion ? Number(cMatrix.event.eventCatalogVersion) : null,
                    '3_2_1': cMatrix.event.eventStartAt ? transformFromDateTimeToString(Confiure.timezone, cMatrix.event.eventStartAt) : null,
                    '3_2_2': cMatrix.event.eventEndAt ? transformFromDateTimeToString(Confiure.timezone, cMatrix.event.eventEndAt) : null,
                    '3_5_1_1': cMatrix.event.eventActorCode ? Number(cMatrix.event.eventActorCode) : null,
                    '3_5_1_2': cMatrix.event.eventActorVersion ? Number(cMatrix.event.eventActorVersion) : null,
                    '3_5_5_1': cMatrix.event.eventAppCatalogCode ? Number(cMatrix.event.eventAppCatalogCode) : null,
                    '3_5_5_2': cMatrix.event.eventAppCatalogVersion ? Number(cMatrix.event.eventAppCatalogVersion) : null
                },
                thing: reqThing
            };
            reqs.push(reqCmatrix);
        }
        return reqs;
    }

    private toJsonCMatrixForDelete (cMatrixs: CMatrix[]): any[] {
        const reqs: any[] = [];
        for (const cMatrix of cMatrixs) {
            const reqDocument: any[] = [];
            for (const documentEle of cMatrix.document) {
                const reqDocumentEle = {
                    '2_n_1_1': documentEle.docIdentifier
                };
                reqDocument.push(reqDocumentEle);
            }
            const reqThing: any[] = [];
            for (const thingEle of cMatrix.thing) {
                const reqthingEle = {
                    '4_1_1': thingEle.thingIdentifier
                };
                reqThing.push(reqthingEle);
            }
            const reqCmatrix = {
                '1_1': cMatrix.userId,
                document: reqDocument,
                event: {
                    '3_1_1': cMatrix.event.eventIdentifier
                },
                thing: reqThing
            };
            reqs.push(reqCmatrix);
        }
        return reqs;
    }
}

export class LedgerRequest {
    /** add */
    add: CMatrix[] = [];

    /** update */
    update: CMatrix[] = [];

    /** delete */
    delete: CMatrix[] = [];
}

export class CMatrix {
    /** UserID */
    userId: string;

    /** Document */
    document: Document[];

    /** Event */
    event: Event;

    /** Thing */
    thing: Thing[];
}

export class Document {
    /** ドキュメント識別子 */
    docIdentifier: string;

    /** ドキュメント種別カタログコード */
    docCatalogCode: number;

    /** ドキュメント種別カタログバージョン */
    docCatalogVersion: number;

    /** ドキュメント作成時間 */
    docCreateAt: Date;

    /** ドキュメントを発生させたアクター識別子カタログコード */
    docActorCode: number;

    /** ドキュメントを発生させたアクター識別子カタログバージョン */
    docActorVersion: number;

    /** アプリケーション識別子カタログコード */
    docAppCatalogCode: number;

    /** アプリケーション識別子カタログバージョン */
    docAppCatalogVersion: number;
}

export class Event {
    /** イベント識別子 */
    eventIdentifier: string;

    /** イベント種別カタログコード */
    eventCatalogCode: number;

    /** イベント種別カタログバージョン */
    eventCatalogVersion: number;

    /** イベント開始時間 */
    eventStartAt: Date;

    /** イベント終了時間 */
    eventEndAt: Date;

    /** イベントを発生させたアクター識別子カタログコード */
    eventActorCode: number;

    /** イベントを発生させたアクター識別子カタログバージョン */
    eventActorVersion: number;

    /** アプリケーション識別子カタログコード */
    eventAppCatalogCode: number;

    /** アプリケーション識別子カタログバージョン */
    eventAppCatalogVersion: number;
}

export class Thing {
    /** モノ識別子 */
    thingIdentifier: string;

    /** モノ識別子カタログコード */
    thingCatalogCode: number;

    /** モノ識別子カタログバージョン */
    thingCatalogVersion: number;

    /** モノを発生させたアクター識別子カタログコード */
    thingActorCode: number;

    /** モノを発生させたアクター識別子カタログバージョン */
    thingActorVersion: number;

    /** アプリケーション識別子カタログコード */
    thingAppCatalogCode: number;

    /** アプリケーション識別子カタログバージョン */
    thingAppCatalogVersion: number;

    /** 行ハッシュ */
    rowHash: string;

    /** 行ハッシュ生成時間 */
    rowHashCreateAt: Date;
}
