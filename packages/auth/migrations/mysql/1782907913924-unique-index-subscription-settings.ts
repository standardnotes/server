import { MigrationInterface, QueryRunner } from 'typeorm'

export class UniqueIndexSubscriptionSettings1782907913924 implements MigrationInterface {
  name = 'UniqueIndexSubscriptionSettings1782907913924'

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Remove duplicate (name, user_subscription_uuid) rows, keeping only the most recently updated
    // one per pair (tie-broken deterministically by uuid) so the unique index below can be created.
    await queryRunner.query(
      'DELETE s1 FROM `subscription_settings` s1 ' +
        'INNER JOIN `subscription_settings` s2 ' +
        'ON s1.name = s2.name ' +
        'AND s1.user_subscription_uuid = s2.user_subscription_uuid ' +
        'AND (s2.updated_at > s1.updated_at OR (s2.updated_at = s1.updated_at AND s2.uuid > s1.uuid))',
    )

    await queryRunner.query('DROP INDEX `index_settings_on_name_and_user_subscription_uuid` ON `subscription_settings`')
    await queryRunner.query(
      'CREATE UNIQUE INDEX `index_settings_on_name_and_user_subscription_uuid` ON `subscription_settings` (`name`, `user_subscription_uuid`)',
    )
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('DROP INDEX `index_settings_on_name_and_user_subscription_uuid` ON `subscription_settings`')
    await queryRunner.query(
      'CREATE INDEX `index_settings_on_name_and_user_subscription_uuid` ON `subscription_settings` (`name`, `user_subscription_uuid`)',
    )
  }
}
