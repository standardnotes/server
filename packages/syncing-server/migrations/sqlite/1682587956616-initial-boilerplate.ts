import { MigrationInterface, QueryRunner } from 'typeorm'

export class initialBoilerplate1682587956616 implements MigrationInterface {
  name = 'initialBoilerplate1682587956616'

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      'CREATE TABLE "items" ("uuid" varchar PRIMARY KEY NOT NULL, "duplicate_of" varchar(36), "items_key_id" varchar(255), "content" text, "content_type" varchar(255), "content_size" integer, "enc_item_key" text, "auth_hash" varchar(255), "user_uuid" varchar(36) NOT NULL, "deleted" tinyint(1) DEFAULT (0), "created_at" datetime(6) NOT NULL, "updated_at" datetime(6) NOT NULL, "created_at_timestamp" bigint NOT NULL, "updated_at_timestamp" bigint NOT NULL, "updated_with_session" varchar(36))',
    )
    await queryRunner.query('CREATE INDEX "index_items_on_content_type" ON "items" ("content_type") ')
    await queryRunner.query('CREATE INDEX "index_items_on_user_uuid" ON "items" ("user_uuid") ')
    await queryRunner.query('CREATE INDEX "index_items_on_deleted" ON "items" ("deleted") ')
    await queryRunner.query('CREATE INDEX "updated_at_timestamp" ON "items" ("updated_at_timestamp") ')
    await queryRunner.query('CREATE INDEX "user_uuid_and_deleted" ON "items" ("user_uuid", "deleted") ')
    await queryRunner.query(
      'CREATE INDEX "user_uuid_and_updated_at_timestamp_and_created_at_timestamp" ON "items" ("user_uuid", "updated_at_timestamp", "created_at_timestamp") ',
    )
    await queryRunner.query(
      'CREATE INDEX "index_items_on_user_uuid_and_content_type" ON "items" ("user_uuid", "content_type") ',
    )
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('DROP INDEX "index_items_on_user_uuid_and_content_type"')
    await queryRunner.query('DROP INDEX "user_uuid_and_updated_at_timestamp_and_created_at_timestamp"')
    await queryRunner.query('DROP INDEX "user_uuid_and_deleted"')
    await queryRunner.query('DROP INDEX "updated_at_timestamp"')
    await queryRunner.query('DROP INDEX "index_items_on_deleted"')
    await queryRunner.query('DROP INDEX "index_items_on_user_uuid"')
    await queryRunner.query('DROP INDEX "index_items_on_content_type"')
    await queryRunner.query('DROP TABLE "items"')
  }
}
