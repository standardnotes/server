import { MigrationInterface, QueryRunner } from 'typeorm'

export class removeFilesSettingsFromUserSettings1649679945386 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('DELETE FROM `settings` WHERE name="FILE_UPLOAD_BYTES_LIMIT"')
    await queryRunner.query('DELETE FROM `settings` WHERE name="FILE_UPLOAD_BYTES_USED"')
  }

  public async down(): Promise<void> {
    return
  }
}
