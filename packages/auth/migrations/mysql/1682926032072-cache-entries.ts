import { MigrationInterface, QueryRunner } from 'typeorm'

export class cacheEntries1682926032072 implements MigrationInterface {
  name = 'cacheEntries1682926032072'

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      'CREATE TABLE `cache_entries` (`uuid` varchar(36) NOT NULL, `key` text NOT NULL, `value` text NOT NULL, `expires_at` datetime NULL, PRIMARY KEY (`uuid`)) ENGINE=InnoDB',
    )
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('DROP TABLE `cache_entries`')
  }
}
