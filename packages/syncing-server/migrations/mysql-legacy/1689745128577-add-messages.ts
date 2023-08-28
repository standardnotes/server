import { MigrationInterface, QueryRunner } from 'typeorm'

export class AddMessages1689745128577 implements MigrationInterface {
  name = 'AddMessages1689745128577'

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      'CREATE TABLE `messages` (`uuid` varchar(36) NOT NULL, `recipient_uuid` varchar(36) NOT NULL, `sender_uuid` varchar(36) NOT NULL, `encrypted_message` text NOT NULL, `replaceability_identifier` varchar(255) NULL, `created_at_timestamp` bigint NOT NULL, `updated_at_timestamp` bigint NOT NULL, INDEX `recipient_uuid_on_messages` (`recipient_uuid`), INDEX `sender_uuid_on_messages` (`sender_uuid`), PRIMARY KEY (`uuid`)) ENGINE=InnoDB',
    )
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('DROP INDEX `sender_uuid_on_messages` ON `messages`')
    await queryRunner.query('DROP INDEX `recipient_uuid_on_messages` ON `messages`')
    await queryRunner.query('DROP TABLE `messages`')
  }
}
