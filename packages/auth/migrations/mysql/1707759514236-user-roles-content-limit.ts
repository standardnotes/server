import { MigrationInterface, QueryRunner } from 'typeorm'

export class UserRolesContentLimit1707759514236 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      'INSERT INTO `permissions` (uuid, name) VALUES ("f8b4ced2-6a59-49f8-9ade-416a5f5ffc61", "server:content-limit")',
    )
    await queryRunner.query(
      'INSERT INTO `roles` (uuid, name, version) VALUES ("ab2e15c9-9252-43f3-829c-6f0af3315791", "CORE_USER", 4)',
    )
    await queryRunner.query(
      'INSERT INTO `role_permissions` (permission_uuid, role_uuid) VALUES \
          ("b04a7670-934e-4ab1-b8a3-0f27ff159511", "ab2e15c9-9252-43f3-829c-6f0af3315791"), \
          ("eb0575a2-6e26-49e3-9501-f2e75d7dbda3", "ab2e15c9-9252-43f3-829c-6f0af3315791"), \
          ("f8b4ced2-6a59-49f8-9ade-416a5f5ffc61", "ab2e15c9-9252-43f3-829c-6f0af3315791") \
          ',
    )
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('DELETE FROM `role_permissions` WHERE role_uuid="ab2e15c9-9252-43f3-829c-6f0af3315791"')
    await queryRunner.query('DELETE FROM `permissions` WHERE uuid="f8b4ced2-6a59-49f8-9ade-416a5f5ffc61"')
    await queryRunner.query('DELETE FROM `roles` WHERE uuid="ab2e15c9-9252-43f3-829c-6f0af3315791"')
  }
}
