import { MigrationInterface, QueryRunner } from 'typeorm'

export class removeSignInEmailsOnFreeAcounts1678110075698 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      'DELETE FROM `role_permissions` WHERE role_uuid="23bf88ca-bee1-4a4c-adf0-b7a48749eea7" AND permission_uuid="2074d312-78bc-4533-b008-38e1232226c0"',
    )
    await queryRunner.query(
      'DELETE FROM `role_permissions` WHERE role_uuid="bde42e26-628c-44e6-9d76-21b08954b0bf" AND permission_uuid="2074d312-78bc-4533-b008-38e1232226c0"',
    )
  }

  public async down(): Promise<void> {
    return
  }
}
