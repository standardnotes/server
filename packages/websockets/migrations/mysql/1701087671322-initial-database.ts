import { MigrationInterface, QueryRunner } from 'typeorm'

export class InitialDatabase1701087671322 implements MigrationInterface {
  name = 'InitialDatabase1701087671322'

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      'CREATE TABLE `connections` (`uuid` varchar(36) NOT NULL, `user_uuid` varchar(36) NOT NULL, `session_uuid` varchar(36) NOT NULL, `connection_id` varchar(255) NOT NULL, `created_at_timestamp` bigint NOT NULL, `updated_at_timestamp` bigint NOT NULL, INDEX `index_connections_on_user_uuid` (`user_uuid`), UNIQUE INDEX `index_connections_on_connection_id` (`connection_id`), PRIMARY KEY (`uuid`)) ENGINE=InnoDB',
    )
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('DROP INDEX `index_connections_on_connection_id` ON `connections`')
    await queryRunner.query('DROP INDEX `index_connections_on_user_uuid` ON `connections`')
    await queryRunner.query('DROP TABLE `connections`')
  }
}
