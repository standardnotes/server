export interface FileMoverInterface {
  moveFile(sourcePath: string, destinationPath: string): Promise<void>
}
