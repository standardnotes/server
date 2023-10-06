import { KeyParamsData } from '@standardnotes/responses'

export interface AuthHttpServiceInterface {
  getUserKeyParams(userUuid: string): Promise<KeyParamsData>
}
