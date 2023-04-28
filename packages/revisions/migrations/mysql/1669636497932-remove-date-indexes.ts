import { MigrationInterface, QueryRunner } from 'typeorm'

export class removeDateIndexes1669636497932 implements MigrationInterface {
  name = 'removeDateIndexes1669636497932'

  public async up(queryRunner: QueryRunner): Promise<void> {
    const indexRevisionsOnCreatedAt = await queryRunner.manager.query(
      'SHOW INDEX FROM `revisions` where `key_name` = "created_at"',
    )
    const indexRevisionsOnCreatedAtExist = indexRevisionsOnCreatedAt && indexRevisionsOnCreatedAt.length > 0
    if (indexRevisionsOnCreatedAtExist) {
      await queryRunner.query('DROP INDEX `created_at` ON `revisions`')
    }

    const indexRevisionsOnCreationDate = await queryRunner.manager.query(
      'SHOW INDEX FROM `revisions` where `key_name` = "creation_date"',
    )
    const indexRevisionsOnCreationDateAtExist = indexRevisionsOnCreationDate && indexRevisionsOnCreationDate.length > 0
    if (indexRevisionsOnCreationDateAtExist) {
      await queryRunner.query('DROP INDEX `creation_date` ON `revisions`')
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('CREATE INDEX `creation_date` ON `revisions` (`creation_date`)')
    await queryRunner.query('CREATE INDEX `created_at` ON `revisions` (`created_at`)')
  }
}
