import { MigrationInterface, QueryRunner } from 'typeorm'

export class addSubscriptionId1635172524403 implements MigrationInterface {
  name = 'addSubscriptionId1635172524403'

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('ALTER TABLE `offline_user_subscriptions` ADD `subscription_id` int(11) NULL')
    await queryRunner.query('ALTER TABLE `user_subscriptions` ADD `subscription_id` int(11) NULL')
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('ALTER TABLE `user_subscriptions` DROP COLUMN `subscription_id`')
    await queryRunner.query('ALTER TABLE `offline_user_subscriptions` DROP COLUMN `subscription_id`')
  }
}
