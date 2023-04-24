import { MigrationInterface, QueryRunner } from 'typeorm'

export class addSubscriptionSettings1649660400536 implements MigrationInterface {
  name = 'addSubscriptionSettings1649660400536'

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      'CREATE TABLE `subscription_settings` (`uuid` varchar(36) NOT NULL, `name` varchar(255) NOT NULL, `value` text NULL, `server_encryption_version` tinyint NOT NULL DEFAULT 0, `created_at` bigint NOT NULL, `updated_at` bigint NOT NULL, `sensitive` tinyint(1) NOT NULL DEFAULT 0, `user_subscription_uuid` varchar(36) NOT NULL, INDEX `index_subcsription_settings_on_updated_at` (`updated_at`), INDEX `index_settings_on_name_and_user_subscription_uuid` (`name`, `user_subscription_uuid`), PRIMARY KEY (`uuid`)) ENGINE=InnoDB',
    )
    await queryRunner.query(
      'ALTER TABLE `subscription_settings` ADD CONSTRAINT `FK_ad2907de2850d8b531ff23329f3` FOREIGN KEY (`user_subscription_uuid`) REFERENCES `user_subscriptions`(`uuid`) ON DELETE CASCADE ON UPDATE NO ACTION',
    )
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('ALTER TABLE `subscription_settings` DROP FOREIGN KEY `FK_ad2907de2850d8b531ff23329f3`')
    await queryRunner.query('DROP INDEX `index_settings_on_name_and_user_subscription_uuid` ON `subscription_settings`')
    await queryRunner.query('DROP INDEX `index_subcsription_settings_on_updated_at` ON `subscription_settings`')
    await queryRunner.query('DROP TABLE `subscription_settings`')
  }
}
