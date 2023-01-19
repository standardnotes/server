import { FeatureDescription } from '@standardnotes/features'

import { Role } from '../Role/Role'
import { User } from '../User/User'

export interface FeatureServiceInterface {
  getFeaturesForUser(user: User): Promise<Array<FeatureDescription>>
  getFeaturesForOfflineUser(email: string): Promise<{ features: FeatureDescription[]; roles: Role[] }>
}
