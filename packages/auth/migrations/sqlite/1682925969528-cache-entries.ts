import { MigrationInterface, QueryRunner } from 'typeorm'

export class cacheEntries1682925969528 implements MigrationInterface {
  name = 'cacheEntries1682925969528'

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      'CREATE TABLE "cache_entries" ("uuid" varchar PRIMARY KEY NOT NULL, "key" text NOT NULL, "value" text NOT NULL, "expires_at" datetime)',
    )
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('DROP TABLE "cache_entries"')
  }
}
