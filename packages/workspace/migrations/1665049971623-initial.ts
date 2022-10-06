import { MigrationInterface, QueryRunner } from 'typeorm'

export class initial1665049971623 implements MigrationInterface {
  name = 'initial1665049971623'

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      'CREATE TABLE `workspaces` (`uuid` varchar(36) NOT NULL, `type` varchar(64) NOT NULL, `name` varchar(255) NULL, `key_rotation_index` int NOT NULL DEFAULT 0, PRIMARY KEY (`uuid`)) ENGINE=InnoDB',
    )
    await queryRunner.query(
      'CREATE TABLE `workspace_users` (`uuid` varchar(36) NOT NULL, `access_level` varchar(64) NOT NULL, `user_uuid` varchar(36) NOT NULL, `workspace_uuid` varchar(36) NOT NULL, `encrypted_workspace_key` varchar(255) NULL, `public_key` varchar(255) NOT NULL, `private_key` varchar(255) NOT NULL, `status` varchar(64) NOT NULL, `key_rotation_index` int NOT NULL DEFAULT 0, UNIQUE INDEX `index_workspace_users_on_workspace_and_user` (`user_uuid`, `workspace_uuid`), PRIMARY KEY (`uuid`)) ENGINE=InnoDB',
    )
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('DROP INDEX `index_workspace_users_on_workspace_and_user` ON `workspace_users`')
    await queryRunner.query('DROP TABLE `workspace_users`')
    await queryRunner.query('DROP TABLE `workspaces`')
  }
}
