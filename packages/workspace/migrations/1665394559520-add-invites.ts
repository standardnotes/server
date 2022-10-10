import { MigrationInterface, QueryRunner } from 'typeorm'

export class addInvites1665394559520 implements MigrationInterface {
  name = 'addInvites1665394559520'

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      'CREATE TABLE `workspace_invites` (`uuid` varchar(36) NOT NULL, `inviter_uuid` varchar(36) NOT NULL, `invitee_email` varchar(255) NOT NULL, `status` varchar(64) NOT NULL, `accepting_user_uuid` varchar(36) NULL, `workspace_uuid` varchar(36) NOT NULL, `created_at` bigint NOT NULL, `updated_at` bigint NOT NULL, PRIMARY KEY (`uuid`)) ENGINE=InnoDB',
    )
    await queryRunner.query('ALTER TABLE `workspaces` ADD `created_at` bigint NOT NULL')
    await queryRunner.query('ALTER TABLE `workspaces` ADD `updated_at` bigint NOT NULL')
    await queryRunner.query('ALTER TABLE `workspace_users` ADD `created_at` bigint NOT NULL')
    await queryRunner.query('ALTER TABLE `workspace_users` ADD `updated_at` bigint NOT NULL')
    await queryRunner.query(
      'ALTER TABLE `workspace_invites` ADD CONSTRAINT `FK_782df40d03151dd3998acd0a6ba` FOREIGN KEY (`workspace_uuid`) REFERENCES `workspaces`(`uuid`) ON DELETE CASCADE ON UPDATE NO ACTION',
    )
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('ALTER TABLE `workspace_invites` DROP FOREIGN KEY `FK_782df40d03151dd3998acd0a6ba`')
    await queryRunner.query('ALTER TABLE `workspace_users` DROP COLUMN `updated_at`')
    await queryRunner.query('ALTER TABLE `workspace_users` DROP COLUMN `created_at`')
    await queryRunner.query('ALTER TABLE `workspaces` DROP COLUMN `updated_at`')
    await queryRunner.query('ALTER TABLE `workspaces` DROP COLUMN `created_at`')
    await queryRunner.query('DROP TABLE `workspace_invites`')
  }
}
