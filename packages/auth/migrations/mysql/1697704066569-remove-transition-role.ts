import { MigrationInterface, QueryRunner } from 'typeorm'

export class RemoveTransitionRole1697704066569 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('DELETE FROM `roles` WHERE name = "TRANSITION_USER"')
  }

  public async down(): Promise<void> {
    return
  }
}
