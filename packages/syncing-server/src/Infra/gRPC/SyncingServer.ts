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
        content: itemHash.getContent(),
        content_type: itemHash.getContentType() ?? null,
        deleted: itemHash.getDeleted(),
        duplicate_of: itemHash.getDuplicateOf(),
        auth_hash: itemHash.getAuthHash(),
        enc_item_key: itemHash.getEncItemKey(),
        items_key_id: itemHash.getItemsKeyId(),
        created_at: itemHash.getCreatedAt(),
        created_at_timestamp: itemHash.getCreatedAtTimestamp(),
        updated_at: itemHash.getUpdatedAt(),
        updated_at_timestamp: itemHash.getUpdatedAtTimestamp(),
        user_uuid: call.metadata.get('userUuid').pop() as string,
        key_system_identifier: itemHash.getKeySystemIdentifier() ?? null,
        shared_vault_uuid: itemHash.getSharedVaultUuid() ?? null,
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

    const syncResult = await this.syncItemsUseCase.execute({
      userUuid: call.metadata.get('userUuid').pop() as string,
      itemHashes,
      computeIntegrityHash: call.request.getComputeIntegrity() === true,
      syncToken: call.request.getSyncToken(),
      cursorToken: call.request.getCursorToken(),
      limit: call.request.getLimit(),
      contentType: call.request.getContentType(),
      apiVersion: call.request.getApiVersion() ?? ApiVersion.v20161215,
      snjsVersion: call.metadata.get('x-snjs-version').pop() as string,
      readOnlyAccess: call.metadata.get('readonlyAccess').pop() === 'true',
      sessionUuid: call.metadata.get('sessionUuid').pop() as string,
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
      .resolveSyncResponseFactoryVersion(call.request.getApiVersion())
      .createResponse(syncResult.getValue())

    const projection = this.mapper.toProjection(syncResponse as SyncResponse20200115)

    callback(null, projection)
  }
}
