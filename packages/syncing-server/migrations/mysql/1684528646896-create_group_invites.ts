import { MigrationInterface, QueryRunner, Table, TableColumn } from 'typeorm'

export class CreateGroupInvites1684528646896 implements MigrationInterface {
  name = 'createGroupInvites1684528646896'

  public async up(queryRunner: QueryRunner): Promise<void> {
    const table = new Table({
      name: 'group_invites',
      columns: [
        new TableColumn({
          name: 'uuid',
          type: 'varchar',
          length: '36',
          isPrimary: true,
        }),
        new TableColumn({
          name: 'group_uuid',
          type: 'varchar',
          length: '36',
          isNullable: false,
        }),
        new TableColumn({
          name: 'user_uuid',
          type: 'varchar',
          length: '36',
          isNullable: false,
        }),
        new TableColumn({
          name: 'inviter_uuid',
          type: 'varchar',
          length: '255',
          isNullable: false,
        }),
        new TableColumn({
          name: 'invite_type',
          type: 'varchar',
          length: '255',
          isNullable: false,
        }),
        new TableColumn({
          name: 'inviter_public_key',
          type: 'varchar',
          length: '255',
          isNullable: false,
        }),
        new TableColumn({
          name: 'encrypted_group_key',
          type: 'text',
          isNullable: false,
        }),
        new TableColumn({
          name: 'permissions',
          type: 'varchar',
          length: '36',
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
    await queryRunner.dropTable('group_invites')
  }
}
