import { MigrationInterface, QueryRunner } from 'typeorm'

export class AddDesignatedSurvivor1695284249461 implements MigrationInterface {
  name = 'AddDesignatedSurvivor1695284249461'

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('DROP INDEX "user_uuid_on_shared_vault_users"')
    await queryRunner.query('DROP INDEX "shared_vault_uuid_on_shared_vault_users"')
    await queryRunner.query(
      'CREATE TABLE "temporary_shared_vault_users" ("uuid" varchar PRIMARY KEY NOT NULL, "shared_vault_uuid" varchar(36) NOT NULL, "user_uuid" varchar(36) NOT NULL, "permission" varchar(24) NOT NULL, "created_at_timestamp" bigint NOT NULL, "updated_at_timestamp" bigint NOT NULL, "is_designated_survivor" boolean NOT NULL DEFAULT (0))',
    )
    await queryRunner.query(
      'INSERT INTO "temporary_shared_vault_users"("uuid", "shared_vault_uuid", "user_uuid", "permission", "created_at_timestamp", "updated_at_timestamp") SELECT "uuid", "shared_vault_uuid", "user_uuid", "permission", "created_at_timestamp", "updated_at_timestamp" FROM "shared_vault_users"',
    )
    await queryRunner.query('DROP TABLE "shared_vault_users"')
    await queryRunner.query('ALTER TABLE "temporary_shared_vault_users" RENAME TO "shared_vault_users"')
    await queryRunner.query('CREATE INDEX "user_uuid_on_shared_vault_users" ON "shared_vault_users" ("user_uuid") ')
    await queryRunner.query(
      'CREATE INDEX "shared_vault_uuid_on_shared_vault_users" ON "shared_vault_users" ("shared_vault_uuid") ',
    )
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('DROP INDEX "shared_vault_uuid_on_shared_vault_users"')
    await queryRunner.query('DROP INDEX "user_uuid_on_shared_vault_users"')
    await queryRunner.query('ALTER TABLE "shared_vault_users" RENAME TO "temporary_shared_vault_users"')
    await queryRunner.query(
      'CREATE TABLE "shared_vault_users" ("uuid" varchar PRIMARY KEY NOT NULL, "shared_vault_uuid" varchar(36) NOT NULL, "user_uuid" varchar(36) NOT NULL, "permission" varchar(24) NOT NULL, "created_at_timestamp" bigint NOT NULL, "updated_at_timestamp" bigint NOT NULL)',
    )
    await queryRunner.query(
      'INSERT INTO "shared_vault_users"("uuid", "shared_vault_uuid", "user_uuid", "permission", "created_at_timestamp", "updated_at_timestamp") SELECT "uuid", "shared_vault_uuid", "user_uuid", "permission", "created_at_timestamp", "updated_at_timestamp" FROM "temporary_shared_vault_users"',
    )
    await queryRunner.query('DROP TABLE "temporary_shared_vault_users"')
    await queryRunner.query(
      'CREATE INDEX "shared_vault_uuid_on_shared_vault_users" ON "shared_vault_users" ("shared_vault_uuid") ',
    )
    await queryRunner.query('CREATE INDEX "user_uuid_on_shared_vault_users" ON "shared_vault_users" ("user_uuid") ')
  }
}
