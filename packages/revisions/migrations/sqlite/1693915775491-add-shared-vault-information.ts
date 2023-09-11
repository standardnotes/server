import { MigrationInterface, QueryRunner } from 'typeorm'

export class AddSharedVaultInformation1693915775491 implements MigrationInterface {
  name = 'AddSharedVaultInformation1693915775491'

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('DROP INDEX "user_uuid"')
    await queryRunner.query('DROP INDEX "item_uuid"')
    await queryRunner.query(
      'CREATE TABLE "temporary_revisions" ("uuid" varchar PRIMARY KEY NOT NULL, "item_uuid" varchar(36) NOT NULL, "user_uuid" varchar(36), "content" text, "content_type" varchar(255), "items_key_id" varchar(255), "enc_item_key" text, "auth_hash" varchar(255), "creation_date" date, "created_at" datetime(6), "updated_at" datetime(6), "edited_by" varchar(36), "shared_vault_uuid" varchar(36), "key_system_identifier" varchar(36))',
    )
    await queryRunner.query(
      'INSERT INTO "temporary_revisions"("uuid", "item_uuid", "user_uuid", "content", "content_type", "items_key_id", "enc_item_key", "auth_hash", "creation_date", "created_at", "updated_at") SELECT "uuid", "item_uuid", "user_uuid", "content", "content_type", "items_key_id", "enc_item_key", "auth_hash", "creation_date", "created_at", "updated_at" FROM "revisions_revisions"',
    )
    await queryRunner.query('DROP TABLE "revisions_revisions"')
    await queryRunner.query('ALTER TABLE "temporary_revisions" RENAME TO "revisions_revisions"')
    await queryRunner.query('CREATE INDEX "user_uuid" ON "revisions_revisions" ("user_uuid") ')
    await queryRunner.query('CREATE INDEX "item_uuid" ON "revisions_revisions" ("item_uuid") ')
    await queryRunner.query(
      'CREATE INDEX "index_revisions_on_shared_vault_uuid" ON "revisions_revisions" ("shared_vault_uuid") ',
    )
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('DROP INDEX "index_revisions_on_shared_vault_uuid"')
    await queryRunner.query('DROP INDEX "item_uuid"')
    await queryRunner.query('DROP INDEX "user_uuid"')
    await queryRunner.query('ALTER TABLE "revisions_revisions" RENAME TO "temporary_revisions"')
    await queryRunner.query(
      'CREATE TABLE "revisions_revisions" ("uuid" varchar PRIMARY KEY NOT NULL, "item_uuid" varchar(36) NOT NULL, "user_uuid" varchar(36), "content" text, "content_type" varchar(255), "items_key_id" varchar(255), "enc_item_key" text, "auth_hash" varchar(255), "creation_date" date, "created_at" datetime(6), "updated_at" datetime(6))',
    )
    await queryRunner.query(
      'INSERT INTO "revisions_revisions"("uuid", "item_uuid", "user_uuid", "content", "content_type", "items_key_id", "enc_item_key", "auth_hash", "creation_date", "created_at", "updated_at") SELECT "uuid", "item_uuid", "user_uuid", "content", "content_type", "items_key_id", "enc_item_key", "auth_hash", "creation_date", "created_at", "updated_at" FROM "temporary_revisions"',
    )
    await queryRunner.query('DROP TABLE "temporary_revisions"')
    await queryRunner.query('CREATE INDEX "item_uuid" ON "revisions_revisions" ("item_uuid") ')
    await queryRunner.query('CREATE INDEX "user_uuid" ON "revisions_revisions" ("user_uuid") ')
  }
}
