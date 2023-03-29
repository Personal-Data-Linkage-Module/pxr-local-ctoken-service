/** Copyright 2022 NEC Corporation
Released under the MIT license.
https://opensource.org/licenses/mit-license.php
*/
/* eslint-disable */
import RowHashEntity from './postgres/RowHashEntity';
import DocumentEntity from './postgres/DocumentEntity';
import { EntityManager } from 'typeorm';
import { connectDatabase } from '../common/Connection';
/* eslint-enable */

/**
 * Local-CTokenエンティティ操作用 サービスクラス
 */
export class EntityOperation {
    /**
     * RowHash, Document登録
     * @param em
     * @param entity
     */
    static async insertRows (em: EntityManager, entity: RowHashEntity): Promise<RowHashEntity> {
        const repository = em.getRepository(RowHashEntity);
        const rowHashResult = await repository.save(entity);
        const documentRepository = em.getRepository(DocumentEntity);
        for (const document of entity.documents) {
            document.rowHashId = rowHashResult.id;
            await documentRepository.save(document);
        }
        return rowHashResult;
    }

    /**
     * 未送信のRowHash, Documentを取得する
     * @param offset
     * @param count
     */
    static async getUnsentRowHash (offset: number, count: number): Promise<RowHashEntity[]> {
        const connection = await connectDatabase();
        const repository = connection.getRepository(RowHashEntity);
        const sql = repository.createQueryBuilder('row_hash')
            .leftJoinAndSelect(
                'row_hash.documents',
                'documents',
                'documents.isDisabled = false'
            )
            .andWhere('row_hash.status = 0')
            .andWhere('row_hash.isDisabled = false')
            .orderBy('row_hash.id')
            .offset(offset)
            .limit(count);
        const entity = await sql.getMany();
        return entity;
    }

    /**
     * 未送信のRowHash, Documentの件数を取得する
     */
    static async getUnsentRowHashCount (): Promise<number> {
        const connection = await connectDatabase();
        const repository = connection.getRepository(RowHashEntity);
        const sql = repository.createQueryBuilder('row_hash')
            .leftJoinAndSelect(
                'row_hash.documents',
                'documents',
                'documents.isDisabled = false'
            )
            .andWhere('row_hash.status = 0')
            .andWhere('row_hash.isDisabled = false');
        const entity = await sql.getCount();
        return entity;
    }

    /**
     * 削除前の行ハッシュを取得する
     */
    static async getRowHashDelete (userId: string, eventIdentifier: string, thingIdentifier: string): Promise<RowHashEntity> {
        const connection = await connectDatabase();
        const repository = connection.getRepository(RowHashEntity);
        const query = repository.createQueryBuilder('row_hash')
            .where('row_hash."1_1" = :userId', { userId: userId })
            .andWhere('row_hash."3_1_1" = :eventIdentifier', { eventIdentifier: eventIdentifier })
            .andWhere('row_hash."4_1_1" = :thingIdentifier', { thingIdentifier: thingIdentifier })
            .addOrderBy('row_hash.created_at', 'DESC', 'NULLS LAST')
            .limit(1);
        const ret = query.getOne();
        return ret;
    }

    /**
     * 削除前のドキュメントを取得する
     */
    static async getDocumentDelete (rowHashId: number, docIdentifier: string): Promise<DocumentEntity> {
        const connection = await connectDatabase();
        const repository = connection.getRepository(DocumentEntity);
        const query = repository.createQueryBuilder('document')
            .where('document.row_hash_id = :rowHashId', { rowHashId: rowHashId })
            .andWhere('document."_1_1" = :docIdentifier', { docIdentifier: docIdentifier })
            .addOrderBy('document.created_at', 'DESC', 'NULLS LAST')
            .limit(1);
        const ret = query.getOne();
        return ret;
    }
}
