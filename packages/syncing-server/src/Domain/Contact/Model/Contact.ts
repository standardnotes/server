import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm'

@Entity({ name: 'contacts' })
export class Contact {
  @PrimaryGeneratedColumn('uuid')
  declare uuid: string

  @Column({
    name: 'user_uuid',
    length: 36,
  })
  declare userUuid: string

  @Column({
    name: 'contact_uuid',
    length: 36,
  })
  declare contactUuid: string

  @Column({
    name: 'contact_public_key',
  })
  declare contactPublicKey: string

  @Column({
    name: 'contact_signing_public_key',
  })
  declare contactSigningPublicKey: string

  @Column({
    name: 'created_at_timestamp',
    type: 'bigint',
  })
  declare createdAtTimestamp: number

  @Column({
    name: 'updated_at_timestamp',
    type: 'bigint',
  })
  declare updatedAtTimestamp: number
}
