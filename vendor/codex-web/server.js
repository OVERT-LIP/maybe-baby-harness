// Codex-style skin for OpenCode Web.
// Reverse proxy: http://127.0.0.1:4097  ->  opencode server http://127.0.0.1:4096
// Injects codex.css / codex.js into the HTML page. Assets are re-read from disk
// on every request, so edits apply after a simple browser refresh.

const http = require("http")
const net = require("net")
const fs = require("fs")
const path = require("path")
const os = require("os")
const { execFile } = require("child_process")

const UPSTREAM_HOST = process.env.OC_UPSTREAM_HOST || "127.0.0.1"
const UPSTREAM_PORT = Number(process.env.OC_UPSTREAM_PORT || 4096)
const PORT = Number(process.env.OC_SKIN_PORT || 4097)
const DIR = __dirname

// codex.js is loaded synchronously at the very top of <head> (allowed by CSP: script-src 'self')
// so it can force the dark color scheme before the app's own preload script runs.
const INJECT_HEAD =
  '<link rel="stylesheet" href="/__codex/codex.css">' + '<script src="/__codex/codex.js"></script>'

const ASSETS = {
  "codex.css": "text/css; charset=utf-8",
  "codex.js": "application/javascript; charset=utf-8",
}

function serveAsset(res, name) {
  fs.readFile(path.join(DIR, name), (err, buf) => {
    if (err) {
      res.writeHead(404)
      return res.end()
    }
    res.writeHead(200, { "Content-Type": ASSETS[name], "Cache-Control": "no-store" })
    res.end(buf)
  })
}

function json(res, code, obj) {
  res.writeHead(code, { "Content-Type": "application/json; charset=utf-8", "Cache-Control": "no-store" })
  res.end(JSON.stringify(obj))
}

// POST /__codex/project  { parent, name, git }  -> creates a folder for a new project.
// Requires the custom X-Codex header, so other sites can't trigger it (no CORS preflight answer).
function createProject(req, res) {
  if (req.headers["x-codex"] !== "1") return json(res, 403, { error: "forbidden" })
  let body = ""
  req.on("data", (c) => {
    body += c
    if (body.length > 1e5) req.destroy()
  })
  req.on("end", () => {
    let p
    try {
      p = JSON.parse(body || "{}")
    } catch (e) {
      return json(res, 400, { error: "Некорректный JSON" })
    }
    const name = String(p.name || "").trim()
    const parent = String(p.parent || "").trim() || os.homedir()
    if (!name || /[<>:"/\\|?*\x00-\x1f]/.test(name) || /^\.+$/.test(name))
      return json(res, 400, { error: "Недопустимое имя папки" })
    if (!path.isAbsolute(parent)) return json(res, 400, { error: "Родительский путь должен быть абсолютным" })
    if (!fs.existsSync(parent) || !fs.statSync(parent).isDirectory())
      return json(res, 400, { error: "Родительская папка не найдена: " + parent })
    const dir = path.join(parent, name)
    if (fs.existsSync(dir)) {
      if (!fs.statSync(dir).isDirectory()) return json(res, 409, { error: "Уже существует файл с таким именем" })
      if (fs.readdirSync(dir).length && !p.allowExisting)
        return json(res, 409, { error: "Папка уже существует и не пуста", exists: true, directory: dir })
    }
    try {
      fs.mkdirSync(dir, { recursive: true })
    } catch (e) {
      return json(res, 500, { error: "Не удалось создать папку: " + e.message })
    }
    if (p.git && !fs.existsSync(path.join(dir, ".git"))) {
      return execFile("git", ["init"], { cwd: dir, windowsHide: true }, (err) => {
        json(res, 200, { directory: dir, git: !err, gitError: err ? err.message : undefined })
      })
    }
    json(res, 200, { directory: dir, git: false })
  })
}

const server = http.createServer((req, res) => {
  if (req.url.startsWith("/__codex/")) {
    const name = req.url.slice(9).split("?")[0]
    if (name === "home") return json(res, 200, { home: os.homedir(), sep: path.sep })
    if (name === "project" && req.method === "POST") return createProject(req, res)
    if (ASSETS[name]) return serveAsset(res, name)
    const bg = name.match(/^bg\/([\w.-]+\.(png|jpe?g|webp))$/i)
    if (bg) {
      return fs.readFile(path.join(DIR, "bg", bg[1]), (err, buf) => {
        if (err) {
          res.writeHead(404)
          return res.end()
        }
        const t = bg[2].toLowerCase() === "png" ? "image/png" : bg[2].toLowerCase() === "webp" ? "image/webp" : "image/jpeg"
        res.writeHead(200, { "Content-Type": t, "Cache-Control": "max-age=86400" })
        res.end(buf)
      })
    }
    res.writeHead(404)
    return res.end()
  }

  const headers = { ...req.headers, host: `${UPSTREAM_HOST}:${UPSTREAM_PORT}` }
  delete headers["accept-encoding"] // need plain HTML to inject

  const up = http.request(
    { host: UPSTREAM_HOST, port: UPSTREAM_PORT, method: req.method, path: req.url, headers },
    (upRes) => {
      const type = String(upRes.headers["content-type"] || "")
      if (type.startsWith("text/html")) {
        const chunks = []
        upRes.on("data", (c) => chunks.push(c))
        upRes.on("end", () => {
          let html = Buffer.concat(chunks).toString("utf8")
          html = /<head>/i.test(html) ? html.replace(/<head>/i, "<head>" + INJECT_HEAD) : INJECT_HEAD + html
          const out = Buffer.from(html, "utf8")
          const h = { ...upRes.headers, "content-length": out.length, "cache-control": "no-store" }
          delete h["transfer-encoding"]
          res.writeHead(upRes.statusCode, h)
          res.end(out)
        })
        return
      }
      res.writeHead(upRes.statusCode, upRes.headers)
      upRes.pipe(res) // streams SSE as well
    },
  )
  up.on("error", (e) => {
    if (!res.headersSent) res.writeHead(502, { "Content-Type": "text/plain; charset=utf-8" })
    res.end("OpenCode server (port " + UPSTREAM_PORT + ") is not reachable: " + e.message)
  })
  res.on("close", () => {
    if (!res.writableFinished) up.destroy()
  })
  req.pipe(up)
})

// WebSocket passthrough (terminal / pty)
server.on("upgrade", (req, socket, head) => {
  const up = net.connect(UPSTREAM_PORT, UPSTREAM_HOST, () => {
    let raw = `${req.method} ${req.url} HTTP/${req.httpVersion}\r\n`
    for (let i = 0; i < req.rawHeaders.length; i += 2) {
      const k = req.rawHeaders[i]
      const v = k.toLowerCase() === "host" ? `${UPSTREAM_HOST}:${UPSTREAM_PORT}` : req.rawHeaders[i + 1]
      raw += `${k}: ${v}\r\n`
    }
    up.write(raw + "\r\n")
    if (head && head.length) up.write(head)
    up.pipe(socket)
    socket.pipe(up)
  })
  up.on("error", () => socket.destroy())
  socket.on("error", () => up.destroy())
})

server.listen(PORT, "127.0.0.1", () => {
  console.log(`Codex skin: http://127.0.0.1:${PORT}  ->  opencode :${UPSTREAM_PORT}`)
})
