import { ContentDecoderInterface } from './ContentDecoderInterface'

export class ContentDecoder implements ContentDecoderInterface {
  decode(content: string): Record<string, unknown> {
    try {
      const contentBuffer = Buffer.from(content.substring(3), 'base64')
      const decodedContent = contentBuffer.toString()

      return JSON.parse(decodedContent)
    } catch (error) {
      return {}
    }
  }

  encode(content: Record<string, unknown>): string | undefined {
    const stringifiedContent = JSON.stringify(content)

    return `000${Buffer.from(stringifiedContent).toString('base64')}`
  }
}
