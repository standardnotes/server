import { Env } from '../src/Bootstrap/Env'
import { HomeServer } from '../src/Server/HomeServer'

const homeServer = new HomeServer()

const env: Env = new Env()
env.load()

try {
  Promise.resolve(
    homeServer.start({
      dataDirectoryPath: `${__dirname}/../data`,
      logStreamCallback: (chunk: Buffer) => {
        // eslint-disable-next-line no-console
        console.log(chunk.toString())
      },
      environment: env.getAll(),
    }),
  ).catch((error) => {
    // eslint-disable-next-line no-console
    console.error(`Could not start server: ${error.message}`)
  })
} catch (error) {
  // eslint-disable-next-line no-console
  console.error((error as Error).stack)
}
