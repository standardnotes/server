import { MigrationInterface, QueryRunner } from 'typeorm'

export class emergencyAccessEmailRecipients1680608399813 implements MigrationInterface {
  name = 'emergencyAccessEmailRecipients1680608399813'

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('ALTER TABLE `emergency_access_invitations` ADD `grantee_email` varchar(255) NOT NULL')
    await queryRunner.query('ALTER TABLE `emergency_access_invitations` DROP FOREIGN KEY `grantee_uuid_fk`')
    await queryRunner.query(
      'ALTER TABLE `emergency_access_invitations` CHANGE `grantee_uuid` `grantee_uuid` varchar(36) NULL',
    )
    await queryRunner.query(
      'ALTER TABLE `emergency_access_invitations` ADD CONSTRAINT `grantee_uuid_fk` FOREIGN KEY (`grantee_uuid`) REFERENCES `users`(`uuid`) ON DELETE CASCADE ON UPDATE NO ACTION',
    )
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('ALTER TABLE `emergency_access_invitations` DROP FOREIGN KEY `grantee_uuid_fk`')
    await queryRunner.query(
      'ALTER TABLE `emergency_access_invitations` CHANGE `grantee_uuid` `grantee_uuid` varchar(36) NOT NULL',
    )
    await queryRunner.query(
      'ALTER TABLE `emergency_access_invitations` ADD CONSTRAINT `grantee_uuid_fk` FOREIGN KEY (`grantee_uuid`) REFERENCES `users`(`uuid`) ON DELETE CASCADE ON UPDATE NO ACTION',
    )
    await queryRunner.query('ALTER TABLE `emergency_access_invitations` DROP COLUMN `grantee_email`')
  }
}
