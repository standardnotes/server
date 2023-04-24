import { MigrationInterface, QueryRunner } from 'typeorm'

export class removeSpreadsheetsFromPlusPlan1635167238332 implements MigrationInterface {
  name = 'removeSpreadsheetsFromPlusPlan1635167238332'

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      'DELETE FROM `role_permissions` WHERE role_uuid="dee6e144-724b-4450-86d1-cc784770b2e2" AND permission_uuid="2ce06684-1f3d-45ee-87c1-df7b4447801b"',
    )
  }

  public async down(): Promise<void> {
    return
  }
}
