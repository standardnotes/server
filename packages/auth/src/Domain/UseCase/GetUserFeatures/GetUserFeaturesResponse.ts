import { FeatureDescription } from '@standardnotes/features'

import { Role } from './../../Role/Role'

export type GetUserFeaturesResponse =
  | {
      success: true
      features: FeatureDescription[]
      offlineRoles?: Role[]
      userUuid?: string
    }
  | {
      success: false
      error: {
        message: string
      }
    }
