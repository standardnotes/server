import { ItemProjection } from './ItemProjection'

export type ItemProjectionWithUser = ItemProjection & {
  user_uuid: string
}
