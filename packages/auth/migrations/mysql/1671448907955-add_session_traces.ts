import { MigrationInterface, QueryRunner } from 'typeorm'

export class addSessionTraces1671448907955 implements MigrationInterface {
  name = 'addSessionTraces1671448907955'

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      'CREATE TABLE `session_traces` (`uuid` varchar(36) NOT NULL, `user_uuid` varchar(36) NOT NULL, `username` varchar(255) NOT NULL, `subscription_plan_name` varchar(64) NULL, `created_at` datetime NOT NULL, `creation_date` date NOT NULL, `expires_at` datetime NOT NULL, INDEX `subscription_plan_name` (`subscription_plan_name`), INDEX `creation_date` (`creation_date`), PRIMARY KEY (`uuid`)) ENGINE=InnoDB',
    )
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('DROP INDEX `creation_date` ON `session_traces`')
    await queryRunner.query('DROP INDEX `subscription_plan_name` ON `session_traces`')
    await queryRunner.query('DROP TABLE `session_traces`')
  }
}
