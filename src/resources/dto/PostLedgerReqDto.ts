/** Copyright 2022 NEC Corporation
Released under the MIT license.
https://opensource.org/licenses/mit-license.php
*/
/* eslint-disable */
import {
    IsNotEmpty,
    IsNumber,
    Min,
    Max,
    IsDefined
} from 'class-validator';
import { Transform } from 'class-transformer';
import { transformToNumber } from '../../common/Transform';
/* eslint-enable */

export default class PostLedgerReqDto {
    /**
     * 開始位置
     */
    @IsDefined()
    @IsNotEmpty()
    @Transform(transformToNumber)
    @IsNumber()
    @Min(0)
    offset: number;

    /**
     * 対象件数
     */
    @IsDefined()
    @IsNotEmpty()
    @Transform(transformToNumber)
    @IsNumber()
    @Min(1)
    @Max(1000)
    count: number;
}
