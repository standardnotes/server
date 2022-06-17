import { MigrationInterface, QueryRunner } from 'typeorm'

export class addJobNames1655282246342 implements MigrationInterface {
  name = 'addJobNames1655282246342'

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('ALTER TABLE `jobs` ADD `name` varchar(255) NOT NULL')
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('ALTER TABLE `jobs` DROP COLUMN `name`')
  }
}
