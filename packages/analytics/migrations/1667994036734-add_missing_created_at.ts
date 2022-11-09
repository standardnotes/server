import { MigrationInterface, QueryRunner } from 'typeorm'

export class addMissingCreatedAt1667994036734 implements MigrationInterface {
  name = 'addMissingCreatedAt1667994036734'

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('ALTER TABLE `revenue_modifications` ADD `created_at` bigint NOT NULL')
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('ALTER TABLE `revenue_modifications` DROP COLUMN `created_at`')
  }
}
