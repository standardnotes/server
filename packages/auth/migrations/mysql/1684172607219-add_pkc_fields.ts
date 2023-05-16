import { MigrationInterface, QueryRunner, TableColumn } from 'typeorm'

export class AddPkcFields1684172607219 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.addColumn(
      'users',
      new TableColumn({
        name: 'public_key',
        type: 'text',
      }),
    )

    await queryRunner.addColumn(
      'users',
      new TableColumn({
        name: 'encrypted_private_key',
        type: 'text',
      }),
    )
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropColumn('users', 'public_key')
    await queryRunner.dropColumn('users', 'encrypted_private_key')
  }
}
