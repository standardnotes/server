import { Request, Response } from 'express'
import { ISyncingClient, SyncRequest, SyncResponse } from '@standardnotes/grpc'
import { MapperInterface } from '@standardnotes/domain-core'
import { Metadata } from '@grpc/grpc-js'

import { SyncResponseHttpRepresentation } from '../../Mapping/Sync/Http/SyncResponseHttpRepresentation'

export class GRPCSyncingServerServiceProxy {
  constructor(
    private syncingClient: ISyncingClient,
    private syncRequestGRPCMapper: MapperInterface<Record<string, unknown>, SyncRequest>,
    private syncResponseGRPCMapper: MapperInterface<SyncResponse, SyncResponseHttpRepresentation>,
  ) {}

  async sync(
    request: Request,
    response: Response,
    payload?: Record<string, unknown> | string,
  ): Promise<SyncResponseHttpRepresentation> {
    return new Promise((resolve, reject) => {
      try {
        const syncRequest = this.syncRequestGRPCMapper.toProjection(payload as Record<string, unknown>)

        const metadata = new Metadata()
        metadata.set('x-snjs-version', request.headers['x-snjs-version'] as string)
        metadata.set('userUuid', response.locals.user.uuid)
        metadata.set('readonlyAccess', response.locals.readonlyAccess ? 'true' : 'false')
        if (response.locals.session) {
          metadata.set('sessionUuid', response.locals.session.uuid)
        }

        this.syncingClient.syncItems(syncRequest, metadata, (error, syncResponse) => {
          if (error) {
            return reject(error)
          }

          return resolve(this.syncResponseGRPCMapper.toProjection(syncResponse))
        })
      } catch (error) {
        reject(error)
      }
    })
  }
}
