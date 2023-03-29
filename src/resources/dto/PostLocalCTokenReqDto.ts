/** Copyright 2022 NEC Corporation
Released under the MIT license.
https://opensource.org/licenses/mit-license.php
*/
/* eslint-disable */
import { Transform, Expose, Type } from 'class-transformer';
import {
    IsDate,
    IsArray,
    ArrayNotEmpty,
    IsString,
    IsNumber,
    IsUUID,
    IsOptional,
    IsDefined,
    ValidateNested
} from 'class-validator';
import { transformToDateTime, transformToNumber } from '../../common/Transform';

export class Document {
    /** ドキュメント識別子 */
    @IsUUID()
    @IsDefined()
    @Expose({ name: '2_n_1_1' })
    docIdentifier: string;

    /** ドキュメント種別カタログコード */
    @IsNumber()
    @IsDefined()
    @Transform(transformToNumber)
    @Expose({ name: '2_n_1_2_1' })
    docCatalogCode: number;

    /** ドキュメント種別カタログバージョン */
    @IsNumber()
    @IsDefined()
    @Transform(transformToNumber)
    @Expose({ name: '2_n_1_2_2' })
    docCatalogVersion: number;

    /** ドキュメント作成時間 */
    @IsDate()
    @IsDefined()
    @Transform(transformToDateTime)
    @Expose({ name: '2_n_2_1' })
    docCreateAt: Date;

    /** ドキュメントを発生させたアクター識別子カタログコード */
    @IsNumber()
    @IsDefined()
    @Transform(transformToNumber)
    @Expose({ name: '2_n_3_1_1' })
    docActorCode: number;

    /** ドキュメントを発生させたアクター識別子カタログバージョン */
    @IsNumber()
    @IsDefined()
    @Transform(transformToNumber)
    @Expose({ name: '2_n_3_1_2' })
    docActorVersion: number;

    /** ワークフロー識別子カタログコード */
    @IsNumber()
    @IsOptional()
    @Transform(transformToNumber)
    @Expose({ name: '2_n_3_2_1' })
    docWfCatalogCode: number = null;

    /** ワークフロー識別子カタログバージョン */
    @IsNumber()
    @IsOptional()
    @Transform(transformToNumber)
    @Expose({ name: '2_n_3_2_2' })
    docWfCatalogVersion: number = null;

    /** アプリケーション識別子カタログコード */
    @IsNumber()
    @IsOptional()
    @Transform(transformToNumber)
    @Expose({ name: '2_n_3_5_1' })
    docAppCatalogCode: number = null;

    /** アプリケーション識別子カタログバージョン */
    @IsNumber()
    @IsOptional()
    @Transform(transformToNumber)
    @Expose({ name: '2_n_3_5_2' })
    docAppCatalogVersion: number = null;
}

export class Event {
    /** イベント識別子 */
    @IsUUID()
    @IsDefined()
    @Expose({ name: '3_1_1' })
    eventIdentifier: string;

    /** イベント種別カタログコード */
    @IsNumber()
    @IsDefined()
    @Transform(transformToNumber)
    @Expose({ name: '3_1_2_1' })
    eventCatalogCode: number;

    /** イベント種別カタログバージョン */
    @IsNumber()
    @IsDefined()
    @Transform(transformToNumber)
    @Expose({ name: '3_1_2_2' })
    eventCatalogVersion: number;

    /** イベント開始時間 */
    @IsDate()
    @IsOptional()
    @Transform(transformToDateTime)
    @Expose({ name: '3_2_1' })
    eventStartAt: Date;

    /** イベント終了時間 */
    @IsDate()
    @IsOptional()
    @Transform(transformToDateTime)
    @Expose({ name: '3_2_2' })
    eventEndAt: Date;

    /** イベントを発生させたアクター識別子カタログコード */
    @IsNumber()
    @IsDefined()
    @Transform(transformToNumber)
    @Expose({ name: '3_5_1_1' })
    eventActorCode: number;

    /** イベントを発生させたアクター識別子カタログバージョン */
    @IsNumber()
    @IsDefined()
    @Transform(transformToNumber)
    @Expose({ name: '3_5_1_2' })
    eventActorVersion: number;

    /** ワークフロー識別子カタログコード */
    @IsNumber()
    @IsOptional()
    @Transform(transformToNumber)
    @Expose({ name: '3_5_2_1' })
    eventWfCatalogCode: number = null;

    /** ワークフロー識別子カタログバージョン */
    @IsNumber()
    @IsOptional()
    @Transform(transformToNumber)
    @Expose({ name: '3_5_2_2' })
    eventWfCatalogVersion: number = null;

    /** アプリケーション識別子カタログコード */
    @IsNumber()
    @IsOptional()
    @Transform(transformToNumber)
    @Expose({ name: '3_5_5_1' })
    eventAppCatalogCode: number = null;

    /** アプリケーション識別子カタログバージョン */
    @IsNumber()
    @IsOptional()
    @Transform(transformToNumber)
    @Expose({ name: '3_5_5_2' })
    eventAppCatalogVersion: number = null;
}

export class Thing {
    /** モノ識別子 */
    @IsUUID()
    @IsDefined()
    @Expose({ name: '4_1_1' })
    thingIdentifier: string;

    /** モノ識別子カタログコード */
    @IsNumber()
    @IsDefined()
    @Transform(transformToNumber)
    @Expose({ name: '4_1_2_1' })
    thingCatalogCode: number;

    /** モノ識別子カタログバージョン */
    @IsNumber()
    @IsDefined()
    @Transform(transformToNumber)
    @Expose({ name: '4_1_2_2' })
    thingCatalogVersion: number;

    /** モノを発生させたアクター識別子カタログコード */
    @IsNumber()
    @IsDefined()
    @Transform(transformToNumber)
    @Expose({ name: '4_4_1_1' })
    thingActorCode: number;

    /** モノを発生させたアクター識別子カタログバージョン */
    @IsNumber()
    @IsDefined()
    @Transform(transformToNumber)
    @Expose({ name: '4_4_1_2' })
    thingActorVersion: number;

    /** ワークフロー識別子カタログコード */
    @IsNumber()
    @IsOptional()
    @Transform(transformToNumber)
    @Expose({ name: '4_4_2_1' })
    thingWfCatalogCode: number = null;

    /** ワークフロー識別子カタログバージョン */
    @IsNumber()
    @IsOptional()
    @Transform(transformToNumber)
    @Expose({ name: '4_4_2_2' })
    thingWfCatalogVersion: number = null;

    /** アプリケーション識別子カタログコード */
    @IsNumber()
    @IsOptional()
    @Transform(transformToNumber)
    @Expose({ name: '4_4_5_1' })
    thingAppCatalogCode: number = null;

    /** アプリケーション識別子カタログバージョン */
    @IsNumber()
    @IsOptional()
    @Transform(transformToNumber)
    @Expose({ name: '4_4_5_2' })
    thingAppCatalogVersion: number = null;

    /** 行ハッシュ */
    @IsString()
    @IsDefined()
    rowHash: string;

    /** 行ハッシュ生成時間 */
    @IsDate()
    @IsDefined()
    @Transform(transformToDateTime)
    rowHashCreateAt: Date;
}

export class CMatrix {
    /** PXR-ID */
    @IsString()
    @IsDefined()
    @Expose({ name: '1_1' })
    userId: string;

    /** Document */
    @IsArray()
    @IsDefined()
    @ValidateNested()
    @Type(() => Document)
    document: Document[];

    /** Event */
    @IsDefined()
    @ValidateNested()
    @Type(() => Event)
    event: Event;

    /** Thing */
    @ArrayNotEmpty()
    @IsArray()
    @IsDefined()
    @ValidateNested()
    @Type(() => Thing)
    thing: Thing[];
}

export class DocumentForDelete {
    /** ドキュメント識別子 */
    @IsUUID()
    @IsDefined()
    @Expose({ name: '2_n_1_1' })
    docIdentifier: string;
}

export class EventForDelete {
    /** イベント識別子 */
    @IsUUID()
    @IsDefined()
    @Expose({ name: '3_1_1' })
    eventIdentifier: string;
}

export class ThingForDelete {
    /** モノ識別子 */
    @IsUUID()
    @IsDefined()
    @Expose({ name: '4_1_1' })
    thingIdentifier: string;
}

export class CMatrixForDelete {
    /** PXR-ID */
    @IsString()
    @IsDefined()
    @Expose({ name: '1_1' })
    userId: string;

    /** Document */
    @IsArray()
    @IsDefined()
    @ValidateNested()
    @Type(() => DocumentForDelete)
    document: DocumentForDelete[];

    /** Event */
    @IsDefined()
    @ValidateNested()
    @Type(() => EventForDelete)
    event: EventForDelete;

    /** Thing */
    @ArrayNotEmpty()
    @IsArray()
    @IsDefined()
    @ValidateNested()
    @Type(() => ThingForDelete)
    thing: ThingForDelete[];
}
/* eslint-enable */

export default class PostLocalCTokenReqDto {
    /** add */
    @IsArray()
    @IsDefined()
    @ValidateNested()
    @Type(() => CMatrix)
    add: CMatrix[];

    /** update */
    @IsArray()
    @IsDefined()
    @ValidateNested()
    @Type(() => CMatrix)
    update: CMatrix[];

    /** delete */
    @IsArray()
    @IsDefined()
    @ValidateNested()
    @Type(() => CMatrixForDelete)
    delete: CMatrixForDelete[];
}
