import { MigrationInterface, QueryRunner } from 'typeorm'

export class initDatabase1639394147420 implements MigrationInterface {
  name = 'initDatabase1639394147420'

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      'CREATE TABLE `events` (`uuid` varchar(36) NOT NULL, `user_identifier` varchar(255) NOT NULL, `user_identifier_type` varchar(255) NOT NULL, `event_type` varchar(255) NOT NULL, `event_payload` text NOT NULL, `timestamp` bigint NOT NULL, INDEX `index_events_on_user_identifier` (`user_identifier`), PRIMARY KEY (`uuid`)) ENGINE=InnoDB',
    )
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('DROP INDEX `index_events_on_user_identifier` ON `events`')
    await queryRunner.query('DROP TABLE `events`')
  }
}
