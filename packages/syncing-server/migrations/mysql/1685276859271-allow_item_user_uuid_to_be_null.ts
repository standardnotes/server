import { MigrationInterface, QueryRunner, TableColumn } from 'typeorm'

export class AllowItemUserUuidToBeNull1685276859271 implements MigrationInterface {
  name = 'allowItemUserUuidToBeNull1685276859271'

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.changeColumn(
      'items',
      'user_uuid',
      new TableColumn({
        name: 'user_uuid',
        type: 'varchar',
        length: '36',
        isNullable: true,
      }),
    )
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.changeColumn(
      'items',
      'user_uuid',
      new TableColumn({
        name: 'user_uuid',
        type: 'varchar',
        length: '36',
        isNullable: false,
      }),
    )
  }
}
