import { MigrationInterface, QueryRunner } from 'typeorm'

export class initialBoilerplate1682678053275 implements MigrationInterface {
  name = 'initialBoilerplate1682678053275'

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      'CREATE TABLE "revisions_revisions" ("uuid" varchar PRIMARY KEY NOT NULL, "item_uuid" varchar(36) NOT NULL, "user_uuid" varchar(36), "content" text, "content_type" varchar(255), "items_key_id" varchar(255), "enc_item_key" text, "auth_hash" varchar(255), "creation_date" date, "created_at" datetime(6), "updated_at" datetime(6))',
    )
    await queryRunner.query('CREATE INDEX "item_uuid" ON "revisions_revisions" ("item_uuid") ')
    await queryRunner.query('CREATE INDEX "user_uuid" ON "revisions_revisions" ("user_uuid") ')
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('DROP INDEX "user_uuid"')
    await queryRunner.query('DROP INDEX "item_uuid"')
    await queryRunner.query('DROP TABLE "revisions_revisions"')
  }
}
