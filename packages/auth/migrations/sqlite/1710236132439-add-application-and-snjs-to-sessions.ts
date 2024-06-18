import { MigrationInterface, QueryRunner } from 'typeorm'

export class AddApplicationAndSnjsToSessions1710236132439 implements MigrationInterface {
  name = 'AddApplicationAndSnjsToSessions1710236132439'

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('ALTER TABLE `sessions` ADD `application` varchar(255) NULL')
    await queryRunner.query('ALTER TABLE `sessions` ADD `snjs` varchar(255) NULL')
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('ALTER TABLE `sessions` DROP COLUMN `snjs`')
    await queryRunner.query('ALTER TABLE `sessions` DROP COLUMN `application`')
  }
}
