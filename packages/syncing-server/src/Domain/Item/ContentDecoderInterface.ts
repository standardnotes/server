export interface ContentDecoderInterface {
  decode(content: string): Record<string, unknown>
  encode(content: Record<string, unknown>): string | undefined
}
