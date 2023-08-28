import { MigrationInterface, QueryRunner } from 'typeorm'

export class AddSharedVaultInformation1693220037441 implements MigrationInterface {
  name = 'AddSharedVaultInformation1693220037441'

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('DROP INDEX "index_items_on_user_uuid_and_content_type"')
    await queryRunner.query('DROP INDEX "user_uuid_and_updated_at_timestamp_and_created_at_timestamp"')
    await queryRunner.query('DROP INDEX "user_uuid_and_deleted"')
    await queryRunner.query('DROP INDEX "updated_at_timestamp"')
    await queryRunner.query('DROP INDEX "index_items_on_deleted"')
    await queryRunner.query('DROP INDEX "index_items_on_user_uuid"')
    await queryRunner.query('DROP INDEX "index_items_on_content_type"')
    await queryRunner.query(
      'CREATE TABLE "temporary_items" ("uuid" varchar PRIMARY KEY NOT NULL, "duplicate_of" varchar(36), "items_key_id" varchar(255), "content" text, "content_type" varchar(255), "content_size" integer, "enc_item_key" text, "auth_hash" varchar(255), "user_uuid" varchar(36) NOT NULL, "deleted" tinyint(1) DEFAULT (0), "created_at" datetime(6) NOT NULL, "updated_at" datetime(6) NOT NULL, "created_at_timestamp" bigint NOT NULL, "updated_at_timestamp" bigint NOT NULL, "updated_with_session" varchar(36), "last_edited_by" varchar(36), "shared_vault_uuid" varchar(36), "key_system_identifier" varchar(36))',
    )
    await queryRunner.query(
      'INSERT INTO "temporary_items"("uuid", "duplicate_of", "items_key_id", "content", "content_type", "content_size", "enc_item_key", "auth_hash", "user_uuid", "deleted", "created_at", "updated_at", "created_at_timestamp", "updated_at_timestamp", "updated_with_session") SELECT "uuid", "duplicate_of", "items_key_id", "content", "content_type", "content_size", "enc_item_key", "auth_hash", "user_uuid", "deleted", "created_at", "updated_at", "created_at_timestamp", "updated_at_timestamp", "updated_with_session" FROM "items"',
    )
    await queryRunner.query('DROP TABLE "items"')
    await queryRunner.query('ALTER TABLE "temporary_items" RENAME TO "items"')
    await queryRunner.query(
      'CREATE INDEX "index_items_on_user_uuid_and_content_type" ON "items" ("user_uuid", "content_type") ',
    )
    await queryRunner.query(
      'CREATE INDEX "user_uuid_and_updated_at_timestamp_and_created_at_timestamp" ON "items" ("user_uuid", "updated_at_timestamp", "created_at_timestamp") ',
    )
    await queryRunner.query('CREATE INDEX "user_uuid_and_deleted" ON "items" ("user_uuid", "deleted") ')
    await queryRunner.query('CREATE INDEX "updated_at_timestamp" ON "items" ("updated_at_timestamp") ')
    await queryRunner.query('CREATE INDEX "index_items_on_deleted" ON "items" ("deleted") ')
    await queryRunner.query('CREATE INDEX "index_items_on_user_uuid" ON "items" ("user_uuid") ')
    await queryRunner.query('CREATE INDEX "index_items_on_content_type" ON "items" ("content_type") ')
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('DROP INDEX "index_items_on_shared_vault_uuid"')
    await queryRunner.query('DROP INDEX "user_uuid_and_deleted"')
    await queryRunner.query('DROP INDEX "user_uuid_on_shared_vaults"')
    await queryRunner.query('DROP INDEX "index_items_on_content_type"')
    await queryRunner.query('DROP INDEX "index_items_on_user_uuid"')
    await queryRunner.query('DROP INDEX "index_items_on_deleted"')
    await queryRunner.query('DROP INDEX "updated_at_timestamp"')
    await queryRunner.query('DROP INDEX "user_uuid_and_updated_at_timestamp_and_created_at_timestamp"')
    await queryRunner.query('DROP INDEX "index_items_on_user_uuid_and_content_type"')
    await queryRunner.query('ALTER TABLE "items" RENAME TO "temporary_items"')
    await queryRunner.query(
      'CREATE TABLE "items" ("uuid" varchar PRIMARY KEY NOT NULL, "duplicate_of" varchar(36), "items_key_id" varchar(255), "content" text, "content_type" varchar(255), "content_size" integer, "enc_item_key" text, "auth_hash" varchar(255), "user_uuid" varchar(36) NOT NULL, "deleted" tinyint(1) DEFAULT (0), "created_at" datetime(6) NOT NULL, "updated_at" datetime(6) NOT NULL, "created_at_timestamp" bigint NOT NULL, "updated_at_timestamp" bigint NOT NULL, "updated_with_session" varchar(36), "last_edited_by" varchar(36), "shared_vault_uuid" varchar(36), "key_system_identifier" varchar(36))',
    )
    await queryRunner.query(
      'INSERT INTO "items"("uuid", "duplicate_of", "items_key_id", "content", "content_type", "content_size", "enc_item_key", "auth_hash", "user_uuid", "deleted", "created_at", "updated_at", "created_at_timestamp", "updated_at_timestamp", "updated_with_session", "last_edited_by", "shared_vault_uuid", "key_system_identifier") SELECT "uuid", "duplicate_of", "items_key_id", "content", "content_type", "content_size", "enc_item_key", "auth_hash", "user_uuid", "deleted", "created_at", "updated_at", "created_at_timestamp", "updated_at_timestamp", "updated_with_session", "last_edited_by", "shared_vault_uuid", "key_system_identifier" FROM "temporary_items"',
    )
    await queryRunner.query('DROP TABLE "temporary_items"')
    await queryRunner.query('CREATE INDEX "index_items_on_content_type" ON "items" ("content_type") ')
    await queryRunner.query('CREATE INDEX "index_items_on_user_uuid" ON "items" ("user_uuid") ')
    await queryRunner.query('CREATE INDEX "index_items_on_deleted" ON "items" ("deleted") ')
    await queryRunner.query('CREATE INDEX "updated_at_timestamp" ON "items" ("updated_at_timestamp") ')
    await queryRunner.query(
      'CREATE INDEX "user_uuid_and_updated_at_timestamp_and_created_at_timestamp" ON "items" ("user_uuid", "updated_at_timestamp", "created_at_timestamp") ',
    )
    await queryRunner.query(
      'CREATE INDEX "index_items_on_user_uuid_and_content_type" ON "items" ("user_uuid", "content_type") ',
    )
    await queryRunner.query('CREATE INDEX "user_uuid_and_deleted" ON "items" ("user_uuid", "deleted") ')
  }
}
