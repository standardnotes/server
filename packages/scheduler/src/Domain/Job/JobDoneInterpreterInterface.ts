import { Uuid } from '@standardnotes/common'

export interface JobDoneInterpreterInterface {
  interpret(jobUuid: Uuid): Promise<void>
}
