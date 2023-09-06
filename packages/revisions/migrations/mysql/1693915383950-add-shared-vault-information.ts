import { MigrationInterface, QueryRunner } from 'typeorm'

export class AddSharedVaultInformation1693915383950 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('ALTER TABLE `revisions` ADD `edited_by` varchar(36) NULL')
    await queryRunner.query('ALTER TABLE `revisions` ADD `shared_vault_uuid` varchar(36) NULL')
    await queryRunner.query('ALTER TABLE `revisions` ADD `key_system_identifier` varchar(36) NULL')
    await queryRunner.query('CREATE INDEX `index_revisions_on_shared_vault_uuid` ON `revisions` (`shared_vault_uuid`)')
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('DROP INDEX `index_revisions_on_shared_vault_uuid` ON `revisions`')
    await queryRunner.query('ALTER TABLE `revisions` DROP COLUMN `key_system_identifier`')
    await queryRunner.query('ALTER TABLE `revisions` DROP COLUMN `shared_vault_uuid`')
    await queryRunner.query('ALTER TABLE `revisions` DROP COLUMN `last_edited_by`')
  }
}
