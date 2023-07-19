import { MigrationInterface, QueryRunner } from 'typeorm'

export class AddNotifications1689671563304 implements MigrationInterface {
  name = 'AddNotifications1689671563304'

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      'CREATE TABLE `notifications` (`uuid` varchar(36) NOT NULL, `user_uuid` varchar(36) NOT NULL, `type` varchar(36) NOT NULL, `payload` text NOT NULL, `created_at_timestamp` bigint NOT NULL, `updated_at_timestamp` bigint NOT NULL, INDEX `index_notifications_on_user_uuid` (`user_uuid`), PRIMARY KEY (`uuid`)) ENGINE=InnoDB',
    )
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('DROP INDEX `index_notifications_on_user_uuid` ON `notifications`')
    await queryRunner.query('DROP TABLE `notifications`')
  }
}
