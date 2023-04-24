import { MigrationInterface, QueryRunner } from 'typeorm'

export class addMarkdownMath1629703896382 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      'INSERT INTO `permissions` (uuid, name) VALUES ("5f53c349-3fe5-4e5f-a9c5-a7caae6eb90a", "editor:markdown-math")',
    )

    // Pro User Permissions
    await queryRunner.query(
      'INSERT INTO `role_permissions` (role_uuid, permission_uuid) VALUES ("8047edbb-a10a-4ff8-8d53-c2cae600a8e8", "5f53c349-3fe5-4e5f-a9c5-a7caae6eb90a")',
    )

    // Plus User Permissions
    await queryRunner.query(
      'INSERT INTO `role_permissions` (role_uuid, permission_uuid) VALUES ("dee6e144-724b-4450-86d1-cc784770b2e2", "5f53c349-3fe5-4e5f-a9c5-a7caae6eb90a")',
    )

    // Basic User Permissions
    await queryRunner.query(
      'INSERT INTO `role_permissions` (role_uuid, permission_uuid) VALUES ("bde42e26-628c-44e6-9d76-21b08954b0bf", "5f53c349-3fe5-4e5f-a9c5-a7caae6eb90a")',
    )
  }

  public async down(): Promise<void> {
    return
  }
}
