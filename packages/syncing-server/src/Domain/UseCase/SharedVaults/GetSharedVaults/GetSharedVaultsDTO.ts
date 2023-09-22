export interface GetSharedVaultsDTO {
  userUuid: string
  includeDesignatedSurvivors?: boolean
  lastSyncTime?: number
}
