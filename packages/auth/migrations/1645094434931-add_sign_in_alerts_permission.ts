import { MigrationInterface, QueryRunner } from 'typeorm'

export class addSignInAlertsPermission1645094434931 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      'INSERT INTO `permissions` (uuid, name) VALUES ("2074d312-78bc-4533-b008-38e1232226c0", "server:sign-in-alerts")',
    )

    // Pro User Permissions
    await queryRunner.query(
      'INSERT INTO `role_permissions` (role_uuid, permission_uuid) VALUES \
    ("8047edbb-a10a-4ff8-8d53-c2cae600a8e8", "2074d312-78bc-4533-b008-38e1232226c0") \
    ',
    )

    // Plus User Permissions
    await queryRunner.query(
      'INSERT INTO `role_permissions` (role_uuid, permission_uuid) VALUES \
      ("dee6e144-724b-4450-86d1-cc784770b2e2", "2074d312-78bc-4533-b008-38e1232226c0") \
    ',
    )

    // Core User Permissions
    await queryRunner.query(
      'INSERT INTO `role_permissions` (role_uuid, permission_uuid) VALUES \
      ("bde42e26-628c-44e6-9d76-21b08954b0bf", "2074d312-78bc-4533-b008-38e1232226c0") \
    ',
    )
  }

  public async down(): Promise<void> {
    return
  }
}
