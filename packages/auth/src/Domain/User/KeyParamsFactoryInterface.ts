import { KeyParamsData } from '@standardnotes/responses'

import { User } from './User'

export interface KeyParamsFactoryInterface {
  create(user: User, authenticated: boolean): KeyParamsData
  createPseudoParams(email: string): KeyParamsData
}
