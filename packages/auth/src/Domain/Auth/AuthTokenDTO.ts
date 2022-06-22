export type AuthTokenDTO = {
  user: {
    uuid: string
    email: string
  }
  session: {
    uuid: string
    api_version: string
    created_at: string
    updated_at: string
    device_info: string
  }
}
