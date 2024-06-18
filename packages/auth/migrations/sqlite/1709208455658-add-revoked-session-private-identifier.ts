import { MigrationInterface, QueryRunner } from 'typeorm'

export class AddRevokedSessionPrivateIdentifier1709208455658 implements MigrationInterface {
  name = 'AddRevokedSessionPrivateIdentifier1709208455658'

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('DROP INDEX "index_revoked_sessions_on_user_uuid"')
    await queryRunner.query(
      'CREATE TABLE "temporary_revoked_sessions" ("uuid" varchar PRIMARY KEY NOT NULL, "user_uuid" varchar(36) NOT NULL, "received" tinyint NOT NULL DEFAULT (0), "created_at" datetime NOT NULL, "received_at" datetime, "user_agent" text, "api_version" varchar(255), "private_identifier" varchar(36), CONSTRAINT "FK_edaf18faca67e682be39b5ecae5" FOREIGN KEY ("user_uuid") REFERENCES "users" ("uuid") ON DELETE CASCADE ON UPDATE NO ACTION)',
    )
    await queryRunner.query(
      'INSERT INTO "temporary_revoked_sessions"("uuid", "user_uuid", "received", "created_at", "received_at", "user_agent", "api_version") SELECT "uuid", "user_uuid", "received", "created_at", "received_at", "user_agent", "api_version" FROM "revoked_sessions"',
    )
    await queryRunner.query('DROP TABLE "revoked_sessions"')
    await queryRunner.query('ALTER TABLE "temporary_revoked_sessions" RENAME TO "revoked_sessions"')
    await queryRunner.query('CREATE INDEX "index_revoked_sessions_on_user_uuid" ON "revoked_sessions" ("user_uuid") ')
    await queryRunner.query(
      'CREATE INDEX "index_revoked_sessions_on_private_identifier" ON "revoked_sessions" ("private_identifier") ',
    )
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('DROP INDEX "index_revoked_sessions_on_user_uuid"')
    await queryRunner.query('ALTER TABLE "revoked_sessions" RENAME TO "temporary_revoked_sessions"')
    await queryRunner.query(
      'CREATE TABLE "revoked_sessions" ("uuid" varchar PRIMARY KEY NOT NULL, "user_uuid" varchar(36) NOT NULL, "received" tinyint NOT NULL DEFAULT (0), "created_at" datetime NOT NULL, "received_at" datetime, "user_agent" text, "api_version" varchar(255), CONSTRAINT "FK_edaf18faca67e682be39b5ecae5" FOREIGN KEY ("user_uuid") REFERENCES "users" ("uuid") ON DELETE CASCADE ON UPDATE NO ACTION)',
    )
    await queryRunner.query(
      'INSERT INTO "revoked_sessions"("uuid", "user_uuid", "received", "created_at", "received_at", "user_agent", "api_version") SELECT "uuid", "user_uuid", "received", "created_at", "received_at", "user_agent", "api_version" FROM "temporary_revoked_sessions"',
    )
    await queryRunner.query('DROP TABLE "temporary_revoked_sessions"')
    await queryRunner.query('CREATE INDEX "index_revoked_sessions_on_user_uuid" ON "revoked_sessions" ("user_uuid") ')
  }
}
