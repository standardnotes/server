import { MigrationInterface, QueryRunner } from 'typeorm'

export class removeAuthenticatorNamesFromServer1678340701766 implements MigrationInterface {
  name = 'removeAuthenticatorNamesFromServer1678340701766'

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('ALTER TABLE `authenticators` DROP COLUMN `name`')
  }

  public async down(): Promise<void> {
    return
  }
}
