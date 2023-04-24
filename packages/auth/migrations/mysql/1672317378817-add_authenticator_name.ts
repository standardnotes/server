import { MigrationInterface, QueryRunner } from 'typeorm'

export class addAuthenticatorName1672317378817 implements MigrationInterface {
  name = 'addAuthenticatorName1672317378817'

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('ALTER TABLE `authenticators` ADD `name` varchar(255) NOT NULL')
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('ALTER TABLE `authenticators` DROP COLUMN `name`')
  }
}
