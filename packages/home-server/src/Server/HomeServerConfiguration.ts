export interface HomeServerConfiguration {
  dataDirectoryPath: string
  environment?: { [name: string]: string }
  logStreamCallback?: (chunk: Buffer) => void
}
