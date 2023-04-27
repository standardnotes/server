import { MigrationInterface, QueryRunner } from 'typeorm'

export class restrictContentType1630417724617 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('UPDATE `items` SET content_type = "Unknown" WHERE `content_type` IS NULL')
    await queryRunner.query('ALTER TABLE `items` CHANGE `content_type` `content_type` varchar(255) NOT NULL')
  }

  public async down(): Promise<void> {
    return
  }
}
