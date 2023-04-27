import { MigrationInterface, QueryRunner } from 'typeorm'

export class addBetaFilesUserRole1648629732139 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      'INSERT INTO `roles` (uuid, name, version) VALUES ("1cd9ee6e-bc95-4f32-957c-d8c41f94d4ef", "FILES_BETA_USER", 1)',
    )
    await queryRunner.query(
      'INSERT INTO `permissions` (uuid, name) VALUES ("155e6901-4c35-422b-8643-c99cdcbcf54d", "app:files-beta")',
    )
    await queryRunner.query(
      'INSERT INTO `role_permissions` (role_uuid, permission_uuid) VALUES ("1cd9ee6e-bc95-4f32-957c-d8c41f94d4ef", "155e6901-4c35-422b-8643-c99cdcbcf54d")',
    )
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('DELETE FROM `role_permissions` WHERE role_uuid="1cd9ee6e-bc95-4f32-957c-d8c41f94d4ef"')
    await queryRunner.query('DELETE FROM `roles` WHERE name="FILES_BETA_USER"')
    await queryRunner.query('DELETE FROM `permissions` WHERE name="app:files-beta"')
  }
}
