import { MigrationInterface, QueryRunner } from 'typeorm'

export class AddUserSettings1614678016791 implements MigrationInterface {
  name = 'AddUserSettings1614678016791'

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      'CREATE TABLE `settings` (`uuid` varchar(36) NOT NULL, `name` varchar(255) NOT NULL, `value` varchar(255) NOT NULL, `encrypted` tinyint(1) NOT NULL DEFAULT 0, `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP, `updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP, `user_uuid` varchar(36) NOT NULL, INDEX `index_settings_on_name_and_user_uuid` (`name`, `user_uuid`), PRIMARY KEY (`uuid`)) ENGINE=InnoDB',
    )
    await queryRunner.query(
      'ALTER TABLE `settings` ADD CONSTRAINT `FK_1cc1d030b83d6030795d3e7e63f` FOREIGN KEY (`user_uuid`) REFERENCES `users`(`uuid`) ON DELETE CASCADE ON UPDATE NO ACTION',
    )
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('ALTER TABLE `settings` DROP FOREIGN KEY `FK_1cc1d030b83d6030795d3e7e63f`')
    await queryRunner.query('DROP INDEX `index_settings_on_name_and_user_uuid` ON `settings`')
    await queryRunner.query('DROP TABLE `settings`')
  }
}
