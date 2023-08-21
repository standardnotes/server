import { MigrationInterface, QueryRunner } from 'typeorm'

export class RemoveSharedVaultLimit1692619677621 implements MigrationInterface {
  name = 'RemoveSharedVaultLimit1692619677621'

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('ALTER TABLE "shared_vaults" RENAME TO "temporary_shared_vaults"')
    await queryRunner.query(
      'CREATE TABLE "shared_vaults" ("uuid" varchar PRIMARY KEY NOT NULL, "user_uuid" varchar(36) NOT NULL, "file_upload_bytes_used" integer NOT NULL, "created_at_timestamp" bigint NOT NULL, "updated_at_timestamp" bigint NOT NULL)',
    )
    await queryRunner.query(
      'INSERT INTO "shared_vaults"("uuid", "user_uuid", "file_upload_bytes_used", "created_at_timestamp", "updated_at_timestamp") SELECT "uuid", "user_uuid", "file_upload_bytes_used", "created_at_timestamp", "updated_at_timestamp" FROM "temporary_shared_vaults"',
    )
    await queryRunner.query('DROP TABLE "temporary_shared_vaults"')
  }

  public async down(): Promise<void> {
    return
  }
}
