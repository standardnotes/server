import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm'

@Entity({ name: 'authenticators' })
export class TypeORMAuthenticator {
  @PrimaryGeneratedColumn('uuid')
  declare uuid: string

  @Column({
    name: 'user_uuid',
    length: 36,
  })
  declare userUuid: string

  @Column({
    name: 'credential_id',
    type: 'varbinary',
    length: 1024,
  })
  declare credentialId: Buffer

  @Column({
    name: 'credential_public_key',
    type: 'blob',
  })
  declare credentialPublicKey: Buffer

  @Column({
    name: 'counter',
    type: 'bigint',
  })
  declare counter: number

  @Column({
    name: 'credential_device_type',
    type: 'varchar',
    length: 32,
  })
  declare credentialDeviceType: string

  @Column({
    name: 'credential_backed_up',
  })
  declare credentialBackedUp: boolean

  @Column({
    name: 'transports',
    type: 'varchar',
    length: 255,
    nullable: true,
  })
  declare transports: string | null

  @Column({
    name: 'created_at',
    type: 'datetime',
  })
  declare createdAt: Date

  @Column({
    name: 'updated_at',
    type: 'datetime',
  })
  declare updatedAt: Date
}
