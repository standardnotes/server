import { MigrationInterface, QueryRunner } from 'typeorm'

export class addSuperEditor1673951291148 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      'INSERT INTO `permissions` (uuid, name) VALUES ("717ae814-a7f3-433c-a302-ea8736df3546", "editor:super-editor")',
    )

    // Pro User Permissions
    await queryRunner.query(
      'INSERT INTO `role_permissions` (role_uuid, permission_uuid) VALUES ("8047edbb-a10a-4ff8-8d53-c2cae600a8e8", "717ae814-a7f3-433c-a302-ea8736df3546")',
    )

    // Plus User Permissions
    await queryRunner.query(
      'INSERT INTO `role_permissions` (role_uuid, permission_uuid) VALUES ("dee6e144-724b-4450-86d1-cc784770b2e2", "717ae814-a7f3-433c-a302-ea8736df3546")',
    )
  }

  public async down(): Promise<void> {
    return
  }
}
