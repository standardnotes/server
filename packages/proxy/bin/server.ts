import * as http from 'http'
import * as httpProxy from 'http-proxy'

const proxy = httpProxy.createProxyServer({
  secure: true,
})

proxy.on('error', (error, req, res) => {
  console.error(error.message)
  ;(res as http.ServerResponse).writeHead(500, {
    'Content-Type': 'text/plain',
  })
  res.end(`Proxying failed for URL: ${req.url} Error: ${error.message}`)
})

http
  .createServer((req, res) => {
    res.setHeader('Access-Control-Allow-Origin', '*')
    res.setHeader('Access-Control-Request-Method', '*')
    res.setHeader('Access-Control-Allow-Methods', 'OPTIONS, GET')
    res.setHeader('Access-Control-Allow-Headers', '*')

    if (req.method === 'OPTIONS') {
      res.writeHead(200)
      res.end()
      return
    }

    if (req.url === '/healthcheck') {
      res.writeHead(200)
      res.end()
      return
    }

    delete req.headers.authorization
    delete req.headers['x-auth-token']
    delete req.headers['x-auth-offline-token']

    const target = (req.url as string).slice(1)
    try {
      const url = new URL(target)
      req.url = url.href
      proxy.web(req, res, {
        target: target,
        ignorePath: false,
        prependPath: false,
        toProxy: true,
      })
    } catch (error) {
      res.end(`Invalid URL: ${target}`)
    }
  })
  .listen(3000)
