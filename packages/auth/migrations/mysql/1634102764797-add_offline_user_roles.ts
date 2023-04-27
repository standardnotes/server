import { MigrationInterface, QueryRunner } from 'typeorm'

export class addOfflineUserRoles1634102764797 implements MigrationInterface {
  name = 'addOfflineUserRoles1634102764797'

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      'CREATE TABLE `offline_user_roles` (`role_uuid` varchar(36) NOT NULL, `offline_user_subscription_uuid` varchar(36) NOT NULL, INDEX `IDX_027ba99043e6902f569d66417f` (`role_uuid`), INDEX `IDX_cd1b91693f6ee92d5f94ce2775` (`offline_user_subscription_uuid`), PRIMARY KEY (`role_uuid`, `offline_user_subscription_uuid`)) ENGINE=InnoDB',
    )
    await queryRunner.query(
      'ALTER TABLE `offline_user_roles` ADD CONSTRAINT `FK_027ba99043e6902f569d66417f0` FOREIGN KEY (`role_uuid`) REFERENCES `roles`(`uuid`) ON DELETE CASCADE ON UPDATE NO ACTION',
    )
    await queryRunner.query(
      'ALTER TABLE `offline_user_roles` ADD CONSTRAINT `FK_cd1b91693f6ee92d5f94ce27758` FOREIGN KEY (`offline_user_subscription_uuid`) REFERENCES `offline_user_subscriptions`(`uuid`) ON DELETE CASCADE ON UPDATE NO ACTION',
    )
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('ALTER TABLE `offline_user_roles` DROP FOREIGN KEY `FK_cd1b91693f6ee92d5f94ce27758`')
    await queryRunner.query('ALTER TABLE `offline_user_roles` DROP FOREIGN KEY `FK_027ba99043e6902f569d66417f0`')
    await queryRunner.query('DROP INDEX `IDX_cd1b91693f6ee92d5f94ce2775` ON `offline_user_roles`')
    await queryRunner.query('DROP INDEX `IDX_027ba99043e6902f569d66417f` ON `offline_user_roles`')
    await queryRunner.query('DROP TABLE `offline_user_roles`')
  }
}
