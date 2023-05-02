import { MigrationInterface, QueryRunner } from 'typeorm'

export class changeCacheTableName1683017908845 implements MigrationInterface {
  name = 'changeCacheTableName1683017908845'

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('RENAME TABLE `cache_entries` TO `auth_cache_entries`')
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('RENAME TABLE `auth_cache_entries` TO `cache_entries`')
  }
}
