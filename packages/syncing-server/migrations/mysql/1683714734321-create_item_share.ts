import { MigrationInterface, QueryRunner, Table, TableColumn, TableIndex } from 'typeorm'

export class CreateItemShare1683714734321 implements MigrationInterface {
  name = 'createItemShare1683714734321'

  public async up(queryRunner: QueryRunner): Promise<void> {
    const table = new Table({
      name: 'item_shares',
      columns: [
        new TableColumn({
          name: 'uuid',
          type: 'varchar',
          length: '36',
          isPrimary: true,
        }),
        new TableColumn({
          name: 'user_uuid',
          type: 'varchar',
          length: '36',
        }),
        new TableColumn({
          name: 'item_uuid',
          type: 'varchar',
          length: '36',
        }),
        new TableColumn({
          name: 'share_token',
          type: 'varchar',
          length: '36',
          isNullable: true,
        }),
        new TableColumn({
          name: 'content_type',
          type: 'varchar',
          length: '255',
          isNullable: true,
        }),
        new TableColumn({
          name: 'public_key',
          type: 'text',
          isNullable: true,
        }),
        new TableColumn({
          name: 'encrypted_content_key',
          type: 'text',
          isNullable: true,
        }),
        new TableColumn({
          name: 'expired',
          type: 'tinyint',
          precision: 1,
          isNullable: true,
          default: 0,
        }),
        new TableColumn({
          name: 'created_at_timestamp',
          type: 'bigint',
        }),
        new TableColumn({
          name: 'updated_at_timestamp',
          type: 'bigint',
        }),
      ],
    })

    await queryRunner.createTable(table)

    await queryRunner.createIndex(
      'item_shares',
      new TableIndex({
        name: 'index_item_shares_on_share_token',
        columnNames: ['share_token'],
        isUnique: true,
      }),
    )

    await queryRunner.createIndex(
      'item_shares',
      new TableIndex({
        name: 'index_item_shares_on_user_uuid',
        columnNames: ['user_uuid'],
      }),
    )

    await queryRunner.createIndex(
      'item_shares',
      new TableIndex({
        name: 'index_item_shares_on_item_uuid',
        columnNames: ['item_uuid'],
      }),
    )
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('item_shares')
  }
}
