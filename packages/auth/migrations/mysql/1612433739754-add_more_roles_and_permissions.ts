import { MigrationInterface, QueryRunner } from 'typeorm'

export class addMoreRolesAndPermissions1612433739754 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      'INSERT INTO `roles` (uuid, name) VALUES ("dee6e144-724b-4450-86d1-cc784770b2e2", "PLUS_USER")',
    )
    await queryRunner.query(
      'INSERT INTO `roles` (uuid, name) VALUES ("8047edbb-a10a-4ff8-8d53-c2cae600a8e8", "PRO_USER")',
    )

    await queryRunner.query(
      'INSERT INTO `permissions` (uuid, name) VALUES ("e4264cff-28e9-4a3d-b903-873dcb88ad2f", "EXTENDED_NOTE_HISTORY")',
    )
    await queryRunner.query(
      'INSERT INTO `permissions` (uuid, name) VALUES ("0107a26a-6154-4333-a383-d45eb688f1a4", "UNLIMITED_NOTE_HISTORY")',
    )

    await queryRunner.query(
      'INSERT INTO `role_permissions` (role_uuid, permission_uuid) VALUES ("dee6e144-724b-4450-86d1-cc784770b2e2", "ad1afda0-732e-407c-8162-0950b623e322")',
    )
    await queryRunner.query(
      'INSERT INTO `role_permissions` (role_uuid, permission_uuid) VALUES ("dee6e144-724b-4450-86d1-cc784770b2e2", "e4264cff-28e9-4a3d-b903-873dcb88ad2f")',
    )

    await queryRunner.query(
      'INSERT INTO `role_permissions` (role_uuid, permission_uuid) VALUES ("8047edbb-a10a-4ff8-8d53-c2cae600a8e8", "ad1afda0-732e-407c-8162-0950b623e322")',
    )
    await queryRunner.query(
      'INSERT INTO `role_permissions` (role_uuid, permission_uuid) VALUES ("8047edbb-a10a-4ff8-8d53-c2cae600a8e8", "0107a26a-6154-4333-a383-d45eb688f1a4")',
    )
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('DELETE FROM `role_permissions` WHERE role_uuid="dee6e144-724b-4450-86d1-cc784770b2e2"')
    await queryRunner.query('DELETE FROM `role_permissions` WHERE role_uuid="8047edbb-a10a-4ff8-8d53-c2cae600a8e8"')
    await queryRunner.query('DELETE FROM `roles` WHERE name="PLUS_USER"')
    await queryRunner.query('DELETE FROM `roles` WHERE name="PRO_USER"')
    await queryRunner.query('DELETE FROM `permissions` WHERE name="EXTENDED_NOTE_HISTORY"')
    await queryRunner.query('DELETE FROM `permissions` WHERE name="UNLIMITED_NOTE_HISTORY"')
  }
}
