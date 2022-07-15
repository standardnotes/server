export interface InvoiceGeneratedEventPayload {
  userEmail: string
  invoiceNumber: string
  paymentDateFormatted: string
  s3BucketName: string
  s3InvoiceObjectKey: string
}
