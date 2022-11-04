import { MigrationInterface, QueryRunner } from 'typeorm'

export class addEmailToAnalyticsEntity1667568051894 implements MigrationInterface {
  name = 'addEmailToAnalyticsEntity1667568051894'

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('ALTER TABLE `analytics_entities` ADD `user_email` varchar(255) NULL')
    await queryRunner.query('CREATE INDEX `email` ON `analytics_entities` (`user_email`)')
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('DROP INDEX `email` ON `analytics_entities`')
    await queryRunner.query('ALTER TABLE `analytics_entities` DROP COLUMN `user_email`')
  }
}
