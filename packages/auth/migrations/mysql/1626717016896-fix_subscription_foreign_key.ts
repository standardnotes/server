import { MigrationInterface, QueryRunner } from 'typeorm'

export class fixSubscriptionForeignKey1626717016896 implements MigrationInterface {
  name = 'fixSubscriptionForeignKey1626717016896'

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('ALTER TABLE `user_subscriptions` DROP FOREIGN KEY `FK_f44dae0a64c70e6b50de5442d2b`')
    await queryRunner.query(
      'ALTER TABLE `user_subscriptions` ADD CONSTRAINT `FK_f44dae0a64c70e6b50de5442d2b` FOREIGN KEY (`user_uuid`) REFERENCES `users`(`uuid`) ON DELETE CASCADE ON UPDATE NO ACTION',
    )
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('ALTER TABLE `user_subscriptions` DROP FOREIGN KEY `FK_f44dae0a64c70e6b50de5442d2b`')
    await queryRunner.query(
      'ALTER TABLE `user_subscriptions` ADD CONSTRAINT `FK_f44dae0a64c70e6b50de5442d2b` FOREIGN KEY (`user_uuid`) REFERENCES `users`(`uuid`) ON DELETE NO ACTION ON UPDATE NO ACTION',
    )
  }
}
