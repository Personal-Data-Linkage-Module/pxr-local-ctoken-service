/** Copyright 2022 NEC Corporation
Released under the MIT license.
https://opensource.org/licenses/mit-license.php
*/
/* eslint-disable */
const EventEmitter = require('events').EventEmitter;

declare module 'express-winston' {
    function errorLogger(options: any): (err: any, req: any, res: any, next: any) => void;
    function logger(options: any): (req: any, res: any, next: any) => void;
}
declare module 'cloud-config-client' {
    function load(options: Object): Promise<NodeModule>;
}
declare module 'node-health-service' {
    function Reporter(config: Object): {
        [x: string]: any;
        monitor: (req: any, res: any, next: any) => void;
        lastError: (req: any, res: any, next: any) => void;
        setLastError: (info: any) => void;
    };
}
declare module 'zipkin' {
    class BatchRecorder {
        constructor({ logger, timeout }: {
            logger: any;
            timeout?: number;
        });
    }
    class Tracer {
        constructor({ ctxImpl, recorder, zsampler }: {
            ctxImpl?: any;
            recorder?: BatchRecorder;
            zsampler?: any;
        });
    }
}
declare module 'node-rest-client' {
    class Client {
        get(url: string, args: Object, callback: Function): void;
        post(url: string, args: Object, callback: Function): void;
        put(url: string, args: Object, callback: Function): void;
        delete(url: string, args: Object, callback: Function): void;
    }
}
