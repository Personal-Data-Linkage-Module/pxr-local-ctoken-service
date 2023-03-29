/** Copyright 2022 NEC Corporation
Released under the MIT license.
https://opensource.org/licenses/mit-license.php
*/
/* eslint-disable */
import RowHashEntity from '../postgres/RowHashEntity';
import { EntityManager } from 'typeorm';
import { connectDatabase } from '../../common/Connection';
import AppError from '../../common/AppError';
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
        throw new AppError('Unit Test Error', 500);
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
}
