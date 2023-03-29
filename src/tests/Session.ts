/** Copyright 2022 NEC Corporation
Released under the MIT license.
https://opensource.org/licenses/mit-license.php
*/
/**
 * セッション情報
 */
export namespace Session {
    /**
    * 正常(流通制御、運営メンバー)
    */
    export const pxrRoot = {
        sessionId: 'sessionId',
        operatorId: 1,
        type: 3,
        loginId: 'loginid',
        name: 'test-user',
        mobilePhone: '0311112222',
        auth: {
            add: true,
            update: true,
            delete: true
        },
        lastLoginAt: '2020-01-01T00:00:00.000+0900',
        attributes: {},
        roles: [
            {
                _value: 1,
                _ver: 1
            }
        ],
        block: {
            _value: 1000110,
            _ver: 1
        },
        actor: {
            _value: 1000001,
            _ver: 1
        }
    };

    /**
    * 正常(WF職員)
    */
   export const wfStaff = {
       sessionId: 'sessionId',
       operatorId: 1,
       type: 1,
       loginId: 'wf_staff01',
       name: 'wf_staff01',
       lastLoginAt: '2020-01-01T00:00:00.000+0900',
       attributes: {},
       roles: [
           {
               _value: 1000005,
               _ver: 1
           }
       ],
       block: {
           _value: 1000112,
           _ver: 1
       },
       actor: {
           _value: 1000004,
           _ver: 1
       }
   };
}
