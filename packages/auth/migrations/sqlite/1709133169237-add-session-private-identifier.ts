import { MigrationInterface, QueryRunner } from 'typeorm'

export class AddSessionPrivateIdentifier1709133169237 implements MigrationInterface {
  name = 'AddSessionPrivateIdentifier1709133169237'

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('DROP INDEX "index_sessions_on_updated_at"')
    await queryRunner.query('DROP INDEX "index_sessions_on_user_uuid"')
    await queryRunner.query(
      'CREATE TABLE "temporary_sessions" ("uuid" varchar PRIMARY KEY NOT NULL, "user_uuid" varchar(255), "hashed_access_token" varchar(255) NOT NULL, "hashed_refresh_token" varchar(255) NOT NULL, "access_expiration" datetime NOT NULL DEFAULT (CURRENT_TIMESTAMP), "refresh_expiration" datetime NOT NULL, "api_version" varchar(255), "user_agent" text, "created_at" datetime NOT NULL, "updated_at" datetime NOT NULL, "readonly_access" tinyint NOT NULL DEFAULT (0), "version" smallint DEFAULT (1), "private_identifier" varchar(36))',
    )
    await queryRunner.query(
      'INSERT INTO "temporary_sessions"("uuid", "user_uuid", "hashed_access_token", "hashed_refresh_token", "access_expiration", "refresh_expiration", "api_version", "user_agent", "created_at", "updated_at", "readonly_access", "version") SELECT "uuid", "user_uuid", "hashed_access_token", "hashed_refresh_token", "access_expiration", "refresh_expiration", "api_version", "user_agent", "created_at", "updated_at", "readonly_access", "version" FROM "sessions"',
    )
    await queryRunner.query('DROP TABLE "sessions"')
    await queryRunner.query('ALTER TABLE "temporary_sessions" RENAME TO "sessions"')
    await queryRunner.query('CREATE INDEX "index_sessions_on_updated_at" ON "sessions" ("updated_at") ')
    await queryRunner.query('CREATE INDEX "index_sessions_on_user_uuid" ON "sessions" ("user_uuid") ')
    await queryRunner.query('CREATE INDEX "index_sessions_on_private_identifier" ON "sessions" ("private_identifier") ')
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('DROP INDEX "index_sessions_on_private_identifier"')
    await queryRunner.query('DROP INDEX "index_sessions_on_user_uuid"')
    await queryRunner.query('DROP INDEX "index_sessions_on_updated_at"')
    await queryRunner.query('ALTER TABLE "sessions" RENAME TO "temporary_sessions"')
    await queryRunner.query(
      'CREATE TABLE "sessions" ("uuid" varchar PRIMARY KEY NOT NULL, "user_uuid" varchar(255), "hashed_access_token" varchar(255) NOT NULL, "hashed_refresh_token" varchar(255) NOT NULL, "access_expiration" datetime NOT NULL DEFAULT (CURRENT_TIMESTAMP), "refresh_expiration" datetime NOT NULL, "api_version" varchar(255), "user_agent" text, "created_at" datetime NOT NULL, "updated_at" datetime NOT NULL, "readonly_access" tinyint NOT NULL DEFAULT (0), "version" smallint DEFAULT (1))',
    )
    await queryRunner.query(
      'INSERT INTO "sessions"("uuid", "user_uuid", "hashed_access_token", "hashed_refresh_token", "access_expiration", "refresh_expiration", "api_version", "user_agent", "created_at", "updated_at", "readonly_access", "version") SELECT "uuid", "user_uuid", "hashed_access_token", "hashed_refresh_token", "access_expiration", "refresh_expiration", "api_version", "user_agent", "created_at", "updated_at", "readonly_access", "version" FROM "temporary_sessions"',
    )
    await queryRunner.query('DROP TABLE "temporary_sessions"')
    await queryRunner.query('CREATE INDEX "index_sessions_on_user_uuid" ON "sessions" ("user_uuid") ')
    await queryRunner.query('CREATE INDEX "index_sessions_on_updated_at" ON "sessions" ("updated_at") ')
  }
}
