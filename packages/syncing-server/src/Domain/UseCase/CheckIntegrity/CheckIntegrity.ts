import { inject, injectable } from 'inversify'
import { IntegrityPayload } from '@standardnotes/payloads'
import {
  AnalyticsActivity,
  AnalyticsStoreInterface,
  Period,
  StatisticsMeasure,
  StatisticsStoreInterface,
} from '@standardnotes/analytics'

import TYPES from '../../../Bootstrap/Types'
import { ItemRepositoryInterface } from '../../Item/ItemRepositoryInterface'
import { UseCaseInterface } from '../UseCaseInterface'
import { CheckIntegrityDTO } from './CheckIntegrityDTO'
import { CheckIntegrityResponse } from './CheckIntegrityResponse'
import { ExtendedIntegrityPayload } from '../../Item/ExtendedIntegrityPayload'
import { ContentType } from '@standardnotes/common'

@injectable()
export class CheckIntegrity implements UseCaseInterface {
  constructor(
    @inject(TYPES.ItemRepository) private itemRepository: ItemRepositoryInterface,
    @inject(TYPES.StatisticsStore) private statisticsStore: StatisticsStoreInterface,
    @inject(TYPES.AnalyticsStore) private analyticsStore: AnalyticsStoreInterface,
  ) {}

  async execute(dto: CheckIntegrityDTO): Promise<CheckIntegrityResponse> {
    const serverItemIntegrityPayloads = await this.itemRepository.findItemsForComputingIntegrityPayloads(dto.userUuid)

    let notesCount = 0
    let filesCount = 0
    const serverItemIntegrityPayloadsMap = new Map<string, ExtendedIntegrityPayload>()
    for (const serverItemIntegrityPayload of serverItemIntegrityPayloads) {
      serverItemIntegrityPayloadsMap.set(serverItemIntegrityPayload.uuid, serverItemIntegrityPayload)
      if (serverItemIntegrityPayload.content_type === ContentType.Note) {
        notesCount++
      }
      if (serverItemIntegrityPayload.content_type === ContentType.File) {
        filesCount++
      }
    }

    await this.saveNotesCountStatistics(dto.freeUser, dto.analyticsId, { notes: notesCount, files: filesCount })

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

    if (mismatches.length > 0) {
      await this.statisticsStore.incrementOutOfSyncIncidents()
    }

    return {
      mismatches,
    }
  }

  private async saveNotesCountStatistics(
    freeUser: boolean,
    analyticsId: number,
    counts: { notes: number; files: number },
  ) {
    const integrityWasCheckedToday = await this.analyticsStore.wasActivityDone(
      AnalyticsActivity.CheckingIntegrity,
      analyticsId,
      Period.Today,
    )

    if (!integrityWasCheckedToday) {
      await this.analyticsStore.markActivity([AnalyticsActivity.CheckingIntegrity], analyticsId, [Period.Today])

      await this.statisticsStore.incrementMeasure(
        freeUser ? StatisticsMeasure.NotesCountFreeUsers : StatisticsMeasure.NotesCountPaidUsers,
        counts.notes,
        [Period.Today, Period.ThisMonth],
      )

      await this.statisticsStore.incrementMeasure(StatisticsMeasure.FilesCount, counts.files, [
        Period.Today,
        Period.ThisMonth,
      ])
    }
  }
}
