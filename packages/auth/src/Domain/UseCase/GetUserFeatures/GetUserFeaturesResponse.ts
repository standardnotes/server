import { FeatureDescription } from '@standardnotes/features'

export type GetUserFeaturesResponse =
  | {
      success: true
      features: FeatureDescription[]
      offlineRoles?: string[]
      userUuid?: string
    }
  | {
      success: false
      error: {
        message: string
      }
    }
