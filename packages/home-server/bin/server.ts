import { HomeServer } from '../src/Server/HomeServer'

const homeServer = new HomeServer()

Promise.resolve(homeServer.start()).then(() => {
  const logStream = homeServer.logs()

  logStream.on('data', (chunk: Buffer) => {
    console.log(chunk.toString())
  })
}).catch((error) => {
  // eslint-disable-next-line no-console
  console.log(`Could not start server: ${error.message}`)
})
