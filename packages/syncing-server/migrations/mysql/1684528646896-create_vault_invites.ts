import { MigrationInterface, QueryRunner, Table, TableColumn } from 'typeorm'

export class CreateVaultInvites1684528646896 implements MigrationInterface {
  name = 'createVaultInvites1684528646896'

  public async up(queryRunner: QueryRunner): Promise<void> {
    const table = new Table({
      name: 'vault_invites',
      columns: [
        new TableColumn({
          name: 'uuid',
          type: 'varchar',
          length: '36',
          isPrimary: true,
        }),
        new TableColumn({
          name: 'vault_uuid',
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
          name: 'encrypted_vault_data',
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
    await queryRunner.dropTable('vault_invites')
  }
}
