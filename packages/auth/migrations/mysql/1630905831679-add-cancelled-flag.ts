import { MigrationInterface, QueryRunner } from 'typeorm'

export class addCancelledFlag1630905831679 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('ALTER TABLE `user_subscriptions` ADD `cancelled` tinyint NOT NULL DEFAULT 0')
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('ALTER TABLE `user_subscriptions` DROP COLUMN `cancelled`')
  }
}
