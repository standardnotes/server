import { MigrationInterface, QueryRunner } from 'typeorm'

export class EnableEmailBackupsForAll1705493201352 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Core User v1 Permissions
    await queryRunner.query(
      'INSERT INTO `role_permissions` (role_uuid, permission_uuid) VALUES \
          ("bde42e26-628c-44e6-9d76-21b08954b0bf", "eb0575a2-6e26-49e3-9501-f2e75d7dbda3") \
        ',
    )
    // Core User v2 Permissions
    await queryRunner.query(
      'INSERT INTO `role_permissions` (role_uuid, permission_uuid) VALUES \
          ("23bf88ca-bee1-4a4c-adf0-b7a48749eea7", "eb0575a2-6e26-49e3-9501-f2e75d7dbda3") \
        ',
    )
  }

  public async down(): Promise<void> {
    return
  }
}
