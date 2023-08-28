import { MigrationInterface, QueryRunner } from 'typeorm'

export class refactorCalculatingIntegrityHash1630318893601 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('ALTER TABLE `items` ADD INDEX `user_uuid_and_deleted` (`user_uuid`, `deleted`)')
  }

  public async down(): Promise<void> {
    return
  }
}
