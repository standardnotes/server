import { MigrationInterface, QueryRunner } from 'typeorm'

export class addTagNestingPermission1648112718114 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Core User V2 Permissions
    // add missing server:sign-in-alerts
    await queryRunner.query(
      'INSERT INTO `role_permissions` (role_uuid, permission_uuid) VALUES \
      ("23bf88ca-bee1-4a4c-adf0-b7a48749eea7", "2074d312-78bc-4533-b008-38e1232226c0") \
    ',
    )

    // Core User V1 Permissions
    // add app:tag-nesting
    await queryRunner.query(
      'INSERT INTO `role_permissions` (role_uuid, permission_uuid) VALUES \
      ("bde42e26-628c-44e6-9d76-21b08954b0bf", "3f7044d6-c74d-48c2-8b5d-ef69e8b3d922") \
    ',
    )
  }

  public async down(): Promise<void> {
    return
  }
}
