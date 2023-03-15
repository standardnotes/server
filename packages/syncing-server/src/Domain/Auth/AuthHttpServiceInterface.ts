import { KeyParamsData } from '@standardnotes/responses'

export interface AuthHttpServiceInterface {
  getUserKeyParams(dto: { email?: string; uuid?: string; authenticated: boolean }): Promise<KeyParamsData>
}
