import { Request, Response } from 'express'
import { ISyncingClient, SyncRequest, SyncResponse } from '@standardnotes/grpc'
import { DomainEventPublisherInterface } from '@standardnotes/domain-events'
import { MapperInterface } from '@standardnotes/domain-core'
import { Metadata } from '@grpc/grpc-js'
import { Status } from '@grpc/grpc-js/build/src/constants'
import { Logger } from 'winston'

import { SyncResponseHttpRepresentation } from '../../Mapping/Sync/Http/SyncResponseHttpRepresentation'
import { ResponseLocals } from '../../Controller/ResponseLocals'
import { DomainEventFactoryInterface } from '../../Event/DomainEventFactoryInterface'

export class GRPCSyncingServerServiceProxy {
  constructor(
    private syncingClient: ISyncingClient,
    private syncRequestGRPCMapper: MapperInterface<Record<string, unknown>, SyncRequest>,
    private syncResponseGRPCMapper: MapperInterface<SyncResponse, SyncResponseHttpRepresentation>,
    private logger: Logger,
    private domainEventFactory: DomainEventFactoryInterface,
    private domainEventPublisher?: DomainEventPublisherInterface,
  ) {}

  async sync(
    request: Request,
    response: Response,
    payload?: Record<string, unknown> | string,
  ): Promise<{ status: number; data: unknown }> {
    const locals = response.locals as ResponseLocals

    return new Promise((resolve, reject) => {
      try {
        const syncRequest = this.syncRequestGRPCMapper.toProjection(payload as Record<string, unknown>)

        const metadata = new Metadata()
        metadata.set('x-user-uuid', locals.user.uuid)
        metadata.set('x-snjs-version', request.headers['x-snjs-version'] as string)
        metadata.set('x-read-only-access', locals.readOnlyAccess ? 'true' : 'false')
        if (locals.readOnlyAccess) {
          this.logger.debug('Syncing with read-only access', {
            codeTag: 'GRPCSyncingServerServiceProxy',
            userId: locals.user.uuid,
          })
        }
        if (locals.session) {
          metadata.set('x-session-uuid', locals.session.uuid)
        }
        metadata.set('x-is-free-user', locals.isFreeUser ? 'true' : 'false')
        metadata.set('x-has-content-limit', locals.hasContentLimit ? 'true' : 'false')

        this.syncingClient.syncItems(syncRequest, metadata, (error, syncResponse) => {
          if (error) {
            const responseCode = error.metadata.get('x-sync-error-response-code').pop()
            if (responseCode) {
              return resolve({
                status: +responseCode,
                data: { error: { message: error.metadata.get('x-sync-error-message').pop() } },
              })
            }

            if (error.code === Status.INTERNAL) {
              this.logger.error(`Internal gRPC error: ${error.message}. Payload: ${JSON.stringify(payload)}`, {
                codeTag: 'GRPCSyncingServerServiceProxy',
                userId: locals.user.uuid,
              })
            }

            if (error.code === Status.RESOURCE_EXHAUSTED && this.domainEventPublisher !== undefined) {
              void this.domainEventPublisher.publish(
                this.domainEventFactory.createContentSizesFixRequestedEvent({ userUuid: locals.user.uuid }),
              )
            }

            return reject(error)
          }

          return resolve({ status: 200, data: this.syncResponseGRPCMapper.toProjection(syncResponse) })
        })
      } catch (error) {
        if (
          'code' in (error as Record<string, unknown>) &&
          (error as Record<string, unknown>).code === Status.INTERNAL
        ) {
          this.logger.error(`Internal gRPC error: ${JSON.stringify(error)}. Payload: ${JSON.stringify(payload)}`, {
            codeTag: 'GRPCSyncingServerServiceProxy.catch',
            userId: locals.user.uuid,
          })
        }

        reject(error)
      }
    })
  }
}
