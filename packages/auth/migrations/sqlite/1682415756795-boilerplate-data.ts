import { MigrationInterface, QueryRunner } from 'typeorm'

export class boilerplateData1682415756795 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      "INSERT INTO `roles` (uuid, name, version) VALUES ('8802d6a3-b97c-4b25-968a-8fb21c65c3a1', 'USER', 1)",
    )
    await queryRunner.query(
      "INSERT INTO `permissions` (uuid, name) VALUES ('ad1afda0-732e-407c-8162-0950b623e322', 'SYNC_ITEMS')",
    )
    await queryRunner.query(
      "INSERT INTO `role_permissions` (role_uuid, permission_uuid) VALUES ('8802d6a3-b97c-4b25-968a-8fb21c65c3a1', 'ad1afda0-732e-407c-8162-0950b623e322')",
    )
    await queryRunner.query(
      "INSERT INTO `roles` (uuid, name, version) VALUES ('dee6e144-724b-4450-86d1-cc784770b2e2', 'PLUS_USER', 1)",
    )
    await queryRunner.query(
      "INSERT INTO `roles` (uuid, name, version) VALUES ('8047edbb-a10a-4ff8-8d53-c2cae600a8e8', 'PRO_USER', 1)",
    )

    await queryRunner.query(
      "INSERT INTO `permissions` (uuid, name) VALUES ('e4264cff-28e9-4a3d-b903-873dcb88ad2f', 'EXTENDED_NOTE_HISTORY')",
    )
    await queryRunner.query(
      "INSERT INTO `permissions` (uuid, name) VALUES ('0107a26a-6154-4333-a383-d45eb688f1a4', 'UNLIMITED_NOTE_HISTORY')",
    )

    await queryRunner.query(
      "INSERT INTO `role_permissions` (role_uuid, permission_uuid) VALUES ('dee6e144-724b-4450-86d1-cc784770b2e2', 'ad1afda0-732e-407c-8162-0950b623e322')",
    )
    await queryRunner.query(
      "INSERT INTO `role_permissions` (role_uuid, permission_uuid) VALUES ('dee6e144-724b-4450-86d1-cc784770b2e2', 'e4264cff-28e9-4a3d-b903-873dcb88ad2f')",
    )

    await queryRunner.query(
      "INSERT INTO `role_permissions` (role_uuid, permission_uuid) VALUES ('8047edbb-a10a-4ff8-8d53-c2cae600a8e8', 'ad1afda0-732e-407c-8162-0950b623e322')",
    )
    await queryRunner.query(
      "INSERT INTO `role_permissions` (role_uuid, permission_uuid) VALUES ('8047edbb-a10a-4ff8-8d53-c2cae600a8e8', '0107a26a-6154-4333-a383-d45eb688f1a4')",
    )
    await queryRunner.query("DELETE FROM `role_permissions` WHERE role_uuid='dee6e144-724b-4450-86d1-cc784770b2e2'")
    await queryRunner.query("DELETE FROM `role_permissions` WHERE role_uuid='8047edbb-a10a-4ff8-8d53-c2cae600a8e8'")
    await queryRunner.query("DELETE FROM `role_permissions` WHERE role_uuid='8802d6a3-b97c-4b25-968a-8fb21c65c3a1'")
    await queryRunner.query("DELETE FROM `permissions` WHERE name='EXTENDED_NOTE_HISTORY'")
    await queryRunner.query("DELETE FROM `permissions` WHERE name='UNLIMITED_NOTE_HISTORY'")
    await queryRunner.query("DELETE FROM `permissions` WHERE name='SYNC_ITEMS'")
    await queryRunner.query(
      "INSERT INTO `roles` (uuid, name, version) VALUES ('bde42e26-628c-44e6-9d76-21b08954b0bf', 'BASIC_USER', 1)",
    )

    // Permissions
    await queryRunner.query(
      "INSERT INTO `permissions` (uuid, name) VALUES ('42e11c9b-e99b-43a5-bd32-77600c2e5ece', 'theme:midnight')",
    )
    await queryRunner.query(
      "INSERT INTO `permissions` (uuid, name) VALUES ('6e69b059-5324-4087-ba9d-c6c77ed2483c', 'theme:futura')",
    )
    await queryRunner.query(
      "INSERT INTO `permissions` (uuid, name) VALUES ('6cbde260-5a00-46f5-907d-d9843fa87528', 'theme:solarized-dark')",
    )
    await queryRunner.query(
      "INSERT INTO `permissions` (uuid, name) VALUES ('2fdfe72e-2ec9-4600-97e5-5f19eaba8b6a', 'theme:autobiography')",
    )
    await queryRunner.query(
      "INSERT INTO `permissions` (uuid, name) VALUES ('09d0c788-63d7-4159-bd9f-58ec43ba9adf', 'theme:focused')",
    )
    await queryRunner.query(
      "INSERT INTO `permissions` (uuid, name) VALUES ('9bebbdc1-195b-4cb6-9950-d8c9676f5d4e', 'theme:titanium')",
    )
    await queryRunner.query(
      "INSERT INTO `permissions` (uuid, name) VALUES ('db84ebd6-5273-4af9-8d95-5603c6e3f75f', 'editor:bold')",
    )
    await queryRunner.query(
      "INSERT INTO `permissions` (uuid, name) VALUES ('b9d8488a-59aa-420a-8491-1f12b6484876', 'editor:plus')",
    )
    await queryRunner.query(
      "INSERT INTO `permissions` (uuid, name) VALUES ('e1a3c091-3479-4d8d-b4df-66ec6c9f13c2', 'editor:markdown-basic')",
    )
    await queryRunner.query(
      "INSERT INTO `permissions` (uuid, name) VALUES ('6ce3732f-f6bf-46e8-99be-6044903253b2', 'editor:markdown-pro')",
    )
    await queryRunner.query(
      "INSERT INTO `permissions` (uuid, name) VALUES ('39ebab56-00be-4495-8f59-ba25d5127f06', 'editor:markdown-minimist')",
    )
    await queryRunner.query(
      "INSERT INTO `permissions` (uuid, name) VALUES ('b04a7670-934e-4ab1-b8a3-0f27ff159511', 'server:two-factor-auth')",
    )
    await queryRunner.query(
      "INSERT INTO `permissions` (uuid, name) VALUES ('c1039ab1-0d77-49e8-919a-90d190333421', 'server:note-history-unlimited')",
    )
    await queryRunner.query(
      "INSERT INTO `permissions` (uuid, name) VALUES ('a6cb635c-b5ae-4196-90f3-3de269eb33f9', 'server:note-history-365-days')",
    )
    await queryRunner.query(
      "INSERT INTO `permissions` (uuid, name) VALUES ('90cde39c-f4ea-417a-ae25-15db8ef1d828', 'server:note-history-30-days')",
    )
    await queryRunner.query(
      "INSERT INTO `permissions` (uuid, name) VALUES ('3f7044d6-c74d-48c2-8b5d-ef69e8b3d922', 'app:tag-nesting')",
    )
    await queryRunner.query(
      "INSERT INTO `permissions` (uuid, name) VALUES ('baf6d127-70ef-45f1-834c-c9969b3a321f', 'editor:task-editor')",
    )
    await queryRunner.query(
      "INSERT INTO `permissions` (uuid, name) VALUES ('cd250253-82c2-40a5-8f9a-731f8bde7550', 'editor:code-editor')",
    )
    await queryRunner.query(
      "INSERT INTO `permissions` (uuid, name) VALUES ('897551c3-8ba8-48f0-8fb9-5c861b104fcf', 'editor:token-vault')",
    )
    await queryRunner.query(
      "INSERT INTO `permissions` (uuid, name) VALUES ('2ce06684-1f3d-45ee-87c1-df7b4447801b', 'editor:sheets')",
    )
    await queryRunner.query(
      "INSERT INTO `permissions` (uuid, name) VALUES ('82da5111-0066-44a9-acf6-cb15207a93c1', 'component:cloud-link')",
    )
    await queryRunner.query(
      "INSERT INTO `permissions` (uuid, name) VALUES ('1c6295d7-ffab-4881-bdf9-7c80df3885e9', 'component:2fa-manager')",
    )
    await queryRunner.query(
      "INSERT INTO `permissions` (uuid, name) VALUES ('94fec0a8-7581-4690-a482-9eadc9304c35', 'app:files')",
    )
    await queryRunner.query(
      "INSERT INTO `permissions` (uuid, name) VALUES ('eb0575a2-6e26-49e3-9501-f2e75d7dbda3', 'server:daily-email-backup')",
    )
    await queryRunner.query(
      "INSERT INTO `permissions` (uuid, name) VALUES ('c7453402-e16b-4f14-8621-0660a0dc65db', 'server:daily-dropbox-backup')",
    )
    await queryRunner.query(
      "INSERT INTO `permissions` (uuid, name) VALUES ('9c77734a-ba0b-4f7a-8b6b-3e6e1811945b', 'server:daily-gdrive-backup')",
    )
    await queryRunner.query(
      "INSERT INTO `permissions` (uuid, name) VALUES ('a31c94ca-a352-4aab-98d4-92ebb1103e1f', 'server:daily-onedrive-backup')",
    )
    await queryRunner.query(
      "INSERT INTO `permissions` (uuid, name) VALUES ('8650f269-6248-4d63-92cd-da4a29e87363', 'listed:custom-domain')",
    )
    await queryRunner.query(
      "INSERT INTO `permissions` (uuid, name) VALUES ('6b195abd-fa3e-4743-ba10-8d50733d377c', 'server:files-25-gb')",
    )
    await queryRunner.query(
      "INSERT INTO `permissions` (uuid, name) VALUES ('466da066-993a-4d34-b77c-786395fa285a', 'server:files-5-gb')",
    )

    // Pro User Permissions
    await queryRunner.query(
      "INSERT INTO `role_permissions` (role_uuid, permission_uuid) VALUES \
      ('8047edbb-a10a-4ff8-8d53-c2cae600a8e8', '42e11c9b-e99b-43a5-bd32-77600c2e5ece'), \
      ('8047edbb-a10a-4ff8-8d53-c2cae600a8e8', '6e69b059-5324-4087-ba9d-c6c77ed2483c'), \
      ('8047edbb-a10a-4ff8-8d53-c2cae600a8e8', '6cbde260-5a00-46f5-907d-d9843fa87528'), \
      ('8047edbb-a10a-4ff8-8d53-c2cae600a8e8', '2fdfe72e-2ec9-4600-97e5-5f19eaba8b6a'), \
      ('8047edbb-a10a-4ff8-8d53-c2cae600a8e8', '09d0c788-63d7-4159-bd9f-58ec43ba9adf'), \
      ('8047edbb-a10a-4ff8-8d53-c2cae600a8e8', '9bebbdc1-195b-4cb6-9950-d8c9676f5d4e'), \
      ('8047edbb-a10a-4ff8-8d53-c2cae600a8e8', 'db84ebd6-5273-4af9-8d95-5603c6e3f75f'), \
      ('8047edbb-a10a-4ff8-8d53-c2cae600a8e8', 'b9d8488a-59aa-420a-8491-1f12b6484876'), \
      ('8047edbb-a10a-4ff8-8d53-c2cae600a8e8', 'e1a3c091-3479-4d8d-b4df-66ec6c9f13c2'), \
      ('8047edbb-a10a-4ff8-8d53-c2cae600a8e8', '6ce3732f-f6bf-46e8-99be-6044903253b2'), \
      ('8047edbb-a10a-4ff8-8d53-c2cae600a8e8', '39ebab56-00be-4495-8f59-ba25d5127f06'), \
      ('8047edbb-a10a-4ff8-8d53-c2cae600a8e8', 'b04a7670-934e-4ab1-b8a3-0f27ff159511'), \
      ('8047edbb-a10a-4ff8-8d53-c2cae600a8e8', 'c1039ab1-0d77-49e8-919a-90d190333421'), \
      ('8047edbb-a10a-4ff8-8d53-c2cae600a8e8', '3f7044d6-c74d-48c2-8b5d-ef69e8b3d922'), \
      ('8047edbb-a10a-4ff8-8d53-c2cae600a8e8', 'baf6d127-70ef-45f1-834c-c9969b3a321f'), \
      ('8047edbb-a10a-4ff8-8d53-c2cae600a8e8', 'cd250253-82c2-40a5-8f9a-731f8bde7550'), \
      ('8047edbb-a10a-4ff8-8d53-c2cae600a8e8', '897551c3-8ba8-48f0-8fb9-5c861b104fcf'), \
      ('8047edbb-a10a-4ff8-8d53-c2cae600a8e8', '2ce06684-1f3d-45ee-87c1-df7b4447801b'), \
      ('8047edbb-a10a-4ff8-8d53-c2cae600a8e8', '82da5111-0066-44a9-acf6-cb15207a93c1'), \
      ('8047edbb-a10a-4ff8-8d53-c2cae600a8e8', '1c6295d7-ffab-4881-bdf9-7c80df3885e9'), \
      ('8047edbb-a10a-4ff8-8d53-c2cae600a8e8', '94fec0a8-7581-4690-a482-9eadc9304c35'), \
      ('8047edbb-a10a-4ff8-8d53-c2cae600a8e8', 'eb0575a2-6e26-49e3-9501-f2e75d7dbda3'), \
      ('8047edbb-a10a-4ff8-8d53-c2cae600a8e8', 'c7453402-e16b-4f14-8621-0660a0dc65db'), \
      ('8047edbb-a10a-4ff8-8d53-c2cae600a8e8', '9c77734a-ba0b-4f7a-8b6b-3e6e1811945b'), \
      ('8047edbb-a10a-4ff8-8d53-c2cae600a8e8', 'a31c94ca-a352-4aab-98d4-92ebb1103e1f'), \
      ('8047edbb-a10a-4ff8-8d53-c2cae600a8e8', '8650f269-6248-4d63-92cd-da4a29e87363'), \
      ('8047edbb-a10a-4ff8-8d53-c2cae600a8e8', '6b195abd-fa3e-4743-ba10-8d50733d377c') \
    ",
    )

    // Plus User Permissions
    await queryRunner.query(
      "INSERT INTO `role_permissions` (role_uuid, permission_uuid) VALUES \
      ('dee6e144-724b-4450-86d1-cc784770b2e2', '42e11c9b-e99b-43a5-bd32-77600c2e5ece'), \
      ('dee6e144-724b-4450-86d1-cc784770b2e2', '6e69b059-5324-4087-ba9d-c6c77ed2483c'), \
      ('dee6e144-724b-4450-86d1-cc784770b2e2', '6cbde260-5a00-46f5-907d-d9843fa87528'), \
      ('dee6e144-724b-4450-86d1-cc784770b2e2', '09d0c788-63d7-4159-bd9f-58ec43ba9adf'), \
      ('dee6e144-724b-4450-86d1-cc784770b2e2', '9bebbdc1-195b-4cb6-9950-d8c9676f5d4e'), \
      ('dee6e144-724b-4450-86d1-cc784770b2e2', 'db84ebd6-5273-4af9-8d95-5603c6e3f75f'), \
      ('dee6e144-724b-4450-86d1-cc784770b2e2', 'b9d8488a-59aa-420a-8491-1f12b6484876'), \
      ('dee6e144-724b-4450-86d1-cc784770b2e2', 'e1a3c091-3479-4d8d-b4df-66ec6c9f13c2'), \
      ('dee6e144-724b-4450-86d1-cc784770b2e2', '6ce3732f-f6bf-46e8-99be-6044903253b2'), \
      ('dee6e144-724b-4450-86d1-cc784770b2e2', '39ebab56-00be-4495-8f59-ba25d5127f06'), \
      ('dee6e144-724b-4450-86d1-cc784770b2e2', 'b04a7670-934e-4ab1-b8a3-0f27ff159511'), \
      ('dee6e144-724b-4450-86d1-cc784770b2e2', 'a6cb635c-b5ae-4196-90f3-3de269eb33f9'), \
      ('dee6e144-724b-4450-86d1-cc784770b2e2', '3f7044d6-c74d-48c2-8b5d-ef69e8b3d922'), \
      ('dee6e144-724b-4450-86d1-cc784770b2e2', 'baf6d127-70ef-45f1-834c-c9969b3a321f'), \
      ('dee6e144-724b-4450-86d1-cc784770b2e2', 'cd250253-82c2-40a5-8f9a-731f8bde7550'), \
      ('dee6e144-724b-4450-86d1-cc784770b2e2', '2ce06684-1f3d-45ee-87c1-df7b4447801b'), \
      ('dee6e144-724b-4450-86d1-cc784770b2e2', '82da5111-0066-44a9-acf6-cb15207a93c1'), \
      ('dee6e144-724b-4450-86d1-cc784770b2e2', '1c6295d7-ffab-4881-bdf9-7c80df3885e9'), \
      ('dee6e144-724b-4450-86d1-cc784770b2e2', '94fec0a8-7581-4690-a482-9eadc9304c35'), \
      ('dee6e144-724b-4450-86d1-cc784770b2e2', 'eb0575a2-6e26-49e3-9501-f2e75d7dbda3'), \
      ('dee6e144-724b-4450-86d1-cc784770b2e2', 'c7453402-e16b-4f14-8621-0660a0dc65db'), \
      ('dee6e144-724b-4450-86d1-cc784770b2e2', '9c77734a-ba0b-4f7a-8b6b-3e6e1811945b'), \
      ('dee6e144-724b-4450-86d1-cc784770b2e2', 'a31c94ca-a352-4aab-98d4-92ebb1103e1f'), \
      ('dee6e144-724b-4450-86d1-cc784770b2e2', '8650f269-6248-4d63-92cd-da4a29e87363'), \
      ('dee6e144-724b-4450-86d1-cc784770b2e2', '466da066-993a-4d34-b77c-786395fa285a') \
    ",
    )

    // Basic User Permissions
    await queryRunner.query(
      "INSERT INTO `role_permissions` (role_uuid, permission_uuid) VALUES \
      ('bde42e26-628c-44e6-9d76-21b08954b0bf', '42e11c9b-e99b-43a5-bd32-77600c2e5ece'), \
      ('bde42e26-628c-44e6-9d76-21b08954b0bf', '6e69b059-5324-4087-ba9d-c6c77ed2483c'), \
      ('bde42e26-628c-44e6-9d76-21b08954b0bf', '6cbde260-5a00-46f5-907d-d9843fa87528'), \
      ('bde42e26-628c-44e6-9d76-21b08954b0bf', 'db84ebd6-5273-4af9-8d95-5603c6e3f75f'), \
      ('bde42e26-628c-44e6-9d76-21b08954b0bf', 'b9d8488a-59aa-420a-8491-1f12b6484876'), \
      ('bde42e26-628c-44e6-9d76-21b08954b0bf', 'e1a3c091-3479-4d8d-b4df-66ec6c9f13c2'), \
      ('bde42e26-628c-44e6-9d76-21b08954b0bf', '6ce3732f-f6bf-46e8-99be-6044903253b2'), \
      ('bde42e26-628c-44e6-9d76-21b08954b0bf', '39ebab56-00be-4495-8f59-ba25d5127f06'), \
      ('bde42e26-628c-44e6-9d76-21b08954b0bf', '1c6295d7-ffab-4881-bdf9-7c80df3885e9'), \
      ('bde42e26-628c-44e6-9d76-21b08954b0bf', 'b04a7670-934e-4ab1-b8a3-0f27ff159511'), \
      ('bde42e26-628c-44e6-9d76-21b08954b0bf', '90cde39c-f4ea-417a-ae25-15db8ef1d828'), \
      ('bde42e26-628c-44e6-9d76-21b08954b0bf', '3f7044d6-c74d-48c2-8b5d-ef69e8b3d922') \
    ",
    )

    await queryRunner.query(
      "INSERT INTO `permissions` (uuid, name) VALUES ('5f53c349-3fe5-4e5f-a9c5-a7caae6eb90a', 'editor:markdown-math')",
    )

    // Pro User Permissions
    await queryRunner.query(
      "INSERT INTO `role_permissions` (role_uuid, permission_uuid) VALUES ('8047edbb-a10a-4ff8-8d53-c2cae600a8e8', '5f53c349-3fe5-4e5f-a9c5-a7caae6eb90a')",
    )

    // Plus User Permissions
    await queryRunner.query(
      "INSERT INTO `role_permissions` (role_uuid, permission_uuid) VALUES ('dee6e144-724b-4450-86d1-cc784770b2e2', '5f53c349-3fe5-4e5f-a9c5-a7caae6eb90a')",
    )

    // Basic User Permissions
    await queryRunner.query(
      "INSERT INTO `role_permissions` (role_uuid, permission_uuid) VALUES ('bde42e26-628c-44e6-9d76-21b08954b0bf', '5f53c349-3fe5-4e5f-a9c5-a7caae6eb90a')",
    )

    await queryRunner.query("UPDATE `roles` SET `name` = 'CORE_USER' WHERE `name` = 'BASIC_USER'")
    await queryRunner.query("UPDATE `roles` SET `name` = 'BASIC_USER' WHERE `name` = 'USER'")

    await queryRunner.query(
      "UPDATE `user_roles` SET `role_uuid` = '8802d6a3-b97c-4b25-968a-8fb21c65c3a1' WHERE `role_uuid` = 'bde42e26-628c-44e6-9d76-21b08954b0bf'",
    )

    await queryRunner.query(
      "DELETE FROM `role_permissions` WHERE role_uuid='dee6e144-724b-4450-86d1-cc784770b2e2' AND permission_uuid='2ce06684-1f3d-45ee-87c1-df7b4447801b'",
    )

    await queryRunner.query(
      "INSERT INTO `permissions` (uuid, name) VALUES ('8f3d28cd-f17d-423b-8e4d-20143246ccf7', 'component:filesafe')",
    )
    await queryRunner.query(
      "INSERT INTO `permissions` (uuid, name) VALUES ('14283420-6d22-43e6-a63b-26e755604dc6', 'component:folders')",
    )
    await queryRunner.query(
      "INSERT INTO `permissions` (uuid, name) VALUES ('3d362e65-1874-4bcd-ba37-1918aa71f5f6', 'theme:no-distraction')",
    )
    await queryRunner.query(
      "INSERT INTO `permissions` (uuid, name) VALUES ('53812c9b-9c3d-4c3f-927b-5e1479e1e3a0', 'theme:dynamic')",
    )

    // Pro User Permissions
    await queryRunner.query(
      "INSERT INTO `role_permissions` (role_uuid, permission_uuid) VALUES \
    ('8047edbb-a10a-4ff8-8d53-c2cae600a8e8', '8f3d28cd-f17d-423b-8e4d-20143246ccf7'), \
    ('8047edbb-a10a-4ff8-8d53-c2cae600a8e8', '14283420-6d22-43e6-a63b-26e755604dc6'), \
    ('8047edbb-a10a-4ff8-8d53-c2cae600a8e8', '3d362e65-1874-4bcd-ba37-1918aa71f5f6'), \
    ('8047edbb-a10a-4ff8-8d53-c2cae600a8e8', '53812c9b-9c3d-4c3f-927b-5e1479e1e3a0') \
    ",
    )

    // Plus User Permissions
    await queryRunner.query(
      "INSERT INTO `role_permissions` (role_uuid, permission_uuid) VALUES \
      ('dee6e144-724b-4450-86d1-cc784770b2e2', '8f3d28cd-f17d-423b-8e4d-20143246ccf7'), \
      ('dee6e144-724b-4450-86d1-cc784770b2e2', '14283420-6d22-43e6-a63b-26e755604dc6'), \
      ('dee6e144-724b-4450-86d1-cc784770b2e2', '3d362e65-1874-4bcd-ba37-1918aa71f5f6'), \
      ('dee6e144-724b-4450-86d1-cc784770b2e2', '53812c9b-9c3d-4c3f-927b-5e1479e1e3a0') \
    ",
    )

    // Core User Permissions
    await queryRunner.query(
      "INSERT INTO `role_permissions` (role_uuid, permission_uuid) VALUES \
      ('bde42e26-628c-44e6-9d76-21b08954b0bf', '14283420-6d22-43e6-a63b-26e755604dc6'), \
      ('bde42e26-628c-44e6-9d76-21b08954b0bf', '3d362e65-1874-4bcd-ba37-1918aa71f5f6'), \
      ('bde42e26-628c-44e6-9d76-21b08954b0bf', '53812c9b-9c3d-4c3f-927b-5e1479e1e3a0') \
    ",
    )

    await queryRunner.query(
      "INSERT INTO `permissions` (uuid, name) VALUES ('1cd5d412-cb57-4cc0-a982-10045ef92780', 'app:focus-mode')",
    )

    // Pro User Permissions
    await queryRunner.query(
      "INSERT INTO `role_permissions` (role_uuid, permission_uuid) VALUES \
    ('8047edbb-a10a-4ff8-8d53-c2cae600a8e8', '1cd5d412-cb57-4cc0-a982-10045ef92780') \
    ",
    )

    // Plus User Permissions
    await queryRunner.query(
      "INSERT INTO `role_permissions` (role_uuid, permission_uuid) VALUES \
      ('dee6e144-724b-4450-86d1-cc784770b2e2', '1cd5d412-cb57-4cc0-a982-10045ef92780') \
    ",
    )

    // Core User Permissions
    await queryRunner.query(
      "INSERT INTO `role_permissions` (role_uuid, permission_uuid) VALUES \
      ('bde42e26-628c-44e6-9d76-21b08954b0bf', '1cd5d412-cb57-4cc0-a982-10045ef92780') \
    ",
    )

    await queryRunner.query(
      "DELETE FROM `role_permissions` WHERE role_uuid = 'bde42e26-628c-44e6-9d76-21b08954b0bf' AND permission_uuid = '3f7044d6-c74d-48c2-8b5d-ef69e8b3d922'",
    )

    await queryRunner.query(
      "INSERT INTO `roles` (uuid, name, version) VALUES ('23bf88ca-bee1-4a4c-adf0-b7a48749eea7', 'CORE_USER', 2)",
    )
    await queryRunner.query(
      "INSERT INTO `role_permissions` (permission_uuid, role_uuid) VALUES \
      ('1c6295d7-ffab-4881-bdf9-7c80df3885e9', '23bf88ca-bee1-4a4c-adf0-b7a48749eea7'), \
      ('1cd5d412-cb57-4cc0-a982-10045ef92780', '23bf88ca-bee1-4a4c-adf0-b7a48749eea7'), \
      ('39ebab56-00be-4495-8f59-ba25d5127f06', '23bf88ca-bee1-4a4c-adf0-b7a48749eea7'), \
      ('3d362e65-1874-4bcd-ba37-1918aa71f5f6', '23bf88ca-bee1-4a4c-adf0-b7a48749eea7'), \
      ('42e11c9b-e99b-43a5-bd32-77600c2e5ece', '23bf88ca-bee1-4a4c-adf0-b7a48749eea7'), \
      ('53812c9b-9c3d-4c3f-927b-5e1479e1e3a0', '23bf88ca-bee1-4a4c-adf0-b7a48749eea7'), \
      ('5f53c349-3fe5-4e5f-a9c5-a7caae6eb90a', '23bf88ca-bee1-4a4c-adf0-b7a48749eea7'), \
      ('6cbde260-5a00-46f5-907d-d9843fa87528', '23bf88ca-bee1-4a4c-adf0-b7a48749eea7'), \
      ('6ce3732f-f6bf-46e8-99be-6044903253b2', '23bf88ca-bee1-4a4c-adf0-b7a48749eea7'), \
      ('6e69b059-5324-4087-ba9d-c6c77ed2483c', '23bf88ca-bee1-4a4c-adf0-b7a48749eea7'), \
      ('90cde39c-f4ea-417a-ae25-15db8ef1d828', '23bf88ca-bee1-4a4c-adf0-b7a48749eea7'), \
      ('b04a7670-934e-4ab1-b8a3-0f27ff159511', '23bf88ca-bee1-4a4c-adf0-b7a48749eea7'), \
      ('b9d8488a-59aa-420a-8491-1f12b6484876', '23bf88ca-bee1-4a4c-adf0-b7a48749eea7'), \
      ('db84ebd6-5273-4af9-8d95-5603c6e3f75f', '23bf88ca-bee1-4a4c-adf0-b7a48749eea7'), \
      ('e1a3c091-3479-4d8d-b4df-66ec6c9f13c2', '23bf88ca-bee1-4a4c-adf0-b7a48749eea7') \
      ",
    )

    await queryRunner.query(
      "INSERT INTO `permissions` (uuid, name) VALUES ('777d5c74-6201-4253-a56a-26d503e2abbd', 'app:smart-filters')",
    )

    // Core user v1 keep access
    await queryRunner.query(
      "INSERT INTO `role_permissions` (role_uuid, permission_uuid) VALUES ('bde42e26-628c-44e6-9d76-21b08954b0bf', '777d5c74-6201-4253-a56a-26d503e2abbd')",
    )

    // Pro User Permissions
    await queryRunner.query(
      "INSERT INTO `role_permissions` (role_uuid, permission_uuid) VALUES ('8047edbb-a10a-4ff8-8d53-c2cae600a8e8', '777d5c74-6201-4253-a56a-26d503e2abbd')",
    )

    // Plus User Permissions
    await queryRunner.query(
      "INSERT INTO `role_permissions` (role_uuid, permission_uuid) VALUES ('dee6e144-724b-4450-86d1-cc784770b2e2', '777d5c74-6201-4253-a56a-26d503e2abbd')",
    )

    await queryRunner.query("DELETE FROM `permissions` WHERE `name` = 'theme:no-distraction'")

    await queryRunner.query(
      "INSERT INTO `permissions` (uuid, name) VALUES ('2074d312-78bc-4533-b008-38e1232226c0', 'server:sign-in-alerts')",
    )

    // Pro User Permissions
    await queryRunner.query(
      "INSERT INTO `role_permissions` (role_uuid, permission_uuid) VALUES \
    ('8047edbb-a10a-4ff8-8d53-c2cae600a8e8', '2074d312-78bc-4533-b008-38e1232226c0') \
    ",
    )

    // Plus User Permissions
    await queryRunner.query(
      "INSERT INTO `role_permissions` (role_uuid, permission_uuid) VALUES \
      ('dee6e144-724b-4450-86d1-cc784770b2e2', '2074d312-78bc-4533-b008-38e1232226c0') \
    ",
    )

    // Core User Permissions
    await queryRunner.query(
      "INSERT INTO `role_permissions` (role_uuid, permission_uuid) VALUES \
      ('bde42e26-628c-44e6-9d76-21b08954b0bf', '2074d312-78bc-4533-b008-38e1232226c0') \
    ",
    )

    await queryRunner.query(
      "INSERT INTO `permissions` (uuid, name) VALUES ('8bb2f775-484d-4fe1-9617-cc5cd22461d9', 'editor:markdown-visual')",
    )

    // Pro User Permissions
    await queryRunner.query(
      "INSERT INTO `role_permissions` (role_uuid, permission_uuid) VALUES \
    ('8047edbb-a10a-4ff8-8d53-c2cae600a8e8', '8bb2f775-484d-4fe1-9617-cc5cd22461d9') \
    ",
    )

    // Plus User Permissions
    await queryRunner.query(
      "INSERT INTO `role_permissions` (role_uuid, permission_uuid) VALUES \
      ('dee6e144-724b-4450-86d1-cc784770b2e2', '8bb2f775-484d-4fe1-9617-cc5cd22461d9') \
    ",
    )

    await queryRunner.query(
      "DELETE FROM `role_permissions` WHERE permission_uuid IN ('466da066-993a-4d34-b77c-786395fa285a', '6b195abd-fa3e-4743-ba10-8d50733d377c')",
    )

    // Pro User Permissions - 25GB
    await queryRunner.query(
      "INSERT INTO `role_permissions` (role_uuid, permission_uuid) VALUES \
    ('8047edbb-a10a-4ff8-8d53-c2cae600a8e8', '6b195abd-fa3e-4743-ba10-8d50733d377c') \
    ",
    )

    // Plus User Permissions - 5GB
    await queryRunner.query(
      "INSERT INTO `role_permissions` (role_uuid, permission_uuid) VALUES \
      ('dee6e144-724b-4450-86d1-cc784770b2e2', '466da066-993a-4d34-b77c-786395fa285a') \
    ",
    )

    // Core User V2 Permissions
    // add missing server:sign-in-alerts
    await queryRunner.query(
      "INSERT INTO `role_permissions` (role_uuid, permission_uuid) VALUES \
      ('23bf88ca-bee1-4a4c-adf0-b7a48749eea7', '2074d312-78bc-4533-b008-38e1232226c0') \
    ",
    )

    // Core User V1 Permissions
    // add app:tag-nesting
    await queryRunner.query(
      "INSERT INTO `role_permissions` (role_uuid, permission_uuid) VALUES \
      ('bde42e26-628c-44e6-9d76-21b08954b0bf', '3f7044d6-c74d-48c2-8b5d-ef69e8b3d922') \
    ",
    )

    await queryRunner.query(
      "INSERT INTO `roles` (uuid, name, version) VALUES ('1cd9ee6e-bc95-4f32-957c-d8c41f94d4ef', 'FILES_BETA_USER', 1)",
    )
    await queryRunner.query(
      "INSERT INTO `permissions` (uuid, name) VALUES ('155e6901-4c35-422b-8643-c99cdcbcf54d', 'app:files-beta')",
    )
    await queryRunner.query(
      "INSERT INTO `role_permissions` (role_uuid, permission_uuid) VALUES ('1cd9ee6e-bc95-4f32-957c-d8c41f94d4ef', '155e6901-4c35-422b-8643-c99cdcbcf54d')",
    )

    await queryRunner.query(
      "UPDATE `permissions` SET name = 'server:files-max-storage-tier' WHERE name = 'server:files-25-gb'",
    )
    await queryRunner.query(
      "UPDATE `permissions` SET name = 'server:files-low-storage-tier' WHERE name = 'server:files-5-gb'",
    )

    // 2FA for BASIC_USER
    await queryRunner.query(
      "INSERT INTO `role_permissions` (permission_uuid, role_uuid) VALUES \
      ('1c6295d7-ffab-4881-bdf9-7c80df3885e9', '8802d6a3-b97c-4b25-968a-8fb21c65c3a1'), \
      ('b04a7670-934e-4ab1-b8a3-0f27ff159511', '8802d6a3-b97c-4b25-968a-8fb21c65c3a1') \
      ",
    )

    await queryRunner.query("DELETE FROM `permissions` WHERE name='component:2fa-manager'")

    await queryRunner.query(
      "INSERT INTO `role_permissions` (role_uuid, permission_uuid) VALUES \
      ('dee6e144-724b-4450-86d1-cc784770b2e2', '2ce06684-1f3d-45ee-87c1-df7b4447801b'), \
      ('dee6e144-724b-4450-86d1-cc784770b2e2', '897551c3-8ba8-48f0-8fb9-5c861b104fcf'), \
      ('dee6e144-724b-4450-86d1-cc784770b2e2', '2fdfe72e-2ec9-4600-97e5-5f19eaba8b6a') \
    ",
    )

    await queryRunner.query("UPDATE `roles` SET name = 'CORE_USER', version = 3 WHERE name = 'BASIC_USER'")

    await queryRunner.query(
      "INSERT INTO `role_permissions` (role_uuid, permission_uuid) VALUES \
      ('8802d6a3-b97c-4b25-968a-8fb21c65c3a1', 'eb0575a2-6e26-49e3-9501-f2e75d7dbda3') \
    ",
    )

    await queryRunner.query(
      "INSERT INTO `permissions` (uuid, name) VALUES ('0cfac84e-6e35-422d-90ed-fbe01a9a3a1d', 'editor:advanced-checklist')",
    )

    // Pro User Permissions
    await queryRunner.query(
      "INSERT INTO `role_permissions` (role_uuid, permission_uuid) VALUES \
    ('8047edbb-a10a-4ff8-8d53-c2cae600a8e8', '0cfac84e-6e35-422d-90ed-fbe01a9a3a1d') \
    ",
    )

    // Plus User Permissions
    await queryRunner.query(
      "INSERT INTO `role_permissions` (role_uuid, permission_uuid) VALUES \
      ('dee6e144-724b-4450-86d1-cc784770b2e2', '0cfac84e-6e35-422d-90ed-fbe01a9a3a1d') \
    ",
    )

    await queryRunner.query(
      "INSERT INTO `permissions` (uuid, name) VALUES ('3aeaf12e-380f-4f21-97b9-d862d63874f6', 'server:subscription-sharing')",
    )

    // Pro User Permissions
    await queryRunner.query(
      "INSERT INTO `role_permissions` (role_uuid, permission_uuid) VALUES \
    ('8047edbb-a10a-4ff8-8d53-c2cae600a8e8', '3aeaf12e-380f-4f21-97b9-d862d63874f6') \
    ",
    )

    await queryRunner.query(
      "INSERT INTO `permissions` (uuid, name) VALUES ('717ae814-a7f3-433c-a302-ea8736df3546', 'editor:super-editor')",
    )

    // Pro User Permissions
    await queryRunner.query(
      "INSERT INTO `role_permissions` (role_uuid, permission_uuid) VALUES ('8047edbb-a10a-4ff8-8d53-c2cae600a8e8', '717ae814-a7f3-433c-a302-ea8736df3546')",
    )

    // Plus User Permissions
    await queryRunner.query(
      "INSERT INTO `role_permissions` (role_uuid, permission_uuid) VALUES ('dee6e144-724b-4450-86d1-cc784770b2e2', '717ae814-a7f3-433c-a302-ea8736df3546')",
    )

    await queryRunner.query(
      "DELETE FROM `role_permissions` WHERE role_uuid='23bf88ca-bee1-4a4c-adf0-b7a48749eea7' AND permission_uuid='2074d312-78bc-4533-b008-38e1232226c0'",
    )
    await queryRunner.query(
      "DELETE FROM `role_permissions` WHERE role_uuid='bde42e26-628c-44e6-9d76-21b08954b0bf' AND permission_uuid='2074d312-78bc-4533-b008-38e1232226c0'",
    )

    // remove beta files user role and permission
    await queryRunner.query("DELETE FROM `role_permissions` WHERE role_uuid='1cd9ee6e-bc95-4f32-957c-d8c41f94d4ef'")
    await queryRunner.query("DELETE FROM `user_roles` WHERE role_uuid='1cd9ee6e-bc95-4f32-957c-d8c41f94d4ef'")
    await queryRunner.query("DELETE FROM `roles` WHERE name='FILES_BETA_USER'")
    await queryRunner.query("DELETE FROM `permissions` WHERE name='app:files-beta'")

    // add internal team user role and permission
    await queryRunner.query(
      "INSERT INTO `roles` (uuid, name, version) VALUES ('9f8d2313-e8d0-48ad-b19c-026601d0ddf4', 'INTERNAL_TEAM_USER', 1)",
    )
    await queryRunner.query(
      "INSERT INTO `permissions` (uuid, name) VALUES ('fb13e7d3-936f-4ded-a543-e1650cc99dfd', 'server:universal-second-factor')",
    )
    await queryRunner.query(
      "INSERT INTO `role_permissions` (role_uuid, permission_uuid) VALUES ('9f8d2313-e8d0-48ad-b19c-026601d0ddf4', 'fb13e7d3-936f-4ded-a543-e1650cc99dfd')",
    )

    // add u2f permission for pro users
    await queryRunner.query(
      "INSERT INTO `role_permissions` (role_uuid, permission_uuid) VALUES ('8047edbb-a10a-4ff8-8d53-c2cae600a8e8', 'fb13e7d3-936f-4ded-a543-e1650cc99dfd')",
    )
  }

  public async down(): Promise<void> {
    return
  }
}
