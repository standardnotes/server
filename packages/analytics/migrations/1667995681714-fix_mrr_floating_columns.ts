import { MigrationInterface, QueryRunner } from 'typeorm'

export class fixMrrFloatingColumns1667995681714 implements MigrationInterface {
  name = 'fixMrrFloatingColumns1667995681714'

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('ALTER TABLE `revenue_modifications` DROP COLUMN `previous_mrr`')
    await queryRunner.query('ALTER TABLE `revenue_modifications` ADD `previous_mrr` float NOT NULL')
    await queryRunner.query('ALTER TABLE `revenue_modifications` DROP COLUMN `new_mrr`')
    await queryRunner.query('ALTER TABLE `revenue_modifications` ADD `new_mrr` float NOT NULL')
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('ALTER TABLE `revenue_modifications` DROP COLUMN `new_mrr`')
    await queryRunner.query('ALTER TABLE `revenue_modifications` ADD `new_mrr` int NOT NULL')
    await queryRunner.query('ALTER TABLE `revenue_modifications` DROP COLUMN `previous_mrr`')
    await queryRunner.query('ALTER TABLE `revenue_modifications` ADD `previous_mrr` int NOT NULL')
  }
}
