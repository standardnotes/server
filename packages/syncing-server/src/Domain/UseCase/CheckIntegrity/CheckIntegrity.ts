import { IntegrityPayload } from '@standardnotes/responses'
import { ContentType } from '@standardnotes/common'

import { ItemRepositoryInterface } from '../../Item/ItemRepositoryInterface'
import { UseCaseInterface } from '../UseCaseInterface'
import { CheckIntegrityDTO } from './CheckIntegrityDTO'
import { CheckIntegrityResponse } from './CheckIntegrityResponse'
import { ExtendedIntegrityPayload } from '../../Item/ExtendedIntegrityPayload'

export class CheckIntegrity implements UseCaseInterface {
  constructor(private itemRepository: ItemRepositoryInterface) {}

  async execute(dto: CheckIntegrityDTO): Promise<CheckIntegrityResponse> {
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
        if (serverItemIntegrityPayload.content_type !== ContentType.ItemsKey) {
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
        serverItemIntegrityPayload.content_type !== ContentType.ItemsKey
      ) {
        mismatches.unshift({
          uuid: serverItemIntegrityPayloadUuid,
          updated_at_timestamp: serverItemIntegrityPayloadUpdatedAtTimestamp,
        })
      }
    }

    return {
      mismatches,
    }
  }
}
