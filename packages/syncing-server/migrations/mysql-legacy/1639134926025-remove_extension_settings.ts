import { MigrationInterface, QueryRunner } from 'typeorm'

export class removeExtensionSettings1639134926025 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('DROP TABLE `extension_settings`')
  }

  public async down(): Promise<void> {
    return
  }
}
