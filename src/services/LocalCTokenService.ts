/** Copyright 2022 NEC Corporation
Released under the MIT license.
https://opensource.org/licenses/mit-license.php
*/
/* eslint-disable */
import { Service } from 'typedi';
import Operator from '../domains/OperatorDomain';
import { EntityOperation } from '../repositories/EntityOperation';
import PostLocalCTokenReqDto, { CMatrix, Document, Event, Thing, CMatrixForDelete, DocumentForDelete, EventForDelete, ThingForDelete } from '../resources/dto/PostLocalCTokenReqDto';
import PostLocalCTokenResDto from '../resources/dto/PostLocalCTokenResDto';
import { connectDatabase } from '../common/Connection';
import { EntityManager } from 'typeorm';
import AppError from '../common/AppError';
import { classToPlain } from 'class-transformer';
/* eslint-enable */
import RowHashEntity from '../repositories/postgres/RowHashEntity';
import DocumentEntity from '../repositories/postgres/DocumentEntity';
import Config from '../common/Config';
import { doPostRequest } from '../common/DoRequest';
import { applicationLogger } from '../common/logging';
const config = Config.ReadConfig('./config/config.json');
const Message = Config.ReadConfig('./config/message.json');

@Service()
export default class LocalCTokenService {
    /**
     * Local-CToken登録
     * @param operator
     * @param dto
     */
    public static async postLocalCToken (operator: Operator, dto: PostLocalCTokenReqDto): Promise<any> {
        let reqDelete: {}[] = [];

        // 登録
        const connection = await connectDatabase();
        await connection.transaction(async tran => {
            await this.insertCMatrix(tran, operator, dto.add, RowHashEntity.TYPE_ADD);
            await this.insertCMatrix(tran, operator, dto.update, RowHashEntity.TYPE_UPDATE);
            reqDelete = await this.insertCMatrixForDelete(tran, operator, dto.delete, RowHashEntity.TYPE_DELETE);
        }).catch(err => {
            throw new AppError(Message.FAILED_SAVE_ENTITY, 500, err);
        });

        // Book管理サービス.蓄積イベント通知 APIを呼び出す
        const storeEventNotificateReq = {
            add: dto.add,
            update: dto.update,
            delete: reqDelete
        };
        const body = JSON.stringify(classToPlain(storeEventNotificateReq));
        const url = config['bookManageUrl'] + '/store-event/notificate';
        // 非同期で処理を行う
        doPostRequest(url, {
            headers: {
                accept: 'application/json',
                session: operator.encoded,
                'Content-Type': 'application/json',
                'Content-Length': Buffer.byteLength(body)
            },
            body: body
        }).then(res => {
            if (res.response.statusCode && res.response.statusCode !== 200) {
                // 非同期のためUTでのカバレッジ確保不可
                applicationLogger.error('errorRequest: ' + body);
                throw new AppError(Message.FAILED_STORE_EVENT, 500);
            }
        }).catch(e => {
            throw new AppError(Message.FAILED_STORE_EVENT, 500);
        });

        // レスポンスを生成、処理を終了
        const resDto = new PostLocalCTokenResDto();
        resDto.result = 'success';
        return resDto.toJSON();
    }

    /**
     * リファクタ履歴
     *  separate : getDocs（ドキュメント取得）
     *  separate : setEventRowHashEntity（RowHashEntityのイベント設定）
     *  separate : setThingRowHashEntity（RowHashEntityのモノ設定）
     */
    private static async insertCMatrix (tran: EntityManager, operator: Operator, cMatrix: CMatrix[], type: number) {
        for (let cmatrixIndex = 0; cmatrixIndex < cMatrix.length; cmatrixIndex++) {
            const event = cMatrix[cmatrixIndex].event;
            const docs: DocumentEntity[] = LocalCTokenService.getDocs(cMatrix, cmatrixIndex, operator);
            for (let thingIndex = 0; thingIndex < cMatrix[cmatrixIndex].thing.length; thingIndex++) {
                // RowHashEntityの登録
                const thing = cMatrix[cmatrixIndex].thing[thingIndex];
                const rowHash = new RowHashEntity();
                rowHash.type = type;
                rowHash.status = RowHashEntity.UNSENT_STATUS;
                rowHash.personIdentifier = cMatrix[cmatrixIndex].userId;
                LocalCTokenService.setEventRowHashEntity(rowHash, event);
                LocalCTokenService.setThingRowHashEntity(rowHash, thing);
                rowHash.createdBy = operator.loginId;
                rowHash.updatedBy = operator.loginId;
                rowHash.documents = docs;
                await EntityOperation.insertRows(tran, rowHash);
            }
        }
    }

    /**
     * ドキュメント取得
     * @param cMatrix
     * @param cmatrixIndex
     * @param operator
     * @returns
     */
    private static getDocs (cMatrix: CMatrix[], cmatrixIndex: number, operator: Operator) {
        const docs: DocumentEntity[] = [];
        if (cMatrix[cmatrixIndex].document && Array.isArray(cMatrix[cmatrixIndex].document) && cMatrix[cmatrixIndex].document.length > 0) {
            for (let docIndex = 0; docIndex < cMatrix[cmatrixIndex].document.length; docIndex++) {
                const doc = cMatrix[cmatrixIndex].document[docIndex];
                const document = new DocumentEntity();
                document.docIdentifier = doc.docIdentifier;
                document.docCatalogCode = doc.docCatalogCode;
                document.docCatalogVersion = doc.docCatalogVersion;
                document.docCreateAt = doc.docCreateAt;
                document.docActorCode = doc.docActorCode;
                document.docActorVersion = doc.docActorVersion;
                document.docAppCatalogCode = doc.docAppCatalogCode;
                document.docAppCatalogVersion = doc.docAppCatalogVersion;
                document.createdBy = operator.loginId;
                document.updatedBy = operator.loginId;
                docs.push(document);
            }
        }
        return docs;
    }

    /**
     * RowHashEntityのイベント設定
     * @param rowHash
     * @param event
     */
    private static setEventRowHashEntity (rowHash: RowHashEntity, event: Event) {
        rowHash.eventIdentifier = event.eventIdentifier;
        rowHash.eventCatalogCode = event.eventCatalogCode;
        rowHash.eventCatalogVersion = event.eventCatalogVersion;
        rowHash.eventStartAt = event.eventStartAt ? event.eventStartAt : null;
        rowHash.eventEndAt = event.eventEndAt ? event.eventStartAt : null;
        rowHash.eventActorCode = event.eventActorCode;
        rowHash.eventActorVersion = event.eventActorVersion;
        rowHash.eventAppCatalogCode = event.eventAppCatalogCode ? event.eventAppCatalogCode : null;
        rowHash.eventAppCatalogVersion = event.eventAppCatalogVersion ? event.eventAppCatalogVersion : null;
    }

    /**
     * RowHashEntityのモノ設定
     * @param rowHash
     * @param thing
     */
    private static setThingRowHashEntity (rowHash: RowHashEntity, thing: Thing) {
        rowHash.thingIdentifier = thing.thingIdentifier;
        rowHash.thingCatalogCode = thing.thingCatalogCode;
        rowHash.thingCatalogVersion = thing.thingCatalogVersion;
        rowHash.thingActorCode = thing.thingActorCode;
        rowHash.thingActorVersion = thing.thingActorVersion;
        rowHash.thingAppCatalogCode = thing.thingAppCatalogCode ? thing.thingAppCatalogCode : null;
        rowHash.thingAppCatalogVersion = thing.thingAppCatalogVersion ? thing.thingAppCatalogVersion : null;
        rowHash.rowHash = thing.rowHash;
        rowHash.rowHashCreateAt = thing.rowHashCreateAt;
    }

    /**
     * リファクタ履歴
     *  separate : setResponses（ドキュメント・イベント・モノのレスポンス設定）
     */
    private static async insertCMatrixForDelete (tran: EntityManager, operator: Operator, cMatrix: CMatrixForDelete[], type: number): Promise<{}[]> {
        // Book管理.蓄積イベント通知APIのリクエストデータ
        const res: {}[] = [];

        for (let cmatrixIndex = 0; cmatrixIndex < cMatrix.length; cmatrixIndex++) {
            const event = cMatrix[cmatrixIndex].event;
            const userId = cMatrix[cmatrixIndex].userId;
            const docs: DocumentEntity[] = [];
            const resDoc: {}[] = [];
            let resEvent = null;
            const resThing: {}[] = [];
            if (cMatrix[cmatrixIndex].document && Array.isArray(cMatrix[cmatrixIndex].document) && cMatrix[cmatrixIndex].document.length > 0) {
                for (let docIndex = 0; docIndex < cMatrix[cmatrixIndex].document.length; docIndex++) {
                    const doc = cMatrix[cmatrixIndex].document[docIndex];
                    const document = new DocumentEntity();
                    document.docIdentifier = doc.docIdentifier;
                    document.createdBy = operator.loginId;
                    document.updatedBy = operator.loginId;
                    docs.push(document);
                }
            }

            for (let thingIndex = 0; thingIndex < cMatrix[cmatrixIndex].thing.length; thingIndex++) {
                const thing = cMatrix[cmatrixIndex].thing[thingIndex];
                // 削除前の行ハッシュ取得
                const rowHashDelete = await EntityOperation.getRowHashDelete(userId, event.eventIdentifier, thing.thingIdentifier);

                // ドキュメント・イベント・モノのレスポンス設定
                resEvent = await LocalCTokenService.setResponses(docs, rowHashDelete, resDoc, resThing);

                // RowHashEntityの登録
                const rowHash = new RowHashEntity();
                rowHash.type = type;
                rowHash.status = RowHashEntity.UNSENT_STATUS;
                rowHash.personIdentifier = userId;
                rowHash.eventIdentifier = event.eventIdentifier;
                rowHash.thingIdentifier = thing.thingIdentifier;
                rowHash.createdBy = operator.loginId;
                rowHash.updatedBy = operator.loginId;
                rowHash.documents = docs;
                await EntityOperation.insertRows(tran, rowHash);
            }

            const resData = {
                '1_1': userId,
                document: resDoc,
                event: resEvent,
                thing: resThing
            };
            res.push(resData);
        }
        // 蓄積イベント通知APIのリクエストデータ（delete）を返却
        return res;
    }

    /**
     * ドキュメント・イベント・モノのレスポンス設定
     * @param docs
     * @param rowHashDelete
     * @param resDoc
     * @param resThing
     * @returns
     */
    private static async setResponses (docs: DocumentEntity[], rowHashDelete: RowHashEntity, resDoc: {}[], resThing: {}[]) {
        let resEvent = null;
        // 削除前のドキュメント取得
        for (const doc of docs) {
            const docDelete = await EntityOperation.getDocumentDelete(rowHashDelete.id, doc.docIdentifier);
            // レスポンス ドキュメントの設定
            if (docDelete) {
                resDoc.push(
                    {
                        serialNumber: docDelete.id,
                        '2_n_1_1': docDelete.docIdentifier,
                        '2_n_1_2_1': docDelete.docCatalogCode,
                        '2_n_1_2_2': docDelete.docCatalogVersion,
                        '2_n_2_1': docDelete.docCreateAt,
                        '2_n_3_1_1': docDelete.docActorCode,
                        '2_n_3_1_2': docDelete.docActorVersion,
                        '2_n_3_5_1': docDelete.docAppCatalogCode ? docDelete.docAppCatalogCode : null,
                        '2_n_3_5_2': docDelete.docAppCatalogVersion ? docDelete.docAppCatalogVersion : null
                    }
                );
            }
        }
        // レスポンス モノの設定
        if (rowHashDelete) {
            resThing.push(
                {
                    '4_1_1': rowHashDelete.thingIdentifier,
                    '4_1_2_1': rowHashDelete.thingCatalogCode,
                    '4_1_2_2': rowHashDelete.thingCatalogVersion,
                    '4_4_1_1': rowHashDelete.thingActorCode,
                    '4_4_1_2': rowHashDelete.thingActorVersion,
                    '4_4_5_1': rowHashDelete.thingAppCatalogCode ? rowHashDelete.thingAppCatalogCode : null,
                    '4_4_5_2': rowHashDelete.thingAppCatalogVersion ? rowHashDelete.thingAppCatalogVersion : null,
                    rowHash: rowHashDelete.rowHash,
                    rowHashCreateAt: rowHashDelete.rowHashCreateAt
                }
            );
            // レスポンス イベントの設定
            if (!resEvent) {
                resEvent = {
                    '3_1_1': rowHashDelete.eventIdentifier,
                    '3_1_2_1': rowHashDelete.eventCatalogCode,
                    '3_1_2_2': rowHashDelete.eventCatalogVersion,
                    '3_2_1': rowHashDelete.eventStartAt,
                    '3_2_2': rowHashDelete.eventEndAt,
                    '3_5_1_1': rowHashDelete.eventActorCode,
                    '3_5_1_2': rowHashDelete.eventActorVersion,
                    '3_5_5_1': rowHashDelete.eventAppCatalogCode ? rowHashDelete.eventAppCatalogCode : null,
                    '3_5_5_2': rowHashDelete.eventAppCatalogVersion ? rowHashDelete.eventAppCatalogVersion : null
                };
            }
        }
        return resEvent;
    }
}
