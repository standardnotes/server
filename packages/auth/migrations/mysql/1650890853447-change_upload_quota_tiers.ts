import { MigrationInterface, QueryRunner } from 'typeorm'

export class changeUploadQuotaTiers1650890853447 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      'UPDATE `permissions` SET name = "server:files-max-storage-tier" WHERE name = "server:files-25-gb"',
    )
    await queryRunner.query(
      'UPDATE `permissions` SET name = "server:files-low-storage-tier" WHERE name = "server:files-5-gb"',
    )

    await queryRunner.query(
      'UPDATE subscription_settings SET value = 107374182400 WHERE name = "FILE_UPLOAD_BYTES_LIMIT" AND value = 26843545600',
    )
    await queryRunner.query(
      'UPDATE subscription_settings SET value = 104857600 WHERE name = "FILE_UPLOAD_BYTES_LIMIT" AND value = 5368709120',
    )
  }

  public async down(): Promise<void> {
    return
  }
}
