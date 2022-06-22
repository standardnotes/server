import { CreateValetTokenPayload } from '@standardnotes/responses'

export type CreateValetTokenDTO = CreateValetTokenPayload & {
  userUuid: string
}
