import { IntegrityPayload } from '@standardnotes/responses'
import { ContentType, Result, RoleNameCollection, UseCaseInterface } from '@standardnotes/domain-core'

import { CheckIntegrityDTO } from './CheckIntegrityDTO'
import { ExtendedIntegrityPayload } from '../../../Item/ExtendedIntegrityPayload'
import { ItemRepositoryResolverInterface } from '../../../Item/ItemRepositoryResolverInterface'

export class CheckIntegrity implements UseCaseInterface<IntegrityPayload[]> {
  constructor(private itemRepositoryResolver: ItemRepositoryResolverInterface) {}

  async execute(dto: CheckIntegrityDTO): Promise<Result<IntegrityPayload[]>> {
    const roleNamesOrError = RoleNameCollection.create(dto.roleNames)
    if (roleNamesOrError.isFailed()) {
      return Result.fail(roleNamesOrError.getError())
    }
    const roleNames = roleNamesOrError.getValue()

    const itemRepository = this.itemRepositoryResolver.resolve(roleNames)
    const serverItemIntegrityPayloads = await itemRepository.findItemsForComputingIntegrityPayloads(dto.userUuid)

    const serverItemIntegrityPayloadsMap = new Map<string, ExtendedIntegrityPayload>()
    for (const serverItemIntegrityPayload of serverItemIntegrityPayloads) {
      serverItemIntegrityPayloadsMap.set(serverItemIntegrityPayload.uuid.toLowerCase(), serverItemIntegrityPayload)
    }

    const clientItemIntegrityPayloadsMap = new Map<string, number>()
    const caseInsensitiveUuidsMap = new Map<string, string>()
    for (const clientItemIntegrityPayload of dto.integrityPayloads) {
      clientItemIntegrityPayloadsMap.set(
        clientItemIntegrityPayload.uuid.toLowerCase(),
        clientItemIntegrityPayload.updated_at_timestamp,
      )
      caseInsensitiveUuidsMap.set(clientItemIntegrityPayload.uuid.toLowerCase(), clientItemIntegrityPayload.uuid)
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
          uuid: caseInsensitiveUuidsMap.get(serverItemIntegrityPayloadUuid) as string,
          updated_at_timestamp: serverItemIntegrityPayloadUpdatedAtTimestamp,
        })
      }
    }

    return Result.ok(mismatches)
  }
}
