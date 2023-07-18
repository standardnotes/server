import { MigrationInterface, QueryRunner } from 'typeorm'

export class AddSharedVaultAndKeySystemAssociations1689672099829 implements MigrationInterface {
  name = 'AddSharedVaultAndKeySystemAssociations1689672099829'

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      'CREATE TABLE "shared_vault_associations" ("uuid" varchar PRIMARY KEY NOT NULL, "shared_vault_uuid" varchar(36) NOT NULL, "item_uuid" varchar(36) NOT NULL, "last_edited_by" varchar(36) NOT NULL, "created_at_timestamp" bigint NOT NULL, "updated_at_timestamp" bigint NOT NULL)',
    )
    await queryRunner.query(
      'CREATE INDEX "shared_vault_uuid_on_shared_vault_associations" ON "shared_vault_associations" ("shared_vault_uuid") ',
    )
    await queryRunner.query(
      'CREATE INDEX "item_uuid_on_shared_vault_associations" ON "shared_vault_associations" ("item_uuid") ',
    )
    await queryRunner.query(
      'CREATE TABLE "key_system_associations" ("uuid" varchar PRIMARY KEY NOT NULL, "key_system_uuid" varchar(36) NOT NULL, "item_uuid" varchar(36) NOT NULL, "created_at_timestamp" bigint NOT NULL, "updated_at_timestamp" bigint NOT NULL)',
    )
    await queryRunner.query(
      'CREATE INDEX "key_system_uuid_on_key_system_associations" ON "key_system_associations" ("key_system_uuid") ',
    )
    await queryRunner.query(
      'CREATE INDEX "item_uuid_on_key_system_associations" ON "key_system_associations" ("item_uuid") ',
    )
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('DROP INDEX "item_uuid_on_key_system_associations"')
    await queryRunner.query('DROP INDEX "key_system_uuid_on_key_system_associations"')
    await queryRunner.query('DROP TABLE "key_system_associations"')
    await queryRunner.query('DROP INDEX "item_uuid_on_shared_vault_associations"')
    await queryRunner.query('DROP INDEX "shared_vault_uuid_on_shared_vault_associations"')
    await queryRunner.query('DROP TABLE "shared_vault_associations"')
  }
}
