import { MigrationInterface, QueryRunner } from 'typeorm'

export class addUserDisplayName1665480537103 implements MigrationInterface {
  name = 'addUserDisplayName1665480537103'

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('ALTER TABLE `workspace_users` ADD `user_display_name` varchar(255) NULL')
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('ALTER TABLE `workspace_users` DROP COLUMN `user_display_name`')
  }
}
