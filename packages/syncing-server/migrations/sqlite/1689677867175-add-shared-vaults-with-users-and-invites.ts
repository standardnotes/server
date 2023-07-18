import { MigrationInterface, QueryRunner } from 'typeorm'

export class AddSharedVaultsWithUsersAndInvites1689677867175 implements MigrationInterface {
  name = 'AddSharedVaultsWithUsersAndInvites1689677867175'

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      'CREATE TABLE "shared_vaults" ("uuid" varchar PRIMARY KEY NOT NULL, "user_uuid" varchar(36) NOT NULL, "file_upload_bytes_used" integer NOT NULL, "file_upload_bytes_limit" integer NOT NULL, "created_at_timestamp" bigint NOT NULL, "updated_at_timestamp" bigint NOT NULL)',
    )
    await queryRunner.query('CREATE INDEX "user_uuid_on_shared_vaults" ON "shared_vaults" ("user_uuid") ')
    await queryRunner.query(
      'CREATE TABLE "shared_vault_users" ("uuid" varchar PRIMARY KEY NOT NULL, "shared_vault_uuid" varchar(36) NOT NULL, "user_uuid" varchar(36) NOT NULL, "permission" varchar(24) NOT NULL, "created_at_timestamp" bigint NOT NULL, "updated_at_timestamp" bigint NOT NULL)',
    )
    await queryRunner.query(
      'CREATE INDEX "shared_vault_uuid_on_shared_vault_users" ON "shared_vault_users" ("shared_vault_uuid") ',
    )
    await queryRunner.query('CREATE INDEX "user_uuid_on_shared_vault_users" ON "shared_vault_users" ("user_uuid") ')
    await queryRunner.query(
      'CREATE TABLE "shared_vault_invites" ("uuid" varchar PRIMARY KEY NOT NULL, "shared_vault_uuid" varchar(36) NOT NULL, "user_uuid" varchar(36) NOT NULL, "sender_uuid" varchar(36) NOT NULL, "encrypted_message" text NOT NULL, "permission" varchar(24) NOT NULL, "created_at_timestamp" bigint NOT NULL, "updated_at_timestamp" bigint NOT NULL)',
    )
    await queryRunner.query(
      'CREATE INDEX "shared_vault_uuid_on_shared_vault_invites" ON "shared_vault_invites" ("shared_vault_uuid") ',
    )
    await queryRunner.query('CREATE INDEX "user_uuid_on_shared_vault_invites" ON "shared_vault_invites" ("user_uuid") ')
    await queryRunner.query(
      'CREATE INDEX "sender_uuid_on_shared_vault_invites" ON "shared_vault_invites" ("sender_uuid") ',
    )
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('DROP INDEX "sender_uuid_on_shared_vault_invites"')
    await queryRunner.query('DROP INDEX "user_uuid_on_shared_vault_invites"')
    await queryRunner.query('DROP INDEX "shared_vault_uuid_on_shared_vault_invites"')
    await queryRunner.query('DROP TABLE "shared_vault_invites"')
    await queryRunner.query('DROP INDEX "user_uuid_on_shared_vault_users"')
    await queryRunner.query('DROP INDEX "shared_vault_uuid_on_shared_vault_users"')
    await queryRunner.query('DROP TABLE "shared_vault_users"')
    await queryRunner.query('DROP INDEX "user_uuid_on_shared_vaults"')
    await queryRunner.query('DROP TABLE "shared_vaults"')
  }
}
