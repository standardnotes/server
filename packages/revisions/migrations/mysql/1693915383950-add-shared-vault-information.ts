import { MigrationInterface, QueryRunner } from 'typeorm'

export class AddSharedVaultInformation1693915383950 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await this.renameRevisionsTable(queryRunner)

    await queryRunner.query('ALTER TABLE `revisions_revisions` ADD `edited_by` varchar(36) NULL')
    await queryRunner.query('ALTER TABLE `revisions_revisions` ADD `shared_vault_uuid` varchar(36) NULL')
    await queryRunner.query('ALTER TABLE `revisions_revisions` ADD `key_system_identifier` varchar(36) NULL')
    await queryRunner.query(
      'CREATE INDEX `index_revisions_on_shared_vault_uuid` ON `revisions_revisions` (`shared_vault_uuid`)',
    )
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('DROP INDEX `index_revisions_on_shared_vault_uuid` ON `revisions_revisions`')
    await queryRunner.query('ALTER TABLE `revisions_revisions` DROP COLUMN `key_system_identifier`')
    await queryRunner.query('ALTER TABLE `revisions_revisions` DROP COLUMN `shared_vault_uuid`')
    await queryRunner.query('ALTER TABLE `revisions_revisions` DROP COLUMN `last_edited_by`')
  }

  private async renameRevisionsTable(queryRunner: QueryRunner) {
    const revisionsTableExistsQueryResult = await queryRunner.manager.query(
      'SELECT COUNT(*) as count FROM information_schema.tables WHERE table_schema = DATABASE() AND table_name = "revisions"',
    )
    const revisionsTableExists = revisionsTableExistsQueryResult[0].count === 1
    if (revisionsTableExists) {
      await queryRunner.query('RENAME TABLE `revisions` TO `revisions_revisions`')
    }
  }
}
