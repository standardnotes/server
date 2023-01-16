export interface GetRevisionResponseBody {
  revision: {
    uuid: string
    itemUuid: string
    content: string | null
    contentType: string
    itemsKeyId: string | null
    encItemKey: string | null
    authHash: string | null
    createAt: string
    updateAt: string
  }
}
