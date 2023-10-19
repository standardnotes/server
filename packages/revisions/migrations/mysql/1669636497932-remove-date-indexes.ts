import { MigrationInterface, QueryRunner } from 'typeorm'

export class removeDateIndexes1669636497932 implements MigrationInterface {
  name = 'removeDateIndexes1669636497932'

  public async up(queryRunner: QueryRunner): Promise<void> {
    await this.renameRevisionsTable(queryRunner)

    const indexRevisionsOnCreatedAt = await queryRunner.manager.query(
      'SHOW INDEX FROM `revisions_revisions` where `key_name` = "created_at"',
    )
    const indexRevisionsOnCreatedAtExist = indexRevisionsOnCreatedAt && indexRevisionsOnCreatedAt.length > 0
    if (indexRevisionsOnCreatedAtExist) {
      await queryRunner.query('DROP INDEX `created_at` ON `revisions_revisions`')
    }

    const indexRevisionsOnCreationDate = await queryRunner.manager.query(
      'SHOW INDEX FROM `revisions_revisions` where `key_name` = "creation_date"',
    )
    const indexRevisionsOnCreationDateAtExist = indexRevisionsOnCreationDate && indexRevisionsOnCreationDate.length > 0
    if (indexRevisionsOnCreationDateAtExist) {
      await queryRunner.query('DROP INDEX `creation_date` ON `revisions_revisions`')
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('CREATE INDEX `creation_date` ON `revisions_revisions` (`creation_date`)')
    await queryRunner.query('CREATE INDEX `created_at` ON `revisions_revisions` (`created_at`)')
  }

  private async renameRevisionsTable(queryRunner: QueryRunner) {
    const revisionsTableExistsQueryResult = await queryRunner.manager.query(
      'SELECT COUNT(*) as count FROM information_schema.tables WHERE table_schema = DATABASE() AND table_name = "revisions"',
    )
    const revisionsTableExists = revisionsTableExistsQueryResult[0].count === 1
    if (revisionsTableExists) {
      await queryRunner.query('ALTER TABLE `revisions` RENAME TO `revisions_revisions`, ALGORITHM=INSTANT')
    }
  }
}
