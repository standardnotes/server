import * as http from 'http'
import * as httpProxy from 'http-proxy'

process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0'

const proxy = httpProxy.createProxyServer({
  secure: false,
})

proxy.on('error', (error, _req, res) => {
  console.error(error.message)
  ;(res as http.ServerResponse).writeHead(500, {
    'Content-Type': 'text/plain',
  })
  res.end('Something went wrong. And we are reporting a custom error message.')
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

    const target = (req.url as string).slice(1)
    req.url = target
    proxy.web(req, res, {
      target: target,
      ignorePath: false,
      prependPath: false,
      toProxy: true,
    })
  })
  .listen(3000)
