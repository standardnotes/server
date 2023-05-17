import { MigrationInterface, QueryRunner, TableColumn } from 'typeorm'

export class AddGroupUuidToItems1684318117584 implements MigrationInterface {
  name = 'addGroupUuidToItems1684318117584'

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.addColumn(
      'items',
      new TableColumn({
        name: 'group_uuid',
        type: 'varchar',
        length: '36',
        isNullable: true,
      }),
    )
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropColumn('items', 'group_uuid')
  }
}
