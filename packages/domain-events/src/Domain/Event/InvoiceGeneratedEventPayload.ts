export interface InvoiceGeneratedEventPayload {
  userEmail: string
  paymentDateFormatted: string
  s3BucketName: string
  s3InvoiceObjectKey: string
}
