import * as http from 'http'
import * as httpProxy from 'http-proxy'
import * as path from 'path'

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

// 10 MB in bytes
const MAX_IMAGE_SIZE = 10 * 1024 * 1024

proxy.on('proxyRes', (proxyRes, _req, res) => {
  const contentLength = parseInt(proxyRes.headers['content-length'] as string)
  if (contentLength > MAX_IMAGE_SIZE) {
    res.writeHead(413, { 'Content-Type': 'text/plain' })
    res.end(`Image size exceeds the limit of ${MAX_IMAGE_SIZE} bytes.`)
    return
  }

  // validate response content type to be image
  const contentType = proxyRes.headers['content-type'] as string
  if (!contentType.startsWith('image/')) {
    res.writeHead(400, { 'Content-Type': 'text/plain' })
    res.end(`Invalid content type: ${contentType}`)
    return
  }
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

    /** Remove / or // prefixes */
    const target = (req.url as string).replace(/^\/+/, '')

    try {
      const url = new URL(target)

      if (url.protocol !== 'http:' && url.protocol !== 'https:') {
        throw new Error('Invalid URL protocol')
      }

      if (url.hostname === '') {
        throw new Error('Invalid URL hostname')
      }

      const ext = path.extname(url.pathname)
      if (!['.jpg', '.jpeg', '.png', '.gif'].includes(ext)) {
        res.writeHead(400)
        res.end('Only image files can be proxied')
        return
      }

      req.url = url.href
      proxy.web(req, res, {
        target: target,
        ignorePath: false,
        prependPath: false,
        toProxy: true,
      })
    } catch (error) {
      res.writeHead(500)
      res.end(`Invalid URL: ${target}`)
    }
  })
  .listen(3000)
