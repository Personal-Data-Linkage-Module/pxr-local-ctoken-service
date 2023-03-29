/** Copyright 2022 NEC Corporation
Released under the MIT license.
https://opensource.org/licenses/mit-license.php
*/
import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    CreateDateColumn,
    UpdateDateColumn,
    BaseEntity,
    ManyToOne,
    JoinColumn
} from 'typeorm';
import RowHashEntity from './RowHashEntity';

/**
 * Documentテーブルエンティティ
 */
@Entity('document')
export default class DocumentEntity extends BaseEntity {
    /** ID */
    @PrimaryGeneratedColumn({ type: 'bigint' })
    readonly id: number;

    /** rowHashId */
    @Column({ type: 'bigint', nullable: false, name: 'row_hash_id' })
    rowHashId: number;

    /** ドキュメント識別子 */
    @Column({ type: 'varchar', length: 255, nullable: false, name: '_1_1' })
    docIdentifier: string;

    /** ドキュメント種別カタログコード */
    @Column({ type: 'bigint', name: '_1_2_1' })
    docCatalogCode: number;

    /** ドキュメント種別カタログバージョン */
    @Column({ type: 'bigint', name: '_1_2_2' })
    docCatalogVersion: number;

    /** ドキュメント作成時間 */
    @Column({ type: 'timestamp without time zone', name: '_2_1' })
    docCreateAt: Date;

    /** ドキュメントを発生させたアクター識別子カタログコード */
    @Column({ type: 'bigint', name: '_3_1_1' })
    docActorCode: number;

    /** ドキュメントを発生させたアクター識別子カタログバージョン */
    @Column({ type: 'bigint', name: '_3_1_2' })
    docActorVersion: number;

    /** ワークフロー識別子カタログコード */
    @Column({ type: 'bigint', name: '_3_2_1' })
    docWfCatalogCode: number;

    /** ワークフロー識別子カタログバージョン */
    @Column({ type: 'bigint', name: '_3_2_2' })
    docWfCatalogVersion: number;

    /** アプリケーション識別子カタログコード */
    @Column({ type: 'bigint', name: '_3_5_1' })
    docAppCatalogCode: number;

    /** アプリケーション識別子カタログバージョン */
    @Column({ type: 'bigint', name: '_3_5_2' })
    docAppCatalogVersion: number;

    /** 削除フラグ */
    @Column({ type: 'boolean', nullable: false, default: false, name: 'is_disabled' })
    isDisabled: boolean = false;

    /** 登録者 */
    @Column({ type: 'varchar', length: 255, nullable: false, name: 'created_by' })
    createdBy: string = '';

    /** 登録日時 */
    @CreateDateColumn({ type: 'timestamp without time zone', name: 'created_at' })
    readonly createdAt: Date;

    /** 更新者 */
    @Column({ type: 'varchar', length: 255, nullable: false, name: 'updated_by' })
    updatedBy: string = '';

    /** 更新日時 */
    @UpdateDateColumn({ type: 'timestamp without time zone', name: 'updated_at', onUpdate: 'now()' })
    readonly updatedAt: Date;

    /** CTokenテーブルのレコード */
    @ManyToOne(type => RowHashEntity, rowHash => rowHash.documents)
    @JoinColumn({ name: 'row_hash_id', referencedColumnName: 'id' })
    rowHash: RowHashEntity;
}
