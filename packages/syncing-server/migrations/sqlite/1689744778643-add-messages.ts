import { MigrationInterface, QueryRunner } from 'typeorm'

export class AddMessages1689744778643 implements MigrationInterface {
  name = 'AddMessages1689744778643'

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      'CREATE TABLE "messages" ("uuid" varchar PRIMARY KEY NOT NULL, "recipient_uuid" varchar(36) NOT NULL, "sender_uuid" varchar(36) NOT NULL, "encrypted_message" text NOT NULL, "replaceability_identifier" varchar(255), "created_at_timestamp" bigint NOT NULL, "updated_at_timestamp" bigint NOT NULL)',
    )
    await queryRunner.query('CREATE INDEX "recipient_uuid_on_messages" ON "messages" ("recipient_uuid") ')
    await queryRunner.query('CREATE INDEX "sender_uuid_on_messages" ON "messages" ("sender_uuid") ')
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('DROP INDEX "sender_uuid_on_messages"')
    await queryRunner.query('DROP INDEX "recipient_uuid_on_messages"')
    await queryRunner.query('DROP TABLE "messages"')
  }
}
