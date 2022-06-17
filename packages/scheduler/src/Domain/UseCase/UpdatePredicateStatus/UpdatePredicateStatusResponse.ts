export type UpdatePredicateStatusResponse =
  | {
      success: true
      allPredicatesChecked: boolean
    }
  | { success: false }
