import { MigrationInterface, QueryRunner } from 'typeorm'

export class addInviteAccessLevel1665481699781 implements MigrationInterface {
  name = 'addInviteAccessLevel1665481699781'

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('ALTER TABLE `workspace_invites` ADD `access_level` varchar(64) NOT NULL')
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('ALTER TABLE `workspace_invites` DROP COLUMN `access_level`')
  }
}
