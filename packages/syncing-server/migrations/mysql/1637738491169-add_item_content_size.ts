import { MigrationInterface, QueryRunner } from 'typeorm'

export class addItemContentSize1637738491169 implements MigrationInterface {
  name = 'addItemContentSize1637738491169'

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('ALTER TABLE `items` ADD `content_size` INT UNSIGNED NULL')
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('ALTER TABLE `items` DROP COLUMN `content_size`')
  }
}
