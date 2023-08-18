import { MigrationInterface, QueryRunner } from 'typeorm'

export class AddTransitionRole1692348280258 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      'INSERT INTO `roles` (uuid, name, version) VALUES ("e7381dc5-3d67-49e9-b7bd-f2407b2f726e", "TRANSITION_USER", 1)',
    )
  }

  public async down(): Promise<void> {
    return
  }
}
