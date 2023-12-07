import { Request, Response } from 'express'
import { ISyncingClient, SyncRequest, SyncResponse } from '@standardnotes/grpc'
import { MapperInterface } from '@standardnotes/domain-core'
import { Metadata } from '@grpc/grpc-js'

import { SyncResponseHttpRepresentation } from '../../Mapping/Sync/Http/SyncResponseHttpRepresentation'
import { Status } from '@grpc/grpc-js/build/src/constants'
import { Logger } from 'winston'

export class GRPCSyncingServerServiceProxy {
  constructor(
    private syncingClient: ISyncingClient,
    private syncRequestGRPCMapper: MapperInterface<Record<string, unknown>, SyncRequest>,
    private syncResponseGRPCMapper: MapperInterface<SyncResponse, SyncResponseHttpRepresentation>,
    private logger: Logger,
  ) {}

  async sync(
    request: Request,
    response: Response,
    payload?: Record<string, unknown> | string,
  ): Promise<{ status: number; data: unknown }> {
    return new Promise((resolve, reject) => {
      try {
        const syncRequest = this.syncRequestGRPCMapper.toProjection(payload as Record<string, unknown>)

        const metadata = new Metadata()
        metadata.set('x-user-uuid', response.locals.user.uuid)
        metadata.set('x-snjs-version', request.headers['x-snjs-version'] as string)
        metadata.set('x-read-only-access', response.locals.readonlyAccess ? 'true' : 'false')
        if (response.locals.session) {
          metadata.set('x-session-uuid', response.locals.session.uuid)
        }

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
                userId: response.locals.user.uuid,
              })
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
            userId: response.locals.user.uuid,
          })
        }

        reject(error)
      }
    })
  }
}
