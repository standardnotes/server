import { MigrationInterface, QueryRunner } from 'typeorm'

export class addMissingPermissions1635344737460 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      'INSERT INTO `permissions` (uuid, name) VALUES ("8f3d28cd-f17d-423b-8e4d-20143246ccf7", "component:filesafe")',
    )
    await queryRunner.query(
      'INSERT INTO `permissions` (uuid, name) VALUES ("14283420-6d22-43e6-a63b-26e755604dc6", "component:folders")',
    )
    await queryRunner.query(
      'INSERT INTO `permissions` (uuid, name) VALUES ("3d362e65-1874-4bcd-ba37-1918aa71f5f6", "theme:no-distraction")',
    )
    await queryRunner.query(
      'INSERT INTO `permissions` (uuid, name) VALUES ("53812c9b-9c3d-4c3f-927b-5e1479e1e3a0", "theme:dynamic")',
    )

    // Pro User Permissions
    await queryRunner.query(
      'INSERT INTO `role_permissions` (role_uuid, permission_uuid) VALUES \
    ("8047edbb-a10a-4ff8-8d53-c2cae600a8e8", "8f3d28cd-f17d-423b-8e4d-20143246ccf7"), \
    ("8047edbb-a10a-4ff8-8d53-c2cae600a8e8", "14283420-6d22-43e6-a63b-26e755604dc6"), \
    ("8047edbb-a10a-4ff8-8d53-c2cae600a8e8", "3d362e65-1874-4bcd-ba37-1918aa71f5f6"), \
    ("8047edbb-a10a-4ff8-8d53-c2cae600a8e8", "53812c9b-9c3d-4c3f-927b-5e1479e1e3a0") \
    ',
    )

    // Plus User Permissions
    await queryRunner.query(
      'INSERT INTO `role_permissions` (role_uuid, permission_uuid) VALUES \
      ("dee6e144-724b-4450-86d1-cc784770b2e2", "8f3d28cd-f17d-423b-8e4d-20143246ccf7"), \
      ("dee6e144-724b-4450-86d1-cc784770b2e2", "14283420-6d22-43e6-a63b-26e755604dc6"), \
      ("dee6e144-724b-4450-86d1-cc784770b2e2", "3d362e65-1874-4bcd-ba37-1918aa71f5f6"), \
      ("dee6e144-724b-4450-86d1-cc784770b2e2", "53812c9b-9c3d-4c3f-927b-5e1479e1e3a0") \
    ',
    )

    // Core User Permissions
    await queryRunner.query(
      'INSERT INTO `role_permissions` (role_uuid, permission_uuid) VALUES \
      ("bde42e26-628c-44e6-9d76-21b08954b0bf", "14283420-6d22-43e6-a63b-26e755604dc6"), \
      ("bde42e26-628c-44e6-9d76-21b08954b0bf", "3d362e65-1874-4bcd-ba37-1918aa71f5f6"), \
      ("bde42e26-628c-44e6-9d76-21b08954b0bf", "53812c9b-9c3d-4c3f-927b-5e1479e1e3a0") \
    ',
    )
  }

  public async down(): Promise<void> {
    return
  }
}
