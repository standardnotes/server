export type StreamDownloadFileDTO = {
  ownerUuid: string
  resourceRemoteIdentifier: string
  startRange: number
  endRange: number
  endRangeOfFile: number
  valetToken: string
}
