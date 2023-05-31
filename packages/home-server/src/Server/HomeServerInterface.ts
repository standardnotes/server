export interface HomeServerInterface {
  start(): Promise<void>
  stop(): Promise<void>
  restart(): Promise<void>
  isRunning(): Promise<boolean>
  logs(): Promise<NodeJS.ReadableStream>
}
