/** Copyright 2022 NEC Corporation
Released under the MIT license.
https://opensource.org/licenses/mit-license.php
*/
import { Application } from './resources/config/Application';
import { connectDatabase } from './common/Connection';

(async () => {
    try {
        await connectDatabase();
    } catch (err) {
        console.error(err);
        process.exit(-101);
    }
})();

export default new Application();
