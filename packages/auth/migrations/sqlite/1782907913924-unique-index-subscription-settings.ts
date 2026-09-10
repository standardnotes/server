import { MigrationInterface, QueryRunner } from 'typeorm'

export class UniqueIndexSubscriptionSettings1782907913924 implements MigrationInterface {
  name = 'UniqueIndexSubscriptionSettings1782907913924'

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Remove duplicate (name, user_subscription_uuid) rows, keeping only the most recently updated
    // one per pair (tie-broken deterministically by uuid) so the unique index below can be created.
    await queryRunner.query(
      'DELETE FROM "subscription_settings" WHERE uuid NOT IN (' +
        'SELECT uuid FROM (' +
        'SELECT uuid, ROW_NUMBER() OVER (' +
        'PARTITION BY name, user_subscription_uuid ORDER BY updated_at DESC, uuid DESC) rn ' +
        'FROM "subscription_settings") WHERE rn = 1)',
    )

    await queryRunner.query('DROP INDEX "index_settings_on_name_and_user_subscription_uuid"')
    await queryRunner.query(
      'CREATE UNIQUE INDEX "index_settings_on_name_and_user_subscription_uuid" ON "subscription_settings" ("name", "user_subscription_uuid")',
    )
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('DROP INDEX "index_settings_on_name_and_user_subscription_uuid"')
    await queryRunner.query(
      'CREATE INDEX "index_settings_on_name_and_user_subscription_uuid" ON "subscription_settings" ("name", "user_subscription_uuid")',
    )
  }
}
