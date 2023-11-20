import * as grpc from '@grpc/grpc-js'
import { Status } from '@grpc/grpc-js/build/src/constants'
import { ISyncingServer, SyncRequest, SyncResponse } from '@standardnotes/grpc'
import { Logger } from 'winston'
import { MapperInterface } from '@standardnotes/domain-core'

import { ItemHash } from '../../Domain/Item/ItemHash'
import { SyncItems } from '../../Domain/UseCase/Syncing/SyncItems/SyncItems'
import { ApiVersion } from '../../Domain/Api/ApiVersion'
import { SyncResponseFactoryResolverInterface } from '../../Domain/Item/SyncResponse/SyncResponseFactoryResolverInterface'
import { SyncResponse20200115 } from '../../Domain/Item/SyncResponse/SyncResponse20200115'

export class SyncingServer implements ISyncingServer {
  constructor(
    private syncItemsUseCase: SyncItems,
    private syncResponseFactoryResolver: SyncResponseFactoryResolverInterface,
    private mapper: MapperInterface<SyncResponse20200115, SyncResponse>,
    private logger: Logger,
  ) {}

  async syncItems(
    call: grpc.ServerUnaryCall<SyncRequest, SyncResponse>,
    callback: grpc.sendUnaryData<SyncResponse>,
  ): Promise<void> {
    this.logger.debug('[SyncingServer] Syncing items via gRPC')

    const itemHashesRPC = call.request.getItemsList()
    const itemHashes: ItemHash[] = []
    for (const itemHash of itemHashesRPC) {
      const itemHashOrError = ItemHash.create({
        uuid: itemHash.getUuid(),
        content: itemHash.hasContent() ? itemHash.getContent() : undefined,
        content_type: itemHash.hasContentType() ? (itemHash.getContentType() as string) : null,
        deleted: itemHash.hasDeleted() ? itemHash.getDeleted() : undefined,
        duplicate_of: itemHash.hasDuplicateOf() ? itemHash.getDuplicateOf() : undefined,
        auth_hash: itemHash.hasAuthHash() ? itemHash.getAuthHash() : undefined,
        enc_item_key: itemHash.hasEncItemKey() ? itemHash.getEncItemKey() : undefined,
        items_key_id: itemHash.hasItemsKeyId() ? itemHash.getItemsKeyId() : undefined,
        created_at: itemHash.hasCreatedAt() ? itemHash.getCreatedAt() : undefined,
        created_at_timestamp: itemHash.hasCreatedAtTimestamp() ? itemHash.getCreatedAtTimestamp() : undefined,
        updated_at: itemHash.hasUpdatedAt() ? itemHash.getUpdatedAt() : undefined,
        updated_at_timestamp: itemHash.hasUpdatedAtTimestamp() ? itemHash.getUpdatedAtTimestamp() : undefined,
        user_uuid: call.metadata.get('userUuid').pop() as string,
        key_system_identifier: itemHash.hasKeySystemIdentifier() ? (itemHash.getKeySystemIdentifier() as string) : null,
        shared_vault_uuid: itemHash.hasSharedVaultUuid() ? (itemHash.getSharedVaultUuid() as string) : null,
      })

      if (itemHashOrError.isFailed()) {
        const metadata = new grpc.Metadata()
        metadata.set('x-sync-error-message', itemHashOrError.getError())
        metadata.set('x-sync-error-response-code', '400')

        return callback(
          {
            code: Status.INVALID_ARGUMENT,
            message: itemHashOrError.getError(),
            name: 'INVALID_ARGUMENT',
            metadata,
          },
          null,
        )
      }

      itemHashes.push(itemHashOrError.getValue())
    }

    let sharedVaultUuids: string[] | undefined = undefined
    const sharedVaultUuidsList = call.request.getSharedVaultUuidsList()
    if (sharedVaultUuidsList.length > 0) {
      sharedVaultUuids = sharedVaultUuidsList
    }

    const apiVersion = call.request.hasApiVersion() ? (call.request.getApiVersion() as string) : ApiVersion.v20161215

    const syncResult = await this.syncItemsUseCase.execute({
      userUuid: call.metadata.get('x-user-uuid').pop() as string,
      itemHashes,
      computeIntegrityHash: call.request.hasComputeIntegrity() ? call.request.getComputeIntegrity() === true : false,
      syncToken: call.request.hasSyncToken() ? call.request.getSyncToken() : undefined,
      cursorToken: call.request.getCursorToken() ? call.request.getCursorToken() : undefined,
      limit: call.request.hasLimit() ? call.request.getLimit() : undefined,
      contentType: call.request.hasContentType() ? call.request.getContentType() : undefined,
      apiVersion,
      snjsVersion: call.metadata.get('x-snjs-version').pop() as string,
      readOnlyAccess: call.metadata.get('x-read-only-access').pop() === 'true',
      sessionUuid: call.metadata.get('x-session-uuid').pop() as string,
      sharedVaultUuids,
    })
    if (syncResult.isFailed()) {
      const metadata = new grpc.Metadata()
      metadata.set('x-sync-error-message', syncResult.getError())
      metadata.set('x-sync-error-response-code', '400')

      return callback(
        {
          code: Status.INVALID_ARGUMENT,
          message: syncResult.getError(),
          name: 'INVALID_ARGUMENT',
          metadata,
        },
        null,
      )
    }

    const syncResponse = await this.syncResponseFactoryResolver
      .resolveSyncResponseFactoryVersion(apiVersion)
      .createResponse(syncResult.getValue())

    const projection = this.mapper.toProjection(syncResponse as SyncResponse20200115)

    callback(null, projection)
  }
}
