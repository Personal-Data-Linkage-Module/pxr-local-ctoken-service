/** Copyright 2022 NEC Corporation
Released under the MIT license.
https://opensource.org/licenses/mit-license.php
*/
/**
 *
 *
 *
 * $Date$
 * $Revision$
 * $Author$
 *
 * TEMPLATE VERSION :  76463
 */
import * as config from 'config';
import { HttpError } from 'routing-controllers';

import { applicationLogger } from '../../common/logging';

let backPressureThreshold = 100;
if (config.has('backPressure.threshold')) backPressureThreshold = +config.get<number>('backPressure.threshold');
let threadCount = 0;

/**
 * SDE-MSA-PRIN 過負荷を回避する （MSA-PRIN-ID-02）
 */
export default function EnableSimpleBackPressure (threshold = backPressureThreshold) {
    return function (target: any, propertyKey: string, descriptor: PropertyDescriptor) {
        const originalMethod = descriptor.value;
        descriptor.value = async function (...args: any[]) {
            if (threshold > 0) {
                if (threadCount >= threshold) {
                    const message = 'API is busy. ' + String(threadCount) +
                                    ' thread are working. Limit is ' + String(threshold) + '.';
                    applicationLogger.warn(message);

                    throw new HttpError(503, message);
                }

                let result: any;
                try {
                    threadCount++;

                    result = await originalMethod.apply(this, args);
                } catch (e) {
                    applicationLogger.error(e);
                    throw e;
                } finally {
                    threadCount--;
                }

                return result;
            } else {
                return originalMethod.apply(this, args);
            }
        };
        return descriptor;
    };
}
