import { MigrationInterface, QueryRunner } from 'typeorm'

export class initDatabase1667555285111 implements MigrationInterface {
  name = 'initDatabase1667555285111'

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      'CREATE TABLE `analytics_entities` (`id` int NOT NULL AUTO_INCREMENT, `user_uuid` varchar(36) NOT NULL, INDEX `user_uuid` (`user_uuid`), PRIMARY KEY (`id`)) ENGINE=InnoDB',
    )
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('DROP INDEX `user_uuid` ON `analytics_entities`')
    await queryRunner.query('DROP TABLE `analytics_entities`')
  }
}
