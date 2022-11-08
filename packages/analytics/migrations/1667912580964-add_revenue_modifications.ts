import { MigrationInterface, QueryRunner } from 'typeorm'

export class addRevenueModifications1667912580964 implements MigrationInterface {
  name = 'addRevenueModifications1667912580964'

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      'CREATE TABLE `revenue_modifications` (`uuid` varchar(36) NOT NULL, `subscription_id` int NOT NULL, `user_email` varchar(255) NOT NULL, `user_uuid` varchar(36) NOT NULL, `event_type` varchar(255) NOT NULL, `subscription_plan` varchar(255) NOT NULL, `billing_frequency` int NOT NULL, `new_customer` tinyint NOT NULL, `previous_mrr` int NOT NULL, `new_mrr` int NOT NULL, INDEX `email` (`user_email`), INDEX `user_uuid` (`user_uuid`), PRIMARY KEY (`uuid`)) ENGINE=InnoDB',
    )
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('DROP INDEX `user_uuid` ON `revenue_modifications`')
    await queryRunner.query('DROP INDEX `email` ON `revenue_modifications`')
    await queryRunner.query('DROP TABLE `revenue_modifications`')
  }
}
