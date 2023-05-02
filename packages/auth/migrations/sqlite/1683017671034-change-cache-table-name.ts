import { MigrationInterface, QueryRunner } from 'typeorm'

export class changeCacheTableName1683017671034 implements MigrationInterface {
  name = 'changeCacheTableName1683017671034'

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('ALTER TABLE "cache_entries" RENAME TO "auth_cache_entries"')
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('ALTER TABLE "auth_cache_entries" RENAME TO "cache_entries"')
  }
}
