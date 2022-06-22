import { MigrationInterface, QueryRunner } from 'typeorm'

export class addOfflineSettings1634064348750 implements MigrationInterface {
  name = 'addOfflineSettings1634064348750'

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      'CREATE TABLE `offline_settings` (`uuid` varchar(36) NOT NULL, `email` varchar(255) NOT NULL, `name` varchar(255) NOT NULL, `value` text NULL, `server_encryption_version` tinyint NOT NULL DEFAULT 0, `created_at` bigint NOT NULL, `updated_at` bigint NOT NULL, INDEX `index_offline_settings_on_name_and_email` (`name`, `email`), PRIMARY KEY (`uuid`)) ENGINE=InnoDB',
    )
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('DROP INDEX `index_offline_settings_on_name_and_email` ON `offline_settings`')
    await queryRunner.query('DROP TABLE `offline_settings`')
  }
}
