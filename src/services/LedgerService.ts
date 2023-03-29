/** Copyright 2022 NEC Corporation
Released under the MIT license.
https://opensource.org/licenses/mit-license.php
*/
/* eslint-disable */
import RowHashEntity from '../repositories/postgres/RowHashEntity';
import OperatorDomain from 'domains/OperatorDomain';
import CTokenLedgerDto, { LedgerRequest, CMatrix, Document, Event, Thing } from './dto/CTokenLedgerDto';
import { connectDatabase } from '../common/Connection';
import PostLedgerReqDto from '../resources/dto/PostLedgerReqDto';
/* eslint-enable */
import Config from '../common/Config';
import { Service } from 'typedi';
import { EntityOperation } from '../repositories/EntityOperation';
import PostLedgerResDto from '../resources/dto/PostLedgerResDto';
import CTokenLedgerService from './CTokenLedgerService';
import GetLedgerCountResDto from '../resources/dto/GetLedgerCountResDto';
const Message = Config.ReadConfig('./config/message.json');
const Configure = Config.ReadConfig('./config/config.json');

@Service()
export default class LedgerService {
    /**
     * 台帳登録
     * @param operator
     * @param dto
     */
    public static async postLedger (operator: OperatorDomain, dto: PostLedgerReqDto): Promise<any> {
        const sendStatus: number = 1;
        const connection = await connectDatabase();
        await connection.transaction(async transaction => {
            // PXR-IDと検索時間に一致するレコードを取得する
            const rowHashList: RowHashEntity[] = await EntityOperation.getUnsentRowHash(dto.offset, dto.count);

            // レスポンスを作成
            const requests: LedgerRequest = new LedgerRequest();
            for (const rowHash of rowHashList) {
                if (rowHash.type === RowHashEntity.TYPE_ADD) {
                    this.pushCTokenLedgerRequest(requests.add, rowHash);
                } else if (rowHash.type === RowHashEntity.TYPE_UPDATE) {
                    this.pushCTokenLedgerRequest(requests.update, rowHash);
                } else {
                    this.pushCTokenLedgerRequest(requests.delete, rowHash);
                }
                await transaction.update(RowHashEntity, { id: rowHash.id }, { status: sendStatus });
            }
            // 台帳登録
            if (requests.add.length > 0 || requests.update.length > 0 || requests.delete.length > 0) {
                const cTokenLedgerDto = new CTokenLedgerDto();
                cTokenLedgerDto.setOperator(operator);
                cTokenLedgerDto.setRequestBody(requests);
                cTokenLedgerDto.setMessage(Message);
                cTokenLedgerDto.setUrl(Configure.cTokenLedger.local);
                const cTokenLedgerService = new CTokenLedgerService();
                await cTokenLedgerService.postLocal(cTokenLedgerDto);
            }
        }).catch(err => {
            throw err;
        });

        // レスポンスを生成、処理を終了
        const res = new PostLedgerResDto();
        res.result = 'success';
        return res.toJSON();
    }

    /**
     * 台帳登録対象件数取得
     */
    public static async getLedgerCount (): Promise<any> {
        // PXR-IDと検索時間に一致するレコードの件数を取得する
        const count: number = await EntityOperation.getUnsentRowHashCount();

        // レスポンスを生成、処理を終了
        const res = new GetLedgerCountResDto();
        res.count = count;
        return res.toJSON();
    }

    /**
     * リファクタ履歴
     *  separate : pushDocumentAndThing（ドキュメント・モノ追加）
     *  separate : setDocument（ドキュメント設定）
     *  separate : setThing（モノ設定）
     */
    private static async pushCTokenLedgerRequest (requests: CMatrix[], rowHash: RowHashEntity) {
        let isExist = false;
        for (const request of requests) {
            if (request.event.eventIdentifier === rowHash.eventIdentifier) {
                // ドキュメント・モノがあるか確認してなければ追加
                LedgerService.pushDocumentAndThing(rowHash, request);

                isExist = true;
                break;
            }
        }
        if (!isExist) {
            const documents: Document[] = [];
            if (rowHash.documents && Array.isArray(rowHash.documents) && rowHash.documents.length > 0) {
                for (const doc of rowHash.documents) {
                    LedgerService.setDocument(doc, documents);
                }
            }
            const event: Event = {
                eventIdentifier: rowHash.eventIdentifier,
                eventCatalogCode: rowHash.eventCatalogCode,
                eventCatalogVersion: rowHash.eventCatalogVersion,
                eventStartAt: rowHash.eventStartAt,
                eventEndAt: rowHash.eventEndAt,
                eventActorCode: rowHash.eventActorCode,
                eventActorVersion: rowHash.eventActorVersion,
                eventAppCatalogCode: rowHash.eventAppCatalogCode,
                eventAppCatalogVersion: rowHash.eventAppCatalogVersion
            };
            const things: Thing[] = LedgerService.setThing(rowHash);

            const ledgerRequest = new CMatrix();
            ledgerRequest.userId = rowHash.personIdentifier;
            ledgerRequest.document = documents;
            ledgerRequest.event = event;
            ledgerRequest.thing = things;
            requests.push(ledgerRequest);
        }
    }

    /**
     * ドキュメント・モノ追加
     * @param rowHash
     * @param request
     */
    private static pushDocumentAndThing (rowHash: RowHashEntity, request: CMatrix) {
        // ドキュメントがあるか確認してなければ追加
        if (rowHash.documents && Array.isArray(rowHash.documents) && rowHash.documents.length > 0) {
            for (const doc of rowHash.documents) {
                const isExistDoc = request.document.some(ele => ele.docIdentifier === doc.docIdentifier);
                if (!isExistDoc) {
                    const document = new Document();
                    document.docIdentifier = doc.docIdentifier;
                    document.docCatalogCode = doc.docCatalogCode;
                    document.docCatalogVersion = doc.docCatalogVersion;
                    document.docCreateAt = doc.docCreateAt;
                    document.docActorCode = doc.docActorCode;
                    document.docActorVersion = doc.docActorVersion;
                    document.docAppCatalogCode = doc.docAppCatalogCode;
                    document.docAppCatalogVersion = doc.docAppCatalogVersion;
                    request.document.push(document);
                }
            }
        }

        // モノがあるか確認してなければ追加
        const isExistThing = request.thing.some(ele => ele.thingIdentifier === rowHash.thingIdentifier);
        if (!isExistThing) {
            const thing = new Thing();
            thing.thingIdentifier = rowHash.thingIdentifier;
            thing.thingCatalogCode = rowHash.thingCatalogCode;
            thing.thingCatalogVersion = rowHash.thingCatalogVersion;
            thing.thingActorCode = rowHash.thingActorCode;
            thing.thingActorVersion = rowHash.thingActorVersion;
            thing.thingAppCatalogCode = rowHash.thingAppCatalogCode;
            thing.thingAppCatalogVersion = rowHash.thingAppCatalogVersion;
            thing.rowHash = rowHash.rowHash;
            thing.rowHashCreateAt = rowHash.rowHashCreateAt;
            request.thing.push(thing);
        }
    }

    /**
     * ドキュメント設定
     * @param doc
     * @param documents
     */
    private static setDocument (doc: any, documents: Document[]) {
        const document = new Document();
        document.docIdentifier = doc.docIdentifier;
        document.docCatalogCode = doc.docCatalogCode;
        document.docCatalogVersion = doc.docCatalogVersion;
        document.docCreateAt = doc.docCreateAt;
        document.docActorCode = doc.docActorCode;
        document.docActorVersion = doc.docActorVersion;
        document.docAppCatalogCode = doc.docAppCatalogCode;
        document.docAppCatalogVersion = doc.docAppCatalogVersion;
        documents.push(document);
    }

    /**
     * モノ設定
     * @param rowHash
     */
    private static setThing (rowHash: RowHashEntity) {
        const things: Thing[] = [];
        const thing = new Thing();
        thing.thingIdentifier = rowHash.thingIdentifier;
        thing.thingCatalogCode = rowHash.thingCatalogCode;
        thing.thingCatalogVersion = rowHash.thingCatalogVersion;
        thing.thingActorCode = rowHash.thingActorCode;
        thing.thingActorVersion = rowHash.thingActorVersion;
        thing.thingAppCatalogCode = rowHash.thingAppCatalogCode;
        thing.thingAppCatalogVersion = rowHash.thingAppCatalogVersion;
        thing.rowHash = rowHash.rowHash;
        thing.rowHashCreateAt = rowHash.rowHashCreateAt;
        things.push(thing);
        return things;
    }
}
