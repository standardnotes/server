import { MigrationInterface, QueryRunner, TableColumn } from 'typeorm'

export class AddPkcFields1684172607219 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.addColumn(
      'users',
      new TableColumn({
        name: 'public_key',
        type: 'text',
        isNullable: true,
      }),
    )

    await queryRunner.addColumn(
      'users',
      new TableColumn({
        name: 'signing_public_key',
        type: 'text',
        isNullable: true,
      }),
    )
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropColumn('users', 'public_key')
    await queryRunner.dropColumn('users', 'signing_public_key')
  }
}
