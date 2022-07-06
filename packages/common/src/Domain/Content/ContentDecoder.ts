import { ContentDecoderInterface } from './ContentDecoderInterface'

export class ContentDecoder implements ContentDecoderInterface {
  decode(content: string, leftPaddingLength = 3): Record<string, unknown> {
    try {
      const contentToDecode = leftPaddingLength > 0 ? content.substring(leftPaddingLength) : content
      const contentBuffer = Buffer.from(contentToDecode, 'base64')
      const decodedContent = contentBuffer.toString()

      return JSON.parse(decodedContent)
    } catch (error) {
      return {}
    }
  }

  encode(content: Record<string, unknown>, leftPaddingLength = 3): string | undefined {
    const stringifiedContent = JSON.stringify(content)

    const encodedContent = Buffer.from(stringifiedContent).toString('base64')

    return encodedContent.padStart(encodedContent.length + leftPaddingLength, '0')
  }
}
