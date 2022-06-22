import { MigrationInterface, QueryRunner } from 'typeorm'

export class addSmartTags1640701224273 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      'INSERT INTO `permissions` (uuid, name) VALUES ("777d5c74-6201-4253-a56a-26d503e2abbd", "app:smart-filters")',
    )

    // Core user v1 keep access
    await queryRunner.query(
      'INSERT INTO `role_permissions` (role_uuid, permission_uuid) VALUES ("bde42e26-628c-44e6-9d76-21b08954b0bf", "777d5c74-6201-4253-a56a-26d503e2abbd")',
    )

    // Pro User Permissions
    await queryRunner.query(
      'INSERT INTO `role_permissions` (role_uuid, permission_uuid) VALUES ("8047edbb-a10a-4ff8-8d53-c2cae600a8e8", "777d5c74-6201-4253-a56a-26d503e2abbd")',
    )

    // Plus User Permissions
    await queryRunner.query(
      'INSERT INTO `role_permissions` (role_uuid, permission_uuid) VALUES ("dee6e144-724b-4450-86d1-cc784770b2e2", "777d5c74-6201-4253-a56a-26d503e2abbd")',
    )
  }

  public async down(): Promise<void> {
    return
  }
}
