import { MigrationInterface, QueryRunner } from 'typeorm'

export class addUserSubscriptions1626689139110 implements MigrationInterface {
  name = 'addUserSubscriptions1626689139110'

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      'CREATE TABLE `user_subscriptions` (`uuid` varchar(36) NOT NULL, `plan_name` varchar(255) NOT NULL, `ends_at` bigint NOT NULL, `created_at` bigint NOT NULL, `updated_at` bigint NOT NULL, `user_uuid` varchar(36) NOT NULL, INDEX `updated_at` (`updated_at`), PRIMARY KEY (`uuid`)) ENGINE=InnoDB',
    )
    await queryRunner.query(
      'ALTER TABLE `user_subscriptions` ADD CONSTRAINT `FK_f44dae0a64c70e6b50de5442d2b` FOREIGN KEY (`user_uuid`) REFERENCES `users`(`uuid`) ON DELETE NO ACTION ON UPDATE NO ACTION',
    )
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('ALTER TABLE `user_subscriptions` DROP FOREIGN KEY `FK_f44dae0a64c70e6b50de5442d2b`')
    await queryRunner.query('DROP TABLE `user_subscriptions`')
  }
}
