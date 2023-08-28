import { MigrationInterface, QueryRunner } from 'typeorm'

export class AddSharedVaultsWithUsersAndInvites1689677728282 implements MigrationInterface {
  name = 'AddSharedVaultsWithUsersAndInvites1689677728282'

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      'CREATE TABLE `shared_vaults` (`uuid` varchar(36) NOT NULL, `user_uuid` varchar(36) NOT NULL, `file_upload_bytes_used` int NOT NULL, `file_upload_bytes_limit` int NOT NULL, `created_at_timestamp` bigint NOT NULL, `updated_at_timestamp` bigint NOT NULL, INDEX `user_uuid_on_shared_vaults` (`user_uuid`), PRIMARY KEY (`uuid`)) ENGINE=InnoDB',
    )
    await queryRunner.query(
      'CREATE TABLE `shared_vault_users` (`uuid` varchar(36) NOT NULL, `shared_vault_uuid` varchar(36) NOT NULL, `user_uuid` varchar(36) NOT NULL, `permission` varchar(24) NOT NULL, `created_at_timestamp` bigint NOT NULL, `updated_at_timestamp` bigint NOT NULL, INDEX `shared_vault_uuid_on_shared_vault_users` (`shared_vault_uuid`), INDEX `user_uuid_on_shared_vault_users` (`user_uuid`), PRIMARY KEY (`uuid`)) ENGINE=InnoDB',
    )
    await queryRunner.query(
      'CREATE TABLE `shared_vault_invites` (`uuid` varchar(36) NOT NULL, `shared_vault_uuid` varchar(36) NOT NULL, `user_uuid` varchar(36) NOT NULL, `sender_uuid` varchar(36) NOT NULL, `encrypted_message` text NOT NULL, `permission` varchar(24) NOT NULL, `created_at_timestamp` bigint NOT NULL, `updated_at_timestamp` bigint NOT NULL, INDEX `shared_vault_uuid_on_shared_vault_invites` (`shared_vault_uuid`), INDEX `user_uuid_on_shared_vault_invites` (`user_uuid`), INDEX `sender_uuid_on_shared_vault_invites` (`sender_uuid`), PRIMARY KEY (`uuid`)) ENGINE=InnoDB',
    )
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('DROP INDEX `sender_uuid_on_shared_vault_invites` ON `shared_vault_invites`')
    await queryRunner.query('DROP INDEX `user_uuid_on_shared_vault_invites` ON `shared_vault_invites`')
    await queryRunner.query('DROP INDEX `shared_vault_uuid_on_shared_vault_invites` ON `shared_vault_invites`')
    await queryRunner.query('DROP TABLE `shared_vault_invites`')
    await queryRunner.query('DROP INDEX `user_uuid_on_shared_vault_users` ON `shared_vault_users`')
    await queryRunner.query('DROP INDEX `shared_vault_uuid_on_shared_vault_users` ON `shared_vault_users`')
    await queryRunner.query('DROP TABLE `shared_vault_users`')
    await queryRunner.query('DROP INDEX `user_uuid_on_shared_vaults` ON `shared_vaults`')
    await queryRunner.query('DROP TABLE `shared_vaults`')
  }
}
