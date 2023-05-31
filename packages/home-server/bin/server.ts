import { HomeServer } from '../src/Server/HomeServer'

const homeServer = new HomeServer()

Promise.resolve(homeServer.start()).catch((error) => {
  // eslint-disable-next-line no-console
  console.log(`Could not start server: ${error.message}`)
})
