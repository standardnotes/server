import { Column, Entity, Index } from 'typeorm'

import { SQLLegacyRevision } from './SQLLegacyRevision'

@Entity({ name: 'revisions' })
export class SQLRevision extends SQLLegacyRevision {
  @Column({
    type: 'varchar',
    name: 'edited_by',
    length: 36,
    nullable: true,
  })
  declare editedBy: string | null

  @Column({
    type: 'varchar',
    name: 'shared_vault_uuid',
    length: 36,
    nullable: true,
  })
  @Index('index_revisions_on_shared_vault_uuid')
  declare sharedVaultUuid: string | null

  @Column({
    type: 'varchar',
    name: 'key_system_identifier',
    length: 36,
    nullable: true,
  })
  declare keySystemIdentifier: string | null
}
