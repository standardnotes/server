import { MigrationInterface, QueryRunner } from 'typeorm'

export class addRolesAndPermissionsData1612255683992 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('INSERT INTO `roles` (uuid, name) VALUES ("8802d6a3-b97c-4b25-968a-8fb21c65c3a1", "USER")')
    await queryRunner.query(
      'INSERT INTO `permissions` (uuid, name) VALUES ("ad1afda0-732e-407c-8162-0950b623e322", "SYNC_ITEMS")',
    )
    await queryRunner.query(
      'INSERT INTO `role_permissions` (role_uuid, permission_uuid) VALUES ("8802d6a3-b97c-4b25-968a-8fb21c65c3a1", "ad1afda0-732e-407c-8162-0950b623e322")',
    )
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('DELETE FROM `role_permissions` WHERE role_uuid="8802d6a3-b97c-4b25-968a-8fb21c65c3a1"')
    await queryRunner.query('DELETE FROM `roles` WHERE name="USER"')
    await queryRunner.query('DELETE FROM `permissions` WHERE name="SYNC_ITEMS"')
  }
}
