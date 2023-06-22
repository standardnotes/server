import { HomeServer } from '../src/Server/HomeServer'

const homeServer = new HomeServer()

Promise.resolve(
  homeServer.start({
    dataDirectoryPath: `${__dirname}/../data`,
    logStreamCallback: (chunk: Buffer) => {
      // eslint-disable-next-line no-console
      console.log(chunk.toString())
    },
  }),
).catch((error) => {
  // eslint-disable-next-line no-console
  console.log(`Could not start server: ${error.message}`)
})
