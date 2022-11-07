import { MigrationInterface, QueryRunner } from 'typeorm'

export class removeAnalytics1667818539829 implements MigrationInterface {
  name = 'removeAnalytics1667818539829'

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('ALTER TABLE `analytics_entities` DROP FOREIGN KEY `FK_d2717c4ce2600b9f7acb6b378c5`')
    await queryRunner.query('DROP INDEX `REL_d2717c4ce2600b9f7acb6b378c` ON `analytics_entities`')
    await queryRunner.query('DROP TABLE `analytics_entities`')
  }

  public async down(): Promise<void> {
    return
  }
}
