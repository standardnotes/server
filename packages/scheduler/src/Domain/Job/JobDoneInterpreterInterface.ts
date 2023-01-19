export interface JobDoneInterpreterInterface {
  interpret(jobUuid: string): Promise<void>
}
