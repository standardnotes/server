import { MigrationInterface, QueryRunner } from 'typeorm'

export class AddSharedVaultUsers1694000575425 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      'CREATE TABLE `auth_shared_vault_users` (`uuid` varchar(36) NOT NULL, `shared_vault_uuid` varchar(36) NOT NULL, `user_uuid` varchar(36) NOT NULL, `permission` varchar(24) NOT NULL, `created_at_timestamp` bigint NOT NULL, `updated_at_timestamp` bigint NOT NULL, INDEX `shared_vault_uuid_on_auth_shared_vault_users` (`shared_vault_uuid`), INDEX `user_uuid_on_auth_shared_vault_users` (`user_uuid`), PRIMARY KEY (`uuid`)) ENGINE=InnoDB',
    )
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('DROP INDEX `user_uuid_on_auth_shared_vault_users` ON `auth_shared_vault_users`')
    await queryRunner.query('DROP INDEX `shared_vault_uuid_on_auth_shared_vault_users` ON `auth_shared_vault_users`')
    await queryRunner.query('DROP TABLE `auth_shared_vault_users`')
  }
}
