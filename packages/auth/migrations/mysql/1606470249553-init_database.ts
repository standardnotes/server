import { MigrationInterface, QueryRunner } from 'typeorm'

export class initDatabase1606470249553 implements MigrationInterface {
  name = 'initDatabase1606470249553'

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      'CREATE TABLE IF NOT EXISTS `sessions` (`uuid` varchar(36) NOT NULL, `user_uuid` varchar(255) NULL, `hashed_access_token` varchar(255) NOT NULL, `hashed_refresh_token` varchar(255) NOT NULL, `access_expiration` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP, `refresh_expiration` datetime NOT NULL, `api_version` varchar(255) NULL, `user_agent` text NULL, `created_at` datetime NOT NULL, `updated_at` datetime NOT NULL, INDEX `index_sessions_on_user_uuid` (`user_uuid`), INDEX `index_sessions_on_updated_at` (`updated_at`), PRIMARY KEY (`uuid`)) ENGINE=InnoDB',
    )
    await queryRunner.query(
      'CREATE TABLE IF NOT EXISTS `users` (`uuid` varchar(36) NOT NULL, `version` varchar(255) NULL, `email` varchar(255) NULL, `pw_nonce` varchar(255) NULL, `kp_created` varchar(255) NULL, `kp_origination` varchar(255) NULL, `pw_cost` int(11) NULL, `pw_key_size` int(11) NULL, `pw_salt` varchar(255) NULL, `pw_alg` varchar(255) NULL, `pw_func` varchar(255) NULL, `encrypted_password` varchar(255) NOT NULL, `created_at` datetime NOT NULL, `updated_at` datetime NOT NULL, `locked_until` datetime NULL, `num_failed_attempts` int(11) NULL, `updated_with_user_agent` text NULL, INDEX `index_users_on_email` (`email`), PRIMARY KEY (`uuid`)) ENGINE=InnoDB',
    )
  }

  public async down(_queryRunner: QueryRunner): Promise<void> {
    return
  }
}
