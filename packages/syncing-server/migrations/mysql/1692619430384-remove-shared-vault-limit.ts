import { MigrationInterface, QueryRunner } from 'typeorm'

export class RemoveSharedVaultLimit1692619430384 implements MigrationInterface {
  name = 'RemoveSharedVaultLimit1692619430384'

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('ALTER TABLE `shared_vaults` DROP COLUMN `file_upload_bytes_limit`')
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('ALTER TABLE `shared_vaults` ADD `file_upload_bytes_limit` int NOT NULL')
  }
}
