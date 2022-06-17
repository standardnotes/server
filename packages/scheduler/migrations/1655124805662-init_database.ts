import { MigrationInterface, QueryRunner } from 'typeorm'

export class initDatabase1655124805662 implements MigrationInterface {
  name = 'initDatabase1655124805662'

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      'CREATE TABLE `predicates` (`uuid` varchar(36) NOT NULL, `name` varchar(255) NOT NULL, `authority` varchar(255) NOT NULL, `status` varchar(32) NOT NULL, `job_uuid` varchar(36) NULL, PRIMARY KEY (`uuid`)) ENGINE=InnoDB',
    )
    await queryRunner.query(
      'CREATE TABLE `jobs` (`uuid` varchar(36) NOT NULL, `user_identifier` varchar(255) NOT NULL, `user_identifier_type` varchar(32) NOT NULL, `status` varchar(32) NOT NULL, `created_at` bigint NOT NULL, `scheduled_at` bigint NOT NULL, INDEX `index_jobs_on_user_identifier` (`user_identifier`), INDEX `index_on_scheduled_status` (`status`, `scheduled_at`), PRIMARY KEY (`uuid`)) ENGINE=InnoDB',
    )
    await queryRunner.query(
      'ALTER TABLE `predicates` ADD CONSTRAINT `FK_0b28dbc0986c27765681a7b5faf` FOREIGN KEY (`job_uuid`) REFERENCES `jobs`(`uuid`) ON DELETE CASCADE ON UPDATE NO ACTION',
    )
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('ALTER TABLE `predicates` DROP FOREIGN KEY `FK_0b28dbc0986c27765681a7b5faf`')
    await queryRunner.query('DROP INDEX `index_on_scheduled_status` ON `jobs`')
    await queryRunner.query('DROP INDEX `index_jobs_on_user_identifier` ON `jobs`')
    await queryRunner.query('DROP TABLE `jobs`')
    await queryRunner.query('DROP TABLE `predicates`')
  }
}
