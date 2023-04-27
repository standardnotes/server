import { MigrationInterface, QueryRunner } from 'typeorm'

export class addSubscriptionTypes1648550676786 implements MigrationInterface {
  name = 'addSubscriptionTypes1648550676786'

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('ALTER TABLE `user_subscriptions` ADD `subscription_type` varchar(24) NULL')
    await queryRunner.query('UPDATE user_subscriptions SET subscription_type = "regular"')
    await queryRunner.query(
      'ALTER TABLE `user_subscriptions` CHANGE `subscription_type` `subscription_type` varchar(24) NOT NULL',
    )
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('ALTER TABLE `user_subscriptions` DROP COLUMN `subscription_type`')
  }
}
