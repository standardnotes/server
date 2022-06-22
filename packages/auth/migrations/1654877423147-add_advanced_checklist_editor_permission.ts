import { MigrationInterface, QueryRunner } from 'typeorm'

export class addAdvancedChecklistEditorPermission1654877423147 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      'INSERT INTO `permissions` (uuid, name) VALUES ("0cfac84e-6e35-422d-90ed-fbe01a9a3a1d", "editor:advanced-checklist")',
    )

    // Pro User Permissions
    await queryRunner.query(
      'INSERT INTO `role_permissions` (role_uuid, permission_uuid) VALUES \
    ("8047edbb-a10a-4ff8-8d53-c2cae600a8e8", "0cfac84e-6e35-422d-90ed-fbe01a9a3a1d") \
    ',
    )

    // Plus User Permissions
    await queryRunner.query(
      'INSERT INTO `role_permissions` (role_uuid, permission_uuid) VALUES \
      ("dee6e144-724b-4450-86d1-cc784770b2e2", "0cfac84e-6e35-422d-90ed-fbe01a9a3a1d") \
    ',
    )
  }

  public async down(): Promise<void> {
    return
  }
}
