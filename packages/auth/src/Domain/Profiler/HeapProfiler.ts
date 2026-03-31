import { writeHeapSnapshot } from 'v8'
import { Logger } from 'winston'
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3'
import * as fs from 'fs'
import * as path from 'path'
import * as os from 'os'
import { Buffer } from 'buffer'
import { randomUUID } from 'crypto'

const PROFILING_INTERVAL_IN_MINUTES = 15

export class HeapProfiler {
  private intervalId: NodeJS.Timeout | null = null
  private readonly uuid: string

  constructor(
    private logger: Logger,
    private s3Client: S3Client,
    private s3BucketName: string | undefined,
  ) {
    this.uuid = randomUUID()
  }

  start(): void {
    this.logger.info('Starting heap profiler')

    void this.takeHeapSnapshot()

    this.intervalId = setInterval(
      () => {
        void this.takeHeapSnapshot()
      },
      PROFILING_INTERVAL_IN_MINUTES * 60 * 1000,
    )
  }

  stop(): void {
    if (this.intervalId) {
      clearInterval(this.intervalId)
      this.intervalId = null
      this.logger.info('Stopped heap profiler')
    }
  }

  private async takeHeapSnapshot(): Promise<void> {
    try {
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-')
      const filename = `heap-snapshot-${this.uuid}-${timestamp}.heapsnapshot`
      const tempDir = os.tmpdir()
      const filePath = path.join(tempDir, filename)

      this.logger.info(`Taking heap snapshot: ${filename}`)
      writeHeapSnapshot(filePath)

      const snapshotBuffer = fs.readFileSync(filePath)

      if (this.s3BucketName) {
        await this.uploadToS3(filename, snapshotBuffer)
        fs.unlinkSync(filePath)
        this.logger.info(`Heap snapshot ${filename} uploaded to S3 successfully`)
      }
    } catch (error) {
      this.logger.error(`Failed to take or send heap snapshot: ${(error as Error).message}`, {
        error: (error as Error).stack,
      })
    }
  }

  private async uploadToS3(filename: string, fileContent: Buffer): Promise<void> {
    const key = filename

    try {
      const command = new PutObjectCommand({
        Bucket: this.s3BucketName,
        Key: key,
        Body: fileContent,
        ContentType: 'application/octet-stream',
      })

      await this.s3Client.send(command)
      this.logger.info(`Successfully uploaded heap snapshot to S3: s3://${this.s3BucketName}/${key}`)
    } catch (error) {
      this.logger.error(`Failed to upload heap snapshot to S3: ${(error as Error).message}`, {
        filename,
        bucketName: this.s3BucketName,
        key,
        error: (error as Error).stack,
      })
      throw error
    }
  }
}
