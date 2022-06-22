import { MigrationInterface, QueryRunner } from 'typeorm'

export class dropItemRevisionsJoiningTable1631530260504 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('DROP TABLE `item_revisions`')
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      'CREATE TABLE `item_revisions` (`uuid` varchar(36) NOT NULL, `item_uuid` varchar(36) NOT NULL, `revision_uuid` varchar(36) NOT NULL, INDEX `index_item_revisions_on_item_uuid` (`item_uuid`), INDEX `index_item_revisions_on_revision_uuid` (`revision_uuid`), PRIMARY KEY (`uuid`)) ENGINE=InnoDB',
    )
  }
}
