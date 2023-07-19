import { MigrationInterface, QueryRunner } from 'typeorm'

export class RenameKeyMessageIdentifier1689746527310 implements MigrationInterface {
  name = 'RenameKeyMessageIdentifier1689746527310'

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('DROP INDEX "key_system_uuid_on_key_system_associations"')
    await queryRunner.query('DROP INDEX "item_uuid_on_key_system_associations"')
    await queryRunner.query(
      'CREATE TABLE "temporary_key_system_associations" ("uuid" varchar PRIMARY KEY NOT NULL, "key_system_identifier" varchar(36) NOT NULL, "item_uuid" varchar(36) NOT NULL, "created_at_timestamp" bigint NOT NULL, "updated_at_timestamp" bigint NOT NULL)',
    )
    await queryRunner.query(
      'INSERT INTO "temporary_key_system_associations"("uuid", "key_system_identifier", "item_uuid", "created_at_timestamp", "updated_at_timestamp") SELECT "uuid", "key_system_uuid", "item_uuid", "created_at_timestamp", "updated_at_timestamp" FROM "key_system_associations"',
    )
    await queryRunner.query('DROP TABLE "key_system_associations"')
    await queryRunner.query('ALTER TABLE "temporary_key_system_associations" RENAME TO "key_system_associations"')
    await queryRunner.query(
      'CREATE INDEX "item_uuid_on_key_system_associations" ON "key_system_associations" ("item_uuid") ',
    )
    await queryRunner.query(
      'CREATE INDEX "key_system_identifier_on_key_system_associations" ON "key_system_associations" ("key_system_identifier") ',
    )
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('DROP INDEX "key_system_identifier_on_key_system_associations"')
    await queryRunner.query('DROP INDEX "item_uuid_on_key_system_associations"')
    await queryRunner.query('ALTER TABLE "key_system_associations" RENAME TO "temporary_key_system_associations"')
    await queryRunner.query(
      'CREATE TABLE "key_system_associations" ("uuid" varchar PRIMARY KEY NOT NULL, "key_system_uuid" varchar(36) NOT NULL, "item_uuid" varchar(36) NOT NULL, "created_at_timestamp" bigint NOT NULL, "updated_at_timestamp" bigint NOT NULL)',
    )
    await queryRunner.query(
      'INSERT INTO "key_system_associations"("uuid", "key_system_uuid", "item_uuid", "created_at_timestamp", "updated_at_timestamp") SELECT "uuid", "key_system_identifier", "item_uuid", "created_at_timestamp", "updated_at_timestamp" FROM "temporary_key_system_associations"',
    )
    await queryRunner.query('DROP TABLE "temporary_key_system_associations"')
    await queryRunner.query(
      'CREATE INDEX "item_uuid_on_key_system_associations" ON "key_system_associations" ("item_uuid") ',
    )
    await queryRunner.query(
      'CREATE INDEX "key_system_uuid_on_key_system_associations" ON "key_system_associations" ("key_system_uuid") ',
    )
  }
}
