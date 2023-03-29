/** Copyright 2022 NEC Corporation
Released under the MIT license.
https://opensource.org/licenses/mit-license.php
*/
import { connectDatabase } from '../common/Connection';

export async function clear () {
    const connection = await connectDatabase();
    await connection.query(`
        DELETE FROM pxr_local_ctoken.document;
        DELETE FROM pxr_local_ctoken.row_hash;
        SELECT SETVAL('pxr_local_ctoken.document_id_seq', 1, false);
        SELECT SETVAL('pxr_local_ctoken.row_hash_id_seq', 1, false);
    `);
}

export async function insert () {
    const connection = await connectDatabase();
    await connection.query(`
        INSERT INTO pxr_identify_verify.identify_verify VALUES(
            2,
            'ZDFkY2VmZWMtOTI0Mi00OTBkLThmZWUtN2RiMmNkMmY2OGQx',
            1000005,
            1,
            1000008,
            1,
            null,
            null,
            'personal_member01',
            '',
            0,
            '2021-04-01 00:00:00',
            false,
            'personal_member01',
            '2020-02-18 22:15:08.06',
            'personal_member01',
            '2020-02-18 22:15:08.06'
        ),(
            3,
            'NWYzNDQyODItY2VkNC00YmJhLWIxNDQtNmRhZGZlMDg4NWU1',
            1000004,
            1,
            null,
            null,
            1000007,
            1,
            'personal_member02',
            'personal_user02',
            0,
            '2021-04-01 00:00:00',
            false,
            'personal_member01',
            '2020-02-18 22:15:08.264',
            'personal_member01',
            '2020-02-18 22:15:08.264'
        ),(
            4,
            'NWYzNDQyODItY2VkNC00YmJhLWIxNDQtNmRhZGZlMDg4NWU0',
            1000004,
            1,
            null,
            null,
            1000007,
            1,
            'personal_member01',
            '',
            0,
            '2018-04-01 00:00:00',
            false,
            'personal_member01',
            '2020-02-18 22:15:08.264',
            'personal_member01',
            '2020-02-18 22:15:08.264'
        ),(
            5,
            'NWYzNDQyODItY2VkNC00YmJhLWIxNDQtNmRhZGZlMDg4NWU2',
            1000004,
            1,
            null,
            null,
            1000007,
            1,
            'personal_member01',
            '',
            2,
            '2021-04-01 00:00:00',
            false,
            'personal_member01',
            '2020-02-18 22:15:08.264',
            'personal_member01',
            '2020-02-18 22:15:08.264'
        ),(
            6,
            'NWYzNDQyODItY2VkNC00YmJhLWIxNDQtNmRhZGZlMDg4NWU4',
            1000004,
            1,
            null,
            null,
            1000007,
            1,
            'personal_member01',
            '',
            1,
            '2021-04-01 00:00:00',
            false,
            'personal_member01',
            '2020-02-18 22:15:08.264',
            'personal_member01',
            '2020-02-18 22:15:08.264'
        ),(
            7,
            'NWYzNDQyODItY2VkNC00YmJhLWIxNDQtNmRhZGZlMDg4NWU7',
            1000005,
            1,
            1000008,
            1,
            null,
            null,
            'personal_member02',
            '',
            1,
            '2021-04-01 00:00:00',
            false,
            'personal_member01',
            '2020-02-18 22:15:08.264',
            'personal_member01',
            '2020-02-18 22:15:08.264'
        ),(
            8,
            'NWYzNDQyODItY2VkNC00YmJhLWIxNDQtNmRhZGZlMDg4NWU8',
            1000004,
            1,
            null,
            null,
            1000007,
            1,
            'personal_member01',
            '',
            0,
            '2021-04-01 00:00:00',
            false,
            'personal_member01',
            '2020-02-18 22:15:08.264',
            'personal_member01',
            '2020-02-18 22:15:08.264'
        ),(
            9,
            'NWYzNDQyODItY2VkNC00YmJhLWIxNDQtNmRhZGZlMDg4NWU9',
            1000004,
            1,
            null,
            null,
            1000007,
            1,
            'personal_member01',
            '',
            0,
            '2021-04-01 00:00:00',
            false,
            'personal_member01',
            '2020-02-18 22:15:08.264',
            'personal_member01',
            '2020-02-18 22:15:08.264'
        ),(
            10,
            'NWYzNDQyODItY2VkNC00YmJhLWIxNDQtNmRhZGZlMDg4NW10',
            1000004,
            1,
            null,
            null,
            1000007,
            1,
            'personal_member01',
            '',
            0,
            '2021-04-01 00:00:00',
            false,
            'personal_member01',
            '2020-02-18 22:15:08.264',
            'personal_member01',
            '2020-02-18 22:15:08.264'
        ),(
            11,
            'NWYzNDQyODItY2VkNC00YmJhLWIxNDQtNmRhZGZlMDg4NW11',
            1000004,
            1,
            null,
            null,
            1000007,
            1,
            'personal_member01',
            'personal_user01',
            0,
            '2021-04-01 00:00:00',
            false,
            'personal_member01',
            '2020-02-18 22:15:08.264',
            'personal_member01',
            '2020-02-18 22:15:08.264'
        ),(
            12,
            'ZDFkY2VmZWMtOTI0Mi00OTBkLThmZWUtN2RiMmNkMmY2OG12',
            1000005,
            1,
            1000008,
            1,
            null,
            null,
            'personal_member01',
            'personal_user01',
            0,
            '2021-04-01 00:00:00',
            false,
            'personal_member01',
            '2020-02-18 22:15:08.06',
            'personal_member01',
            '2020-02-18 22:15:08.06'
        );
    `);
}
