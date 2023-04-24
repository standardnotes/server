import { MigrationInterface, QueryRunner } from 'typeorm'

export class add2fa1651046286472 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // 2FA for BASIC_USER
    await queryRunner.query(
      'INSERT INTO `role_permissions` (permission_uuid, role_uuid) VALUES \
      ("1c6295d7-ffab-4881-bdf9-7c80df3885e9", "8802d6a3-b97c-4b25-968a-8fb21c65c3a1"), \
      ("b04a7670-934e-4ab1-b8a3-0f27ff159511", "8802d6a3-b97c-4b25-968a-8fb21c65c3a1") \
      ',
    )
  }

  public async down(): Promise<void> {
    return
  }
}
