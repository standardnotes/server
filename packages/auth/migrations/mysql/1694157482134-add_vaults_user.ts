import { MigrationInterface, QueryRunner } from 'typeorm'

export class AddVaultsUser1694157482134 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      'INSERT INTO `roles` (uuid, name, version) VALUES ("35669f45-a2d8-4172-bdab-b7b3d42044ce", "VAULTS_USER", 1)',
    )
  }

  public async down(): Promise<void> {
    return
  }
}
