import { MigrationInterface, QueryRunner } from 'typeorm'

export class addWorkspaceUserForeignKey1665580464598 implements MigrationInterface {
  name = 'addWorkspaceUserForeignKey1665580464598'

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      'ALTER TABLE `workspace_users` ADD CONSTRAINT `FK_cd407e5f2c4f3156ad2015aed41` FOREIGN KEY (`workspace_uuid`) REFERENCES `workspaces`(`uuid`) ON DELETE CASCADE ON UPDATE NO ACTION',
    )
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('ALTER TABLE `workspace_users` DROP FOREIGN KEY `FK_cd407e5f2c4f3156ad2015aed41`')
  }
}
