import { MigrationInterface, QueryRunner } from 'typeorm'

export class RenameKeyMessageIdentifier1689746180559 implements MigrationInterface {
  name = 'RenameKeyMessageIdentifier1689746180559'

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('DROP INDEX `key_system_uuid_on_key_system_associations` ON `key_system_associations`')
    await queryRunner.query(
      'ALTER TABLE `key_system_associations` CHANGE `key_system_uuid` `key_system_identifier` varchar(36) NOT NULL',
    )
    await queryRunner.query(
      'CREATE INDEX `key_system_identifier_on_key_system_associations` ON `key_system_associations` (`key_system_identifier`)',
    )
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      'DROP INDEX `key_system_identifier_on_key_system_associations` ON `key_system_associations`',
    )
    await queryRunner.query(
      'ALTER TABLE `key_system_associations` CHANGE `key_system_identifier` `key_system_uuid` varchar(36) NOT NULL',
    )
    await queryRunner.query(
      'CREATE INDEX `key_system_uuid_on_key_system_associations` ON `key_system_associations` (`key_system_uuid`)',
    )
  }
}
