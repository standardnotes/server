import { FeatureDescription } from '@standardnotes/features'

export type GetUserFeaturesResponse =
  | {
      success: true
      features: FeatureDescription[]
      roles?: string[]
      userUuid?: string
    }
  | {
      success: false
      error: {
        message: string
      }
    }
