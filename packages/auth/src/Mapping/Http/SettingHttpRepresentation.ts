export interface SettingHttpRepresentation {
  uuid: string
  name: string
  value: string | null
  createdAt: number
  updatedAt: number
  sensitive: boolean
}
