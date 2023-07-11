import { IntegrityPayload } from '@standardnotes/responses'
import { ContentType, Result, UseCaseInterface } from '@standardnotes/domain-core'

import { ItemRepositoryInterface } from '../../../Item/ItemRepositoryInterface'
import { CheckIntegrityDTO } from './CheckIntegrityDTO'
import { ExtendedIntegrityPayload } from '../../../Item/ExtendedIntegrityPayload'

export class CheckIntegrity implements UseCaseInterface<IntegrityPayload[]> {
  constructor(private itemRepository: ItemRepositoryInterface) {}

  async execute(dto: CheckIntegrityDTO): Promise<Result<IntegrityPayload[]>> {
    const serverItemIntegrityPayloads = await this.itemRepository.findItemsForComputingIntegrityPayloads(dto.userUuid)

    const serverItemIntegrityPayloadsMap = new Map<string, ExtendedIntegrityPayload>()
    for (const serverItemIntegrityPayload of serverItemIntegrityPayloads) {
      serverItemIntegrityPayloadsMap.set(serverItemIntegrityPayload.uuid, serverItemIntegrityPayload)
    }

    const clientItemIntegrityPayloadsMap = new Map<string, number>()
    for (const clientItemIntegrityPayload of dto.integrityPayloads) {
      clientItemIntegrityPayloadsMap.set(
        clientItemIntegrityPayload.uuid,
        clientItemIntegrityPayload.updated_at_timestamp,
      )
    }

    const mismatches: IntegrityPayload[] = []

    for (const serverItemIntegrityPayloadUuid of serverItemIntegrityPayloadsMap.keys()) {
      const serverItemIntegrityPayload = serverItemIntegrityPayloadsMap.get(
        serverItemIntegrityPayloadUuid,
      ) as ExtendedIntegrityPayload

      if (!clientItemIntegrityPayloadsMap.has(serverItemIntegrityPayloadUuid)) {
        if (serverItemIntegrityPayload.content_type !== ContentType.TYPES.ItemsKey) {
          mismatches.unshift({
            uuid: serverItemIntegrityPayloadUuid,
            updated_at_timestamp: serverItemIntegrityPayload.updated_at_timestamp,
          })
        }

        continue
      }

      const serverItemIntegrityPayloadUpdatedAtTimestamp = serverItemIntegrityPayload.updated_at_timestamp
      const clientItemIntegrityPayloadUpdatedAtTimestamp = clientItemIntegrityPayloadsMap.get(
        serverItemIntegrityPayloadUuid,
      ) as number
      if (
        serverItemIntegrityPayloadUpdatedAtTimestamp !== clientItemIntegrityPayloadUpdatedAtTimestamp &&
        serverItemIntegrityPayload.content_type !== ContentType.TYPES.ItemsKey
      ) {
        mismatches.unshift({
          uuid: serverItemIntegrityPayloadUuid,
          updated_at_timestamp: serverItemIntegrityPayloadUpdatedAtTimestamp,
        })
      }
    }

    return Result.ok(mismatches)
  }
}
