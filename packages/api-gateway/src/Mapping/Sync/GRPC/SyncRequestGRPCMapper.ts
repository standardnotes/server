import { MapperInterface, Validator } from '@standardnotes/domain-core'
import { ItemHash, SyncRequest } from '@standardnotes/grpc'

export class SyncRequestGRPCMapper implements MapperInterface<Record<string, unknown>, SyncRequest> {
  toDomain(_projection: SyncRequest): Record<string, unknown> {
    throw new Error('Method not implemented.')
  }

  toProjection(domain: Record<string, unknown>): SyncRequest {
    const syncRequest = new SyncRequest()
    if ('items' in domain) {
      syncRequest.setItemsList((domain.items as Record<string, unknown>[]).map((item) => this.createItemHash(item)))
    }

    if ('shared_vault_uuids' in domain) {
      const sharedVaultUuidsValidation = Validator.isNotEmpty(domain.shared_vault_uuids)
      if (!sharedVaultUuidsValidation.isFailed()) {
        syncRequest.setSharedVaultUuidsList(domain.shared_vault_uuids as string[])
      }
    }

    if ('compute_integrity' in domain) {
      syncRequest.setComputeIntegrity(!!domain.compute_integrity)
    }

    if ('sync_token' in domain) {
      syncRequest.setSyncToken(domain.sync_token as string)
    }

    if ('cursor_token' in domain) {
      syncRequest.setCursorToken(domain.cursor_token as string)
    }

    if ('limit' in domain) {
      syncRequest.setLimit(domain.limit as number)
    }

    if ('content_type' in domain) {
      syncRequest.setContentType(domain.content_type as string)
    }

    if ('api' in domain) {
      syncRequest.setApiVersion(domain.api as string)
    }

    return syncRequest
  }

  private createItemHash(record: Record<string, unknown>): ItemHash {
    const itemHash = new ItemHash()
    itemHash.setUuid(record.uuid as string)
    if (record.content) {
      itemHash.setContent(record.content as string)
    }
    if (record.content_type) {
      itemHash.setContentType(record.content_type as string)
    }
    if (record.deleted !== undefined) {
      itemHash.setDeleted(!!record.deleted)
    }
    if (record.duplicate_of) {
      itemHash.setDuplicateOf(record.duplicate_of as string)
    }
    if (record.auth_hash) {
      itemHash.setAuthHash(record.auth_hash as string)
    }
    if (record.enc_item_key) {
      itemHash.setEncItemKey(record.enc_item_key as string)
    }
    if (record.items_key_id) {
      itemHash.setItemsKeyId(record.items_key_id as string)
    }
    if (record.key_system_identifier) {
      itemHash.setKeySystemIdentifier(record.key_system_identifier as string)
    }
    if (record.shared_vault_uuid) {
      itemHash.setSharedVaultUuid(record.shared_vault_uuid as string)
    }
    if (record.created_at) {
      itemHash.setCreatedAt(record.created_at as string)
    }
    if (record.created_at_timestamp) {
      itemHash.setCreatedAtTimestamp(record.created_at_timestamp as number)
    }
    if (record.updated_at) {
      itemHash.setUpdatedAt(record.updated_at as string)
    }
    if (record.updated_at_timestamp) {
      itemHash.setUpdatedAtTimestamp(record.updated_at_timestamp as number)
    }

    return itemHash
  }
}
