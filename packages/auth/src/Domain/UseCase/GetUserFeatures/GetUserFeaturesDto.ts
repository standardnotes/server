export type GetUserFeaturesDto =
  | {
      userUuid: string
      offline: false
    }
  | {
      email: string
      offline: true
    }
