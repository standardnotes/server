import { MigrationInterface, QueryRunner } from 'typeorm'

export class removeDateIndexes1669636497932 implements MigrationInterface {
  name = 'removeDateIndexes1669636497932'

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('DROP INDEX `created_at` ON `revisions`')
    await queryRunner.query('DROP INDEX `creation_date` ON `revisions`')
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('CREATE INDEX `creation_date` ON `revisions` (`creation_date`)')
    await queryRunner.query('CREATE INDEX `created_at` ON `revisions` (`created_at`)')
  }
}
