import { MigrationInterface, QueryRunner } from 'typeorm'

export class addAnalyticsEntities1652880249670 implements MigrationInterface {
  name = 'addAnalyticsEntities1652880249670'

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      'CREATE TABLE `analytics_entities` (`id` int NOT NULL AUTO_INCREMENT, `user_uuid` varchar(36) NOT NULL, UNIQUE INDEX `REL_d2717c4ce2600b9f7acb6b378c` (`user_uuid`), PRIMARY KEY (`id`)) ENGINE=InnoDB',
    )
    await queryRunner.query(
      'ALTER TABLE `analytics_entities` ADD CONSTRAINT `FK_d2717c4ce2600b9f7acb6b378c5` FOREIGN KEY (`user_uuid`) REFERENCES `users`(`uuid`) ON DELETE CASCADE ON UPDATE NO ACTION',
    )
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('ALTER TABLE `analytics_entities` DROP FOREIGN KEY `FK_d2717c4ce2600b9f7acb6b378c5`')
    await queryRunner.query('DROP INDEX `REL_d2717c4ce2600b9f7acb6b378c` ON `analytics_entities`')
    await queryRunner.query('DROP TABLE `analytics_entities`')
  }
}
