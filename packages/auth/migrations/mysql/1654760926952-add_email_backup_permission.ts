import { MigrationInterface, QueryRunner } from 'typeorm'

export class addEmailBackupPermission1654760926952 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Core User Permissions
    await queryRunner.query(
      'INSERT INTO `role_permissions` (role_uuid, permission_uuid) VALUES \
      ("8802d6a3-b97c-4b25-968a-8fb21c65c3a1", "eb0575a2-6e26-49e3-9501-f2e75d7dbda3") \
    ',
    )
  }

  public async down(): Promise<void> {
    return
  }
}
