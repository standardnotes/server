import { MigrationInterface, QueryRunner } from 'typeorm'

export class addMissingPlusPermissions1652258146238 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Plus User Permissions
    await queryRunner.query(
      'INSERT INTO `role_permissions` (role_uuid, permission_uuid) VALUES \
      ("dee6e144-724b-4450-86d1-cc784770b2e2", "2ce06684-1f3d-45ee-87c1-df7b4447801b"), \
      ("dee6e144-724b-4450-86d1-cc784770b2e2", "897551c3-8ba8-48f0-8fb9-5c861b104fcf"), \
      ("dee6e144-724b-4450-86d1-cc784770b2e2", "2fdfe72e-2ec9-4600-97e5-5f19eaba8b6a") \
    ',
    )
  }

  public async down(): Promise<void> {
    return
  }
}
