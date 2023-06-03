import { MigrationInterface, QueryRunner, Table, TableColumn } from 'typeorm'

export class CreateUserEvents1685804699025 implements MigrationInterface {
  name = 'createUserEvents1685804699025'

  public async up(queryRunner: QueryRunner): Promise<void> {
    const table = new Table({
      name: 'user_events',
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
          isNullable: false,
        }),
        new TableColumn({
          name: 'event_type',
          type: 'varchar',
          length: '255',
          isNullable: false,
        }),
        new TableColumn({
          name: 'event_payload',
          type: 'text',
          isNullable: false,
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
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('user_events')
  }
}
