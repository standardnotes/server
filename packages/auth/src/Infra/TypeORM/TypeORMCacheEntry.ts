import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm'

@Entity({ name: 'auth_cache_entries' })
export class TypeORMCacheEntry {
  @PrimaryGeneratedColumn('uuid')
  declare uuid: string

  @Column({
    name: 'key',
    type: 'text',
  })
  declare key: string

  @Column({
    name: 'value',
    type: 'text',
  })
  declare value: string

  @Column({
    name: 'expires_at',
    type: 'datetime',
    nullable: true,
  })
  declare expiresAt: Date | null
}
