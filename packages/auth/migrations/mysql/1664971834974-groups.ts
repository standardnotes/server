import { MigrationInterface, QueryRunner } from 'typeorm'

export class groups1664971834974 implements MigrationInterface {
  name = 'groups1664971834974'

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      'CREATE TABLE `groups` (`uuid` varchar(36) NOT NULL, `type` varchar(64) NOT NULL, PRIMARY KEY (`uuid`)) ENGINE=InnoDB',
    )
    await queryRunner.query(
      'CREATE TABLE `group_users` (`uuid` varchar(36) NOT NULL, `access_level` varchar(64) NOT NULL, `user_uuid` varchar(36) NOT NULL, `group_uuid` varchar(36) NOT NULL, `encrypted_group_key` varchar(255) NOT NULL, UNIQUE INDEX `index_group_users_on_group_and_user` (`user_uuid`, `group_uuid`), PRIMARY KEY (`uuid`)) ENGINE=InnoDB',
    )
    await queryRunner.query(
      'ALTER TABLE `group_users` ADD CONSTRAINT `FK_b97989611efde2c54b074127920` FOREIGN KEY (`user_uuid`) REFERENCES `users`(`uuid`) ON DELETE CASCADE ON UPDATE NO ACTION',
    )
    await queryRunner.query(
      'ALTER TABLE `group_users` ADD CONSTRAINT `FK_9d1bcb8c649eb05d7a2eb62114e` FOREIGN KEY (`group_uuid`) REFERENCES `groups`(`uuid`) ON DELETE CASCADE ON UPDATE NO ACTION',
    )
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('ALTER TABLE `group_users` DROP FOREIGN KEY `FK_9d1bcb8c649eb05d7a2eb62114e`')
    await queryRunner.query('ALTER TABLE `group_users` DROP FOREIGN KEY `FK_b97989611efde2c54b074127920`')
    await queryRunner.query('DROP INDEX `index_group_users_on_group_and_user` ON `group_users`')
    await queryRunner.query('DROP TABLE `group_users`')
    await queryRunner.query('DROP TABLE `groups`')
  }
}
