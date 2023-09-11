import { MigrationInterface, QueryRunner } from 'typeorm'

export class makeUserUuidNullable1669735585016 implements MigrationInterface {
  name = 'makeUserUuidNullable1669735585016'

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('ALTER TABLE `revisions_revisions` CHANGE `user_uuid` `user_uuid` varchar(36) NULL')
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('ALTER TABLE `revisions_revisions` CHANGE `user_uuid` `user_uuid` varchar(36) NOT NULL')
  }
}
