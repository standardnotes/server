import { MigrationInterface, QueryRunner } from 'typeorm'

export class addRoleVersion1639998097029 implements MigrationInterface {
  name = 'addRoleVersion1639998097029'

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('DROP INDEX `index_roles_on_name` ON `roles`')
    await queryRunner.query('ALTER TABLE `roles` ADD `version` smallint NULL')
    await queryRunner.query('UPDATE `roles` SET `version` = 1')
    await queryRunner.query('ALTER TABLE `roles` CHANGE `version` `version` smallint NOT NULL')
    await queryRunner.query('CREATE UNIQUE INDEX `name_and_version` ON `roles` (`name`, `version`)')
    await queryRunner.query(
      'INSERT INTO `roles` (uuid, name, version) VALUES ("23bf88ca-bee1-4a4c-adf0-b7a48749eea7", "CORE_USER", 2)',
    )
    await queryRunner.query(
      'INSERT INTO `role_permissions` (permission_uuid, role_uuid) VALUES \
      ("1c6295d7-ffab-4881-bdf9-7c80df3885e9", "23bf88ca-bee1-4a4c-adf0-b7a48749eea7"), \
      ("1cd5d412-cb57-4cc0-a982-10045ef92780", "23bf88ca-bee1-4a4c-adf0-b7a48749eea7"), \
      ("39ebab56-00be-4495-8f59-ba25d5127f06", "23bf88ca-bee1-4a4c-adf0-b7a48749eea7"), \
      ("3d362e65-1874-4bcd-ba37-1918aa71f5f6", "23bf88ca-bee1-4a4c-adf0-b7a48749eea7"), \
      ("42e11c9b-e99b-43a5-bd32-77600c2e5ece", "23bf88ca-bee1-4a4c-adf0-b7a48749eea7"), \
      ("53812c9b-9c3d-4c3f-927b-5e1479e1e3a0", "23bf88ca-bee1-4a4c-adf0-b7a48749eea7"), \
      ("5f53c349-3fe5-4e5f-a9c5-a7caae6eb90a", "23bf88ca-bee1-4a4c-adf0-b7a48749eea7"), \
      ("6cbde260-5a00-46f5-907d-d9843fa87528", "23bf88ca-bee1-4a4c-adf0-b7a48749eea7"), \
      ("6ce3732f-f6bf-46e8-99be-6044903253b2", "23bf88ca-bee1-4a4c-adf0-b7a48749eea7"), \
      ("6e69b059-5324-4087-ba9d-c6c77ed2483c", "23bf88ca-bee1-4a4c-adf0-b7a48749eea7"), \
      ("90cde39c-f4ea-417a-ae25-15db8ef1d828", "23bf88ca-bee1-4a4c-adf0-b7a48749eea7"), \
      ("b04a7670-934e-4ab1-b8a3-0f27ff159511", "23bf88ca-bee1-4a4c-adf0-b7a48749eea7"), \
      ("b9d8488a-59aa-420a-8491-1f12b6484876", "23bf88ca-bee1-4a4c-adf0-b7a48749eea7"), \
      ("db84ebd6-5273-4af9-8d95-5603c6e3f75f", "23bf88ca-bee1-4a4c-adf0-b7a48749eea7"), \
      ("e1a3c091-3479-4d8d-b4df-66ec6c9f13c2", "23bf88ca-bee1-4a4c-adf0-b7a48749eea7") \
      ',
    )
  }

  public async down(): Promise<void> {
    return
  }
}
