// Hannah Montana harness over the existing, fully functional OpenCode wrapper.
const http = require('http')
const net = require('net')
const fs = require('fs')
const path = require('path')
const port = Number(process.env.HANNAH_PORT || 4098)
const upstream = Number(process.env.HANNAH_UPSTREAM_PORT || 4097)
const assets = { 'hannah.css': 'text/css; charset=utf-8', 'hannah.js': 'application/javascript; charset=utf-8', 'icon.svg': 'image/svg+xml' }
const server = http.createServer((req, res) => {
  const name = req.url.split('?')[0].replace(/^\/__hannah\//, '')
  if (req.url.startsWith('/__hannah/')) {
    if (!assets[name]) { res.writeHead(404); return res.end() }
    return fs.readFile(path.join(__dirname, name), (err, data) => {
      res.writeHead(err ? 404 : 200, { 'Content-Type': assets[name], 'Cache-Control': 'no-store' })
      res.end(err ? '' : data)
    })
  }
  const headers = { ...req.headers, host: `127.0.0.1:${upstream}` }
  delete headers['accept-encoding']
  const request = http.request({ hostname: '127.0.0.1', port: upstream, path: req.url, method: req.method, headers }, response => {
    if (String(response.headers['content-type']).startsWith('text/html')) {
      const chunks = []
      response.on('data', chunk => chunks.push(chunk))
      response.on('end', () => {
        const html = Buffer.concat(chunks).toString('utf8')
          .replace('<head>', '<head><script src="/__hannah/hannah.js"></script>')
          .replace('</head>', '<link rel="stylesheet" href="/__hannah/hannah.css"><link rel="icon" href="/__hannah/icon.svg"></head>')
          .replace('<title>OpenCode</title>', '<title>МЕЙБИ БЕЙБИ ХАРНЕСС ♡</title>')
        const data = Buffer.from(html)
        const outgoing = { ...response.headers, 'content-length': data.length, 'cache-control': 'no-store' }
        delete outgoing['transfer-encoding']
        res.writeHead(response.statusCode, outgoing)
        res.end(data)
      })
    } else { res.writeHead(response.statusCode, response.headers); response.pipe(res) }
    response.on('error', () => res.destroy())
  })
  request.on('error', () => { if (!res.headersSent) res.writeHead(502); res.end('Start OpenCode Web on port 4097 first. Then refresh your superstar studio.') })
  res.on('close', () => { if (!res.writableFinished) request.destroy() })
  req.pipe(request)
})
server.on('upgrade', (req, socket, head) => {
  const connection = net.connect(upstream, '127.0.0.1', () => {
    let raw = `${req.method} ${req.url} HTTP/${req.httpVersion}\r\n`
    for (let i = 0; i < req.rawHeaders.length; i += 2) raw += `${req.rawHeaders[i]}: ${req.rawHeaders[i].toLowerCase() === 'host' ? `127.0.0.1:${upstream}` : req.rawHeaders[i + 1]}\r\n`
    connection.write(raw + '\r\n')
    if (head.length) connection.write(head)
    connection.pipe(socket); socket.pipe(connection)
  })
  connection.on('error', () => socket.destroy())
  socket.on('error', () => connection.destroy())
  socket.on('close', () => connection.destroy())
})
server.listen(port, '127.0.0.1', () => console.log(`МЕЙБИ БЕЙБИ ХАРНЕСС: http://127.0.0.1:${port}`))
