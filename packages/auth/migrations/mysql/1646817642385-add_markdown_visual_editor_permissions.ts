import { MigrationInterface, QueryRunner } from 'typeorm'

export class addMarkdownVisualEditorPermissions1646817642385 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      'INSERT INTO `permissions` (uuid, name) VALUES ("8bb2f775-484d-4fe1-9617-cc5cd22461d9", "editor:markdown-visual")',
    )

    // Pro User Permissions
    await queryRunner.query(
      'INSERT INTO `role_permissions` (role_uuid, permission_uuid) VALUES \
    ("8047edbb-a10a-4ff8-8d53-c2cae600a8e8", "8bb2f775-484d-4fe1-9617-cc5cd22461d9") \
    ',
    )

    // Plus User Permissions
    await queryRunner.query(
      'INSERT INTO `role_permissions` (role_uuid, permission_uuid) VALUES \
      ("dee6e144-724b-4450-86d1-cc784770b2e2", "8bb2f775-484d-4fe1-9617-cc5cd22461d9") \
    ',
    )
  }

  public async down(): Promise<void> {
    return
  }
}
