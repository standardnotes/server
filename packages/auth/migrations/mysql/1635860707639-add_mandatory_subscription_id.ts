import { MigrationInterface, QueryRunner } from 'typeorm'

export class addMandatorySubscriptionId1635860707639 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      'ALTER TABLE `offline_user_subscriptions` CHANGE `subscription_id` `subscription_id` int(11) NOT NULL',
    )
    await queryRunner.query(
      'ALTER TABLE `user_subscriptions` CHANGE `subscription_id` `subscription_id` int(11) NOT NULL',
    )
  }

  public async down(): Promise<void> {
    return
  }
}
