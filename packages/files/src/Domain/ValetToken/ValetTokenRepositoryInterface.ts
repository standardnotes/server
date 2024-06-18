export interface ValetTokenRepositoryInterface {
  markAsUsed(valetToken: string): Promise<void>
  isUsed(valetToken: string): Promise<boolean>
}
