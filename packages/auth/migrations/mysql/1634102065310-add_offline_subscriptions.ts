import { MigrationInterface, QueryRunner } from 'typeorm'

export class addOfflineSubscriptions1634102065310 implements MigrationInterface {
  name = 'addOfflineSubscriptions1634102065310'

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      'CREATE TABLE `offline_user_subscriptions` (`uuid` varchar(36) NOT NULL, `email` varchar(255) NOT NULL, `plan_name` varchar(255) NOT NULL, `ends_at` bigint NOT NULL, `created_at` bigint NOT NULL, `updated_at` bigint NOT NULL, `cancelled` tinyint(1) NOT NULL DEFAULT 0, INDEX `email` (`email`), PRIMARY KEY (`uuid`)) ENGINE=InnoDB',
    )
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('DROP INDEX `email` ON `offline_user_subscriptions`')
    await queryRunner.query('DROP TABLE `offline_user_subscriptions`')
  }
}
