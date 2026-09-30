/* Codex-style skin for OpenCode Web: left thread sidebar + dark theme glue. */
;(function () {
  "use strict"

  // ---- 1. theme + new layout BEFORE the app boots -------------------------
  // codex.theme: "dark" | "light" | "system";  codex.bg: "none" | "aurora" | "mesh" | "dots"
  var THEME = localStorage.getItem("codex.theme") || "dark"
  var BG = localStorage.getItem("codex.bg") || "aurora"
  var mq = window.matchMedia("(prefers-color-scheme: dark)")
  function resolvedTheme() {
    return THEME === "system" ? (mq.matches ? "dark" : "light") : THEME
  }
  function applyTheme() {
    var t = resolvedTheme()
    var h = document.documentElement
    h.classList.toggle("cx-dark", t === "dark")
    h.classList.toggle("cx-light", t === "light")
    h.dataset.cxBg = BG
    h.style.setProperty("--cx-bg-img", "url(/__codex/bg/aurora-" + t + ".png)")
    h.style.backgroundColor = t === "dark" ? "#121212" : "#f7f7f8"
    try {
      localStorage.setItem("opencode-color-scheme", t)
    } catch (e) {}
    // keep OpenCode's own scheme in sync (it reads data-color-scheme)
    h.dataset.colorScheme = t
  }
  applyTheme()
  try {
    localStorage.setItem("opencode-theme-id", "oc-2")
    var s = JSON.parse(localStorage.getItem("settings.v3") || "null")
    if (s && s.general && s.general.newLayoutDesigns !== true) {
      s.general.newLayoutDesigns = true
      localStorage.setItem("settings.v3", JSON.stringify(s))
    }
  } catch (e) {}

  // Seed OpenCode's project list from existing sessions (localStorage is per-origin,
  // so on :4097 it starts empty). Synchronous on purpose: must happen before the app boots.
  try {
    var SK = "opencode.global.dat:server"
    var srv = JSON.parse(localStorage.getItem(SK) || "null") || { list: [], projects: {}, lastProject: {}, recentlyClosed: {} }
    srv.projects = srv.projects || {}
    srv.lastProject = srv.lastProject || {}
    var known = srv.projects.local || []
    var xhr = new XMLHttpRequest()
    xhr.open("GET", "/experimental/session?roots=true&archived=false&limit=300", false)
    xhr.send()
    if (xhr.status === 200) {
      var seen = {}
      known.forEach(function (p) {
        seen[p.worktree] = 1
      })
      JSON.parse(xhr.responseText)
        .sort(function (a, b) {
          return (b.time.updated || 0) - (a.time.updated || 0)
        })
        .forEach(function (s) {
          if (s.directory && !seen[s.directory]) {
            seen[s.directory] = 1
            known.push({ worktree: s.directory, expanded: true })
          }
        })
      srv.projects.local = known
      if (!srv.lastProject.local && known.length) srv.lastProject.local = known[0].worktree
      localStorage.setItem(SK, JSON.stringify(srv))
    }
  } catch (e) {}

  document.documentElement.classList.add("codex")
  if (localStorage.getItem("codex.sidebar.collapsed") === "1")
    document.documentElement.classList.add("codex-collapsed")

  // sidebar width (resizable, persisted)
  var SIDEBAR_MIN = 200,
    SIDEBAR_MAX = 600,
    SIDEBAR_DEF = 260
  function clampWidth(w) {
    var max = Math.min(SIDEBAR_MAX, Math.max(SIDEBAR_MIN, window.innerWidth - 360))
    return Math.round(Math.min(max, Math.max(SIDEBAR_MIN, w)))
  }
  function setSidebarWidth(w, persist) {
    w = clampWidth(w)
    document.documentElement.style.setProperty("--cx-sidebar-w", w + "px")
    if (persist) localStorage.setItem("codex.sidebar.width", String(w))
    return w
  }
  setSidebarWidth(Number(localStorage.getItem("codex.sidebar.width")) || SIDEBAR_DEF, false)

  // ---- helpers ------------------------------------------------------------
  var ICON = {
    compose:
      '<svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M9 3.5H5.5a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h9a2 2 0 0 0 2-2V11"/><path d="M14.6 2.9a1.6 1.6 0 0 1 2.3 2.3L10.5 11.6 7.5 12.5l.9-3z"/></svg>',
    search:
      '<svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"><circle cx="9" cy="9" r="5.5"/><path d="m13.2 13.2 3.3 3.3"/></svg>',
    folder:
      '<svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linejoin="round"><path d="M2.75 5.75a2 2 0 0 1 2-2h3.1l1.7 1.9h5.7a2 2 0 0 1 2 2v6.6a2 2 0 0 1-2 2H4.75a2 2 0 0 1-2-2z"/></svg>',
    chevron:
      '<svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="m7.5 5 5 5-5 5"/></svg>',
    gear:
      '<svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.4"><circle cx="10" cy="10" r="2.5"/><path d="M10 2.5v2M10 15.5v2M2.5 10h2M15.5 10h2M4.7 4.7l1.4 1.4M13.9 13.9l1.4 1.4M4.7 15.3l1.4-1.4M13.9 6.1l1.4-1.4"/></svg>',
    sidebar:
      '<svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="2.75" y="3.75" width="14.5" height="12.5" rx="2.5"/><path d="M7.75 3.75v12.5"/></svg>',
    archive:
      '<svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linejoin="round"><rect x="2.75" y="3.75" width="14.5" height="3.5" rx="1"/><path d="M4 7.25v7a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2v-7M8 10.5h4"/></svg>',
    sun:
      '<svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"><circle cx="10" cy="10" r="3.2"/><path d="M10 2.5v1.6M10 15.9v1.6M2.5 10h1.6M15.9 10h1.6M4.7 4.7l1.1 1.1M14.2 14.2l1.1 1.1M4.7 15.3l1.1-1.1M14.2 5.8l1.1-1.1"/></svg>',
    moon:
      '<svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linejoin="round"><path d="M16.5 12.3A7 7 0 0 1 7.7 3.5a7 7 0 1 0 8.8 8.8z"/></svg>',
    plus:
      '<svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"><path d="M10 4.5v11M4.5 10h11"/></svg>',
    folderOpen:
      '<svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linejoin="round"><path d="M2.75 14.5V5.75a2 2 0 0 1 2-2h3.1l1.7 1.9h5.2a2 2 0 0 1 2 2v1.1"/><path d="M2.9 15.3 5 9.6a1.5 1.5 0 0 1 1.4-1h10.2a1 1 0 0 1 .95 1.3l-1.8 5.1a1.5 1.5 0 0 1-1.4 1H3.6a.75.75 0 0 1-.7-.7z"/></svg>',
    folderPlus:
      '<svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linejoin="round" stroke-linecap="round"><path d="M2.75 5.75a2 2 0 0 1 2-2h3.1l1.7 1.9h5.7a2 2 0 0 1 2 2v6.6a2 2 0 0 1-2 2H4.75a2 2 0 0 1-2-2z"/><path d="M10 8.5v4M8 10.5h4"/></svg>',
    pin:
      '<svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linejoin="round" stroke-linecap="round"><path d="M7.5 2.75h5l-.8 4.6 2.8 2.9v1.25h-9V10.25l2.8-2.9z"/><path d="M10 11.5v5.75"/></svg>',
  }

  function el(tag, cls, html) {
    var e = document.createElement(tag)
    if (cls) e.className = cls
    if (html != null) e.innerHTML = html
    return e
  }
  function esc(t) {
    return String(t == null ? "" : t).replace(/[&<>"]/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]
    })
  }
  function basename(p) {
    if (!p) return "Без проекта"
    var parts = String(p).replace(/[\\/]+$/, "").split(/[\\/]/)
    return parts[parts.length - 1] || p
  }
  function ago(ts) {
    var d = (Date.now() - ts) / 1000
    if (d < 60) return "сейчас"
    if (d < 3600) return Math.floor(d / 60) + " мин"
    if (d < 86400) return Math.floor(d / 3600) + " ч"
    if (d < 86400 * 7) return Math.floor(d / 86400) + " д"
    if (d < 86400 * 30) return Math.floor(d / 86400 / 7) + " нед"
    return Math.floor(d / 86400 / 30) + " мес"
  }
  function serverKey() {
    var m = location.pathname.match(/^\/server\/([^/]+)\//)
    if (m) return m[1]
    return btoa(location.origin).replace(/=+$/, "")
  }
  function currentSessionId() {
    var m = location.pathname.match(/\/session\/(ses_[^/?#]+)/)
    return m ? m[1] : null
  }
  function go(url) {
    history.pushState(null, "", url)
    window.dispatchEvent(new PopStateEvent("popstate"))
    render()
  }
  function clickNative(selector) {
    var b = document.querySelector(selector)
    if (b) {
      b.click()
      return true
    }
    return false
  }
  function b64url(s) {
    var bytes = new TextEncoder().encode(s)
    var bin = ""
    for (var i = 0; i < bytes.length; i++) bin += String.fromCharCode(bytes[i])
    return btoa(bin).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "")
  }
  // make sure OpenCode knows the directory as a project (persisted list in localStorage)
  function rememberProject(dir) {
    try {
      var SK = "opencode.global.dat:server"
      var srv = JSON.parse(localStorage.getItem(SK) || "null") || { list: [], projects: {}, lastProject: {}, recentlyClosed: {} }
      srv.projects = srv.projects || {}
      srv.lastProject = srv.lastProject || {}
      var list = srv.projects.local || []
      if (!list.some(function (p) { return p.worktree === dir }))
        list.unshift({ worktree: dir, expanded: true })
      srv.projects.local = list
      srv.lastProject.local = dir
      localStorage.setItem(SK, JSON.stringify(srv))
    } catch (e) {}
  }
  // new chat bound to a specific folder: OpenCode route /<base64url(dir)>/session creates a draft there
  function newThreadIn(dir) {
    if (!dir) return newThread()
    go("/" + b64url(dir) + "/session")
  }
  function pressKey(key, opts) {
    var ev = new KeyboardEvent("keydown", Object.assign({ key: key, bubbles: true, cancelable: true }, opts || {}))
    ;(document.activeElement || document.body).dispatchEvent(ev)
  }

  // ---- state --------------------------------------------------------------
  var state = {
    sessions: [],
    status: {},
    filter: "",
    collapsed: JSON.parse(localStorage.getItem("codex.projects.collapsed") || "{}"),
    loaded: false,
  }

  function load() {
    return fetch("/experimental/session?roots=true&archived=false&limit=300", { cache: "no-store" })
      .then(function (r) {
        return r.ok ? r.json() : fetch("/session?roots=true&limit=300").then((r2) => r2.json())
      })
      .then(function (list) {
        if (!Array.isArray(list)) return
        state.sessions = list.filter(function (s) {
          return !s.parentID && !(s.time && s.time.archived)
        })
        var first = !state.loaded
        state.loaded = true
        render()
        if (first) loadStatus()
      })
      .catch(function () {})
  }
  // /session/status is scoped to one directory (instance), so query every project dir and merge
  var unread = {}
  try {
    unread = JSON.parse(localStorage.getItem("codex.unread") || "{}") || {}
  } catch (e) {}
  function saveUnread() {
    localStorage.setItem("codex.unread", JSON.stringify(unread))
  }
  function markRead(id) {
    if (id && unread[id]) {
      delete unread[id]
      saveUnread()
    }
  }
  var statusRevision = 0
  var statusRequest = 0
  // Attention cards are independent of unread markers: only the close button removes them.
  var attention = {}, attentionSeen = {}, attentionEl
  try {
    attention = JSON.parse(localStorage.getItem("codex.attention") || "{}") || {}
    attentionSeen = JSON.parse(localStorage.getItem("codex.attention.seen") || "{}") || {}
  } catch (e) {}
  function saveAttention() {
    try {
      localStorage.setItem("codex.attention", JSON.stringify(attention))
      localStorage.setItem("codex.attention.seen", JSON.stringify(attentionSeen))
    } catch (e) {}
  }
  function notifyAttention(id, kind, detail, requestID, directory) {
    if (!id || id === currentSessionId()) return
    var session = state.sessions.find(function (s) { return s.id === id })
    if (!session) return // ignore subagent sessions
    var key = requestID ? kind + ":" + requestID : null
    if (key && attentionSeen[id] === key) return
    if (key) attentionSeen[id] = key
    // A specific question/permission is more useful than the generic completion event.
    if (kind === "idle" && attention[id] && attention[id].kind !== "idle") return
    attention[id] = {
      id: id, kind: kind, detail: detail || "", title: session.title || "Новый тред",
      directory: directory || session.directory || "", time: Date.now(),
    }
    saveAttention()
    renderAttention()
  }
  function renderAttention() {
    if (!attentionEl) return
    var cards = Object.keys(attention).map(function (id) { return attention[id] })
      .sort(function (a, b) { return b.time - a.time })
    attentionEl.hidden = !cards.length
    var html = cards.map(function (n) {
      var label = n.kind === "question" ? "Агент ждёт вашего ответа" :
        n.kind === "permission" ? "Требуется ваше разрешение" : "Ответ готов — ждёт вашего сообщения"
      return '<article class="cx-attention-card" data-id="' + esc(n.id) + '">' +
        '<button class="cx-attention-close" aria-label="Закрыть уведомление" title="Закрыть">×</button>' +
        '<div class="cx-attention-label">' + label + '</div>' +
        '<strong>' + esc(n.title) + '</strong>' +
        '<small>' + esc(basename(n.directory)) + '</small>' +
        (n.detail ? '<p>' + esc(n.detail) + '</p>' : '') +
        '<button class="cx-btn cx-attention-open">Перейти к сессии</button></article>'
    }).join("")
    if (attentionEl._html !== html) {
      attentionEl._html = html
      attentionEl.innerHTML = html
    }
  }
  function buildAttention() {
    attentionEl = el("aside", "", "")
    attentionEl.id = "cx-attention"
    attentionEl.setAttribute("aria-label", "Сессии, ожидающие вашего внимания")
    attentionEl.setAttribute("aria-live", "polite")
    attentionEl.addEventListener("click", function (e) {
      var card = e.target.closest(".cx-attention-card")
      if (!card) return
      var id = card.dataset.id
      if (e.target.closest(".cx-attention-close")) {
        delete attention[id]
        saveAttention()
        renderAttention()
      } else if (e.target.closest(".cx-attention-open")) {
        go("/server/" + serverKey() + "/session/" + id)
      }
    })
    document.body.appendChild(attentionEl)
    renderAttention()
    window.addEventListener("storage", function (e) {
      if (e.key !== "codex.attention" && e.key !== "codex.attention.seen") return
      try {
        attention = JSON.parse(localStorage.getItem("codex.attention") || "{}") || {}
        attentionSeen = JSON.parse(localStorage.getItem("codex.attention.seen") || "{}") || {}
        renderAttention()
      } catch (err) {}
    })
  }
  function loadPendingAttention() {
    var dirs = []
    state.sessions.forEach(function (s) {
      if (dirs.indexOf(s.directory || "") < 0) dirs.push(s.directory || "")
    })
    dirs.forEach(function (dir) {
      ;["question", "permission"].forEach(function (kind) {
        fetch("/" + kind + "?directory=" + encodeURIComponent(dir), { cache: "no-store" })
          .then(function (r) { return r.ok ? r.json() : [] })
          .then(function (list) {
            if (!Array.isArray(list)) return
            list.forEach(function (p) {
              var detail = kind === "question" ? (p.questions || []).map(function (q) { return q.question }).join("\n") : p.permission
              notifyAttention(p.sessionID, kind, detail, p.id, dir)
            })
          }).catch(function () {})
      })
    })
  }
  function applyStatus(id, status) {
    var was = isBusy(id)
    state.status[id] = status
    if (was && !isBusy(id)) notifyAttention(id, "idle")
    if (was && !isBusy(id) && id !== currentSessionId() && !unread[id]) {
      unread[id] = Date.now()
      saveUnread()
    }
  }
  function refreshActivity() {
    render()
    if (tk.el) renderTokens()
    if (wk.el) updateWorking()
  }
  function loadStatus() {
    var revision = statusRevision
    var request = ++statusRequest
    var dirs = [""]
    state.sessions.forEach(function (s) {
      if (s.directory && dirs.indexOf(s.directory) < 0) dirs.push(s.directory)
    })
    return Promise.all(
      dirs.map(function (d) {
        return fetch("/session/status" + (d ? "?directory=" + encodeURIComponent(d) : ""), { cache: "no-store" })
          .then(function (r) {
            if (!r.ok) throw new Error("Status request failed")
            return r.json()
          })
          .catch(function () {
            return null
          })
      }),
    ).then(function (all) {
      // Never let an older HTTP snapshot overwrite a newer live event.
      if (revision !== statusRevision || request !== statusRequest || all.some(function (o) { return o === null })) return
      var st = {}
      all.forEach(function (o) {
        Object.keys(o || {}).forEach(function (k) {
          st[k] = o[k]
        })
      })
      Object.keys(state.status).concat(Object.keys(st)).forEach(function (id) {
        applyStatus(id, st[id] || { type: "idle" })
      })
      refreshActivity()
    })
  }

  // pinned threads: { sessionID: pinnedAt } — shown at the top of their project
  var pinned = {}
  try {
    pinned = JSON.parse(localStorage.getItem("codex.pinned") || "{}") || {}
  } catch (e) {}
  function togglePin(id) {
    if (pinned[id]) delete pinned[id]
    else pinned[id] = Date.now()
    localStorage.setItem("codex.pinned", JSON.stringify(pinned))
    render()
  }

  function archive(s) {
    fetch("/session/" + s.id + "?directory=" + encodeURIComponent(s.directory || ""), {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ time: { archived: Date.now() } }),
    }).then(function () {
      if (pinned[s.id]) {
        delete pinned[s.id]
        localStorage.setItem("codex.pinned", JSON.stringify(pinned))
      }
      state.sessions = state.sessions.filter(function (x) {
        return x.id !== s.id
      })
      render()
    })
  }

  // ---- sidebar DOM ----------------------------------------------------------
  var root, listEl, searchEl

  function build() {
    root = el("aside", "", "")
    root.id = "codex-sidebar"
    root.innerHTML =
      '<div class="cx-top">' +
      '  <button class="cx-iconbtn cx-collapse" title="Скрыть панель (Ctrl+B)">' + ICON.sidebar + "</button>" +
      "</div>" +
      '<nav class="cx-nav">' +
      '  <button class="cx-item cx-new">' + ICON.compose + "<span>Новый тред</span></button>" +
      '  <label class="cx-item cx-search">' + ICON.search + '<input placeholder="Поиск" spellcheck="false"></label>' +
      "</nav>" +
      '<div class="cx-section"><span>Треды</span><span class="cx-section-actions">' +
      '<button class="cx-iconbtn cx-openproj" title="Открыть существующую папку">' + ICON.folderOpen + "</button>" +
      '<button class="cx-iconbtn cx-addproj" title="Создать проект">' + ICON.folderPlus + "</button>" +
      "</span></div>" +
      '<div class="cx-list"></div>' +
      '<div class="cx-bottom">' +
      '  <button class="cx-item cx-settings">' + ICON.gear + "<span>Настройки</span></button>" +
      '  <button class="cx-iconbtn cx-themebtn" title="Оформление: тема и фон"></button>' +
      '  <div class="cx-pop">' +
      "    <h4>Тема</h4>" +
      '    <div class="cx-seg" data-k="theme">' +
      '      <button data-v="light">Светлая</button><button data-v="dark">Тёмная</button><button data-v="system">Системная</button>' +
      "    </div>" +
      "    <h4>Фон</h4>" +
      '    <div class="cx-bgs"></div>' +
      "  </div>" +
      "</div>" +
      '<div class="cx-resizer" title="Потяните, чтобы изменить ширину (двойной клик — сброс)"></div>'

    var reopen = el("button", "cx-iconbtn", ICON.sidebar)
    reopen.id = "codex-reopen"
    reopen.title = "Показать панель (Ctrl+B)"
    reopen.onclick = toggleSidebar

    listEl = root.querySelector(".cx-list")
    searchEl = root.querySelector(".cx-search input")
    searchEl.addEventListener("input", function () {
      state.filter = searchEl.value.trim().toLowerCase()
      render()
    })
    root.querySelector(".cx-collapse").onclick = toggleSidebar
    root.querySelector(".cx-new").onclick = newThread
    root.querySelector(".cx-settings").onclick = function () {
      pressKey(",", { ctrlKey: true, code: "Comma" })
    }
    // appearance popover
    var pop = root.querySelector(".cx-pop")
    var themeBtn = root.querySelector(".cx-themebtn")
    themeBtn.onclick = function (e) {
      e.stopPropagation()
      pop.classList.toggle("open")
      renderAppearance()
    }
    document.addEventListener("click", function (e) {
      if (!pop.contains(e.target) && !themeBtn.contains(e.target)) pop.classList.remove("open")
    })
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape") {
        pop.classList.remove("open")
        if (tk.el) tk.el.classList.remove("open")
      }
    })
    pop.addEventListener("click", function (e) {
      var b = e.target.closest("button[data-v]")
      if (!b) return
      var k = b.parentElement.dataset.k
      if (k === "theme") {
        THEME = b.dataset.v
        localStorage.setItem("codex.theme", THEME)
      } else if (k === "bg") {
        BG = b.dataset.v
        localStorage.setItem("codex.bg", BG)
      }
      applyTheme()
      renderAppearance()
    })
    mq.addEventListener("change", function () {
      if (THEME === "system") {
        applyTheme()
        renderAppearance()
      }
    })
    renderAppearance()

    root.querySelector(".cx-addproj").onclick = openCreateProject
    initResizer(root.querySelector(".cx-resizer"))
    root.querySelector(".cx-openproj").onclick = function () {
      go("/")
      setTimeout(function () {
        var b = [].slice.call(document.querySelectorAll("button")).find(function (x) {
          return /Добавить проект|Открыть проект|Add project|Open project/i.test(x.getAttribute("aria-label") || x.textContent || "")
        })
        if (b) b.click()
      }, 400)
    }

    document.body.appendChild(root)
    document.body.appendChild(reopen)

    document.addEventListener(
      "keydown",
      function (e) {
        if ((e.ctrlKey || e.metaKey) && !e.shiftKey && !e.altKey && (e.key === "b" || e.key === "и")) {
          e.preventDefault()
          e.stopPropagation()
          toggleSidebar()
        }
      },
      true,
    )
  }

  function toggleSidebar() {
    var c = document.documentElement.classList.toggle("codex-collapsed")
    localStorage.setItem("codex.sidebar.collapsed", c ? "1" : "0")
  }

  // ---- resizable sidebar ------------------------------------------------------
  function initResizer(handle) {
    var startX = 0,
      startW = 0
    function onMove(e) {
      setSidebarWidth(startW + (e.clientX - startX), false)
    }
    function onUp(e) {
      document.removeEventListener("pointermove", onMove)
      document.removeEventListener("pointerup", onUp)
      document.documentElement.classList.remove("cx-resizing")
      setSidebarWidth(startW + (e.clientX - startX), true)
    }
    handle.addEventListener("pointerdown", function (e) {
      if (e.button !== 0) return
      e.preventDefault()
      startX = e.clientX
      startW = root.getBoundingClientRect().width
      document.documentElement.classList.add("cx-resizing")
      document.addEventListener("pointermove", onMove)
      document.addEventListener("pointerup", onUp)
    })
    handle.addEventListener("dblclick", function () {
      setSidebarWidth(SIDEBAR_DEF, true)
    })
    window.addEventListener("resize", function () {
      setSidebarWidth(Number(localStorage.getItem("codex.sidebar.width")) || SIDEBAR_DEF, false)
    })
  }

  // ---- create project dialog --------------------------------------------------
  var extraProjects = [] // created from the UI but without threads yet
  try {
    extraProjects = JSON.parse(localStorage.getItem("codex.projects.extra") || "[]")
  } catch (e) {}

  function openCreateProject() {
    var old = document.getElementById("cx-modal")
    if (old) old.remove()
    var lastParent = localStorage.getItem("codex.projects.parent") || ""
    var m = el("div", "", "")
    m.id = "cx-modal"
    m.innerHTML =
      '<form class="cx-dlg" autocomplete="off">' +
      "<h3>Новый проект</h3>" +
      '<label><span>Название папки</span><input name="name" placeholder="my-project" required spellcheck="false"></label>' +
      '<label><span>Где создать</span><input name="parent" spellcheck="false" value="' + esc(lastParent) + '"></label>' +
      '<div class="cx-dlg-path"></div>' +
      '<label class="cx-check"><input type="checkbox" name="git" checked><span>Инициализировать git-репозиторий</span></label>' +
      '<div class="cx-dlg-err"></div>' +
      '<div class="cx-dlg-btns"><button type="button" class="cx-btn" data-act="cancel">Отмена</button>' +
      '<button type="submit" class="cx-btn cx-btn-primary">Создать</button></div>' +
      "</form>"
    document.body.appendChild(m)
    var form = m.querySelector("form")
    var nameI = form.elements.name
    var parentI = form.elements.parent
    var pathEl = m.querySelector(".cx-dlg-path")
    var errEl = m.querySelector(".cx-dlg-err")
    var sep = "\\"
    function preview() {
      var p = parentI.value.trim().replace(/[\\/]+$/, "")
      var n = nameI.value.trim()
      pathEl.textContent = p && n ? p + sep + n : ""
    }
    if (!lastParent)
      fetch("/__codex/home")
        .then(function (r) {
          return r.json()
        })
        .then(function (d) {
          sep = d.sep || sep
          if (!parentI.value) parentI.value = d.home
          preview()
        })
        .catch(function () {})
    nameI.addEventListener("input", preview)
    parentI.addEventListener("input", preview)
    function close() {
      m.remove()
    }
    m.addEventListener("mousedown", function (e) {
      if (e.target === m) close()
    })
    m.addEventListener("keydown", function (e) {
      if (e.key === "Escape") close()
      e.stopPropagation()
    })
    form.querySelector('[data-act="cancel"]').onclick = close
    form.addEventListener("submit", function (e) {
      e.preventDefault()
      errEl.textContent = ""
      var submit = form.querySelector('[type="submit"]')
      submit.disabled = true
      var payload = { name: nameI.value.trim(), parent: parentI.value.trim(), git: form.elements.git.checked }
      function send(allowExisting) {
        payload.allowExisting = !!allowExisting
        return fetch("/__codex/project", {
          method: "POST",
          headers: { "Content-Type": "application/json", "X-Codex": "1" },
          body: JSON.stringify(payload),
        }).then(function (r) {
          return r.json().then(function (d) {
            return { ok: r.ok, d: d }
          })
        })
      }
      send(false)
        .then(function (res) {
          if (!res.ok && res.d.exists && confirm(res.d.error + ":\n" + res.d.directory + "\n\nОткрыть её как проект?")) return send(true)
          return res
        })
        .then(function (res) {
          submit.disabled = false
          if (!res.ok) {
            errEl.textContent = res.d.error || "Ошибка"
            return
          }
          var dir = res.d.directory
          localStorage.setItem("codex.projects.parent", payload.parent)
          if (extraProjects.indexOf(dir) < 0) extraProjects.unshift(dir)
          localStorage.setItem("codex.projects.extra", JSON.stringify(extraProjects))
          rememberProject(dir)
          close()
          render()
          newThreadIn(dir)
        })
        .catch(function (err) {
          submit.disabled = false
          errEl.textContent = "Ошибка: " + err.message
        })
    })
    setTimeout(function () {
      nameI.focus()
    }, 0)
  }

  function newThread() {
    if (clickNative('header [aria-label="Новая сессия"]') || clickNative('header [aria-label="New session"]')) {
      setTimeout(render, 50)
      return
    }
    go("/new-session?draftId=" + (crypto.randomUUID ? crypto.randomUUID() : Date.now()))
  }

  function render() {
    if (!listEl) return
    var active = currentSessionId()
    var f = state.filter
    var groups = {}
    var order = []
    state.sessions
      .slice()
      .sort(function (a, b) {
        return (b.time.updated || 0) - (a.time.updated || 0)
      })
      .forEach(function (s) {
        if (f && String(s.title || "").toLowerCase().indexOf(f) < 0) return
        var key = s.directory || (s.project && s.project.worktree) || ""
        if (!groups[key]) {
          groups[key] = []
          order.push(key)
        }
        groups[key].push(s)
      })
    // pinned threads go first inside their project (in pin order); project order is unchanged
    order.forEach(function (key) {
      var g = groups[key]
      var pins = g
        .filter(function (s) {
          return pinned[s.id]
        })
        .sort(function (a, b) {
          return pinned[a.id] - pinned[b.id]
        })
      if (pins.length)
        groups[key] = pins.concat(
          g.filter(function (s) {
            return !pinned[s.id]
          }),
        )
    })
    // projects created from the UI that have no threads yet
    if (!f) {
      var changed = false
      extraProjects = extraProjects.filter(function (dir) {
        var has = state.sessions.some(function (s) {
          return s.directory === dir
        })
        if (has && state.loaded) changed = true
        return !(has && state.loaded)
      })
      if (changed) localStorage.setItem("codex.projects.extra", JSON.stringify(extraProjects))
      extraProjects
        .slice()
        .reverse()
        .forEach(function (dir) {
          if (!groups[dir]) {
            groups[dir] = []
            order.unshift(dir)
          }
        })
    }

    var html = ""
    if (!state.loaded) html = '<div class="cx-empty">Загрузка…</div>'
    else if (!order.length) html = '<div class="cx-empty">' + (f ? "Ничего не найдено" : "Тредов пока нет") + "</div>"

    order.forEach(function (key) {
      var closed = !!state.collapsed[key] && !f
      html +=
        '<div class="cx-group' + (closed ? " is-closed" : "") + '">' +
        '<button class="cx-proj" data-key="' + esc(key) + '" title="' + esc(key) + '">' +
        '<span class="cx-chev">' + ICON.chevron + "</span>" +
        '<span class="cx-fold">' + ICON.folder + "</span>" +
        '<span class="cx-projname">' + esc(basename(key)) + "</span>" +
        (key ? '<span class="cx-projnew" role="button" title="Новый тред в «' + esc(basename(key)) + '»">' + ICON.compose + "</span>" : "") +
        "</button>"
      if (!closed && !groups[key].length) html += '<div class="cx-thread-empty">Нет тредов</div>'
      if (!closed) {
        groups[key].forEach(function (s) {
          var busy = state.status[s.id] && state.status[s.id].type && state.status[s.id].type !== "idle"
          if (s.id === active) markRead(s.id)
          var isUnread = !busy && !!unread[s.id]
          var t = esc(s.title || "Новый тред")
          var pin = !!pinned[s.id]
          html +=
            '<div class="cx-thread' + (s.id === active ? " is-active" : "") + (busy ? " is-busy" : "") + (isUnread ? " is-unread" : "") + (pin ? " is-pinned" : "") +
            '" data-id="' + s.id + '"' + (busy ? ' title="Генерирует…"' : isUnread ? ' title="Готово — есть новый ответ"' : "") + ">" +
            (busy ? '<span class="cx-mark cx-mark-busy"></span>' : isUnread ? '<span class="cx-mark cx-mark-dot"></span>' : "") +
            '<span class="cx-title" data-text="' + t + '">' + t + "</span>" +
            (pin ? '<span class="cx-pinmark" title="Закреплён">' + ICON.pin + "</span>" : "") +
            (busy ? '<span class="cx-spin"></span>' : '<span class="cx-time">' + ago(s.time.updated || s.time.created) + "</span>") +
            '<button class="cx-pin" title="' + (pin ? "Открепить" : "Закрепить вверху проекта") + '">' + ICON.pin + "</button>" +
            '<button class="cx-arch" title="Архивировать">' + ICON.archive + "</button>" +
            "</div>"
        })
      }
      html += "</div>"
    })
    // don't touch the DOM if nothing changed (keeps hover state / avoids flicker)
    if (listEl._html !== html) {
      listEl._html = html
      listEl.innerHTML = html
    }
  }

  function onListClick(e) {
    var arch = e.target.closest(".cx-arch")
    var th = e.target.closest(".cx-thread")
    var pj = e.target.closest(".cx-proj")
    var pn = e.target.closest(".cx-projnew")
    if (pn && pj) {
      e.stopPropagation()
      newThreadIn(pj.dataset.key)
      return
    }
    var pinBtn = e.target.closest(".cx-pin")
    if (pinBtn && th) {
      e.stopPropagation()
      togglePin(th.dataset.id)
      return
    }
    if (arch && th) {
      e.stopPropagation()
      var s = state.sessions.find(function (x) {
        return x.id === th.dataset.id
      })
      if (s && confirm("Архивировать тред «" + (s.title || "") + "»?")) archive(s)
      return
    }
    if (th) {
      go("/server/" + serverKey() + "/session/" + th.dataset.id)
      return
    }
    if (pj) {
      var k = pj.dataset.key
      state.collapsed[k] = !state.collapsed[k]
      localStorage.setItem("codex.projects.collapsed", JSON.stringify(state.collapsed))
      render()
    }
  }

  // ---- empty-state heading for new thread (Codex "Let's build") ------------
  function decorateNewSession() {
    var host = document.querySelector('[data-component="session-new-design"]')
    if (!host || host.querySelector(".cx-hero")) return
    var form = host.querySelector('form[data-component="prompt-input-v2"]')
    if (!form) return
    var wrap = form.closest(".flex.flex-col.gap-8") || form.parentElement
    var hero = el("div", "cx-hero", '<div class="cx-hero-icon">' + ICON.compose + "</div><h1>Давайте построим</h1>")
    wrap.parentElement.insertBefore(hero, wrap)
  }

  // ---- appearance -----------------------------------------------------------
  var BGS = [
    { v: "none", name: "Нет" },
    { v: "aurora", name: "Аврора" },
    { v: "mesh", name: "Градиент" },
    { v: "dots", name: "Точки" },
    { v: "wave", name: "Волна" },
  ]
  function renderAppearance() {
    if (!root) return
    var t = resolvedTheme()
    root.querySelector(".cx-themebtn").innerHTML = t === "dark" ? ICON.moon : ICON.sun
    root.querySelectorAll('.cx-seg[data-k="theme"] button').forEach(function (b) {
      b.classList.toggle("on", b.dataset.v === THEME)
    })
    var previews = {
      none: t === "dark" ? "#181818" : "#ffffff",
      aurora: "url(/__codex/bg/aurora-" + t + ".png) center/cover",
      mesh:
        t === "dark"
          ? "radial-gradient(circle at 20% 25%,rgba(56,189,170,.6),transparent 60%),radial-gradient(circle at 85% 30%,rgba(99,102,241,.6),transparent 60%),radial-gradient(circle at 70% 95%,rgba(236,140,72,.5),transparent 60%),#0c0c0e"
          : "radial-gradient(circle at 20% 25%,rgba(255,190,150,.9),transparent 60%),radial-gradient(circle at 85% 30%,rgba(170,190,255,.9),transparent 60%),radial-gradient(circle at 70% 95%,rgba(200,170,255,.8),transparent 60%),#fbfaf8",
      dots:
        (t === "dark" ? "radial-gradient(rgba(255,255,255,.25) 1px,transparent 1px) 0 0/8px 8px,#121212" : "radial-gradient(rgba(0,0,0,.2) 1px,transparent 1px) 0 0/8px 8px,#f7f7f8"),
      wave:
        "url(data:image/svg+xml,%3Csvg%20xmlns=%27http://www.w3.org/2000/svg%27%20viewBox=%270%200%20100%2040%27%3E%3Cpath%20d=%27M0%2020%20Q%2012.5%206%2025%2020%20T%2050%2020%20T%2075%2020%20T%20100%2020%27%20fill=%27none%27%20stroke=%27" +
        (t === "dark" ? "%237dd3c0" : "%230f9d84") +
        "%27%20stroke-width=%272%27/%3E%3C/svg%3E)%20center/90%25%20no-repeat," +
        (t === "dark" ? "#141414" : "#ffffff"),
    }
    var box = root.querySelector(".cx-bgs")
    box.dataset.k = "bg"
    box.innerHTML = BGS.map(function (b) {
      return '<button data-v="' + b.v + '" class="' + (b.v === BG ? "on" : "") + '" style="background:' + previews[b.v] + '"><span>' + b.name + "</span></button>"
    }).join("")
  }

  // ---- interactive wave background (reacts to live token consumption) ------
  // Minimal audio-wave-like canvas: baseline amplitude/color follow how full the
  // context window is; every token increment while the model streams sends a
  // short pulse through the wave, so it visibly "speaks" while generating.
  var wv = {
    canvas: null,
    ctx: null,
    raf: 0,
    dpr: 1,
    phase: 0,
    level: 0,
    target: 0,
    pulse: 0,
    glow: 0,
    busy: false,
    lastTotal: -1,
    reduced: false,
    ripples: [],
  }

  function buildWave(bgHost) {
    wv.canvas = document.createElement("canvas")
    wv.canvas.id = "cx-wave"
    bgHost.appendChild(wv.canvas)
    wv.ctx = wv.canvas.getContext("2d")
    var rmq = window.matchMedia("(prefers-reduced-motion: reduce)")
    wv.reduced = rmq.matches
    rmq.addEventListener("change", function () {
      wv.reduced = rmq.matches
    })
    var resize = function () {
      wv.dpr = Math.min(2, window.devicePixelRatio || 1)
      wv.canvas.width = Math.max(1, Math.ceil(innerWidth * wv.dpr))
      wv.canvas.height = Math.max(1, Math.ceil(innerHeight * wv.dpr))
    }
    resize()
    window.addEventListener("resize", resize)
    waveLoop()
  }

  function waveColorStop(level) {
    var css = getComputedStyle(document.documentElement)
    var key = level >= 0.85 ? "--cx-danger" : level >= 0.65 ? "--cx-warn" : "--cx-accent"
    return (css.getPropertyValue(key) || "").trim() || "#7dd3c0"
  }

  // a short wavefront that travels outward from x0 and fades out — spawned on
  // every token delta while streaming, so the wave visibly "pings" in real time.
  function spawnRipple(x0, strength) {
    if (wv.ripples.length > 7) wv.ripples.shift()
    wv.ripples.push({ x0: x0, r: 0, amp: strength })
  }

  function waveLoop() {
    wv.raf = requestAnimationFrame(waveLoop)
    if (document.documentElement.dataset.cxBg !== "wave") return
    var ctx = wv.ctx,
      cv = wv.canvas
    var w = cv.width,
      h = cv.height
    if (!w || !h) return
    ctx.clearRect(0, 0, w, h)
    wv.level += (wv.target - wv.level) * 0.05
    wv.pulse *= 0.94
    wv.glow += ((0.35 + wv.level * 0.4 + wv.pulse * 0.5) - wv.glow) * 0.08
    var speed = wv.reduced ? 0 : wv.busy ? 0.062 : 0.02
    wv.phase += speed
    var mid = h / 2
    // bigger, livelier amplitude: generous baseline that grows with context
    // fill and gets a strong kick from live token pulses
    var base = h * 0.05
    var amp = base + wv.level * h * 0.2 + wv.pulse * h * 0.32

    // advance + cull ripples
    var ripSpeed = (wv.reduced ? 0 : 9) * wv.dpr
    wv.ripples = wv.ripples.filter(function (r) {
      r.r += ripSpeed
      r.amp *= 0.972
      return r.amp > 0.02 && r.r < w * 0.75
    })

    var color = waveColorStop(wv.level)
    var grad = ctx.createLinearGradient(0, 0, w, 0)
    grad.addColorStop(0, color + "00")
    grad.addColorStop(0.12, color)
    grad.addColorStop(0.88, color)
    grad.addColorStop(1, color + "00")

    var lines = 4
    for (var i = 0; i < lines; i++) {
      var lineAmp = amp * (1 - i * 0.22)
      var f1 = (1.7 + i * 0.45) / w
      var f2 = (3.1 + i * 0.7) / w
      var speedMul = 1 + i * 0.35
      ctx.beginPath()
      for (var x = 0; x <= w; x += 3 * wv.dpr) {
        var envelope = Math.sin((x / w) * Math.PI) // taper toward edges
        var y =
          mid +
          (Math.sin(x * f1 * Math.PI * 2 + wv.phase * speedMul) * 0.7 +
            Math.sin(x * f2 * Math.PI * 2 - wv.phase * speedMul * 0.6) * 0.3) *
            lineAmp *
            envelope
        // superimpose traveling ripples from token pulses
        for (var r = 0; r < wv.ripples.length; r++) {
          var rp = wv.ripples[r]
          var dist = Math.abs(x - rp.x0)
          var d = dist - rp.r
          var ring = Math.exp(-(d * d) / (900 * wv.dpr * wv.dpr))
          y += Math.sin(dist * 0.05 - wv.phase * 3) * ring * rp.amp * h * 0.14 * envelope
        }
        if (x === 0) ctx.moveTo(x, y)
        else ctx.lineTo(x, y)
      }
      ctx.strokeStyle = grad
      ctx.lineJoin = "round"
      ctx.lineCap = "round"
      if (i === 0) {
        ctx.save()
        ctx.shadowColor = color
        ctx.shadowBlur = (10 + wv.glow * 22) * wv.dpr
        ctx.globalAlpha = 1
        ctx.lineWidth = 2.6 * wv.dpr
        ctx.stroke()
        ctx.restore()
      } else {
        ctx.globalAlpha = 0.55 - i * 0.12
        ctx.lineWidth = (1.8 - i * 0.25) * wv.dpr
        ctx.stroke()
      }
    }
    ctx.globalAlpha = 1
  }

  // feed live token stats into the wave: baseline = context fill %, ripples
  // travel outward from a random point on every token delta while streaming.
  function feedWave(pct, total, running) {
    wv.target = Math.max(0, Math.min(1, pct / 100))
    wv.busy = running
    if (wv.lastTotal >= 0 && total > wv.lastTotal) {
      var delta = total - wv.lastTotal
      var strength = Math.min(1, delta / 350)
      wv.pulse = Math.min(1, wv.pulse + strength)
      if (wv.canvas) spawnRipple(Math.random() * wv.canvas.width, Math.max(0.35, strength))
    }
    wv.lastTotal = total
  }

  // ---- tokens widget --------------------------------------------------------
  var tk = { el: null, sid: null, msgs: [], limits: {}, busy: false, timer: null }

  function fmt(n) {
    n = n || 0
    if (n >= 1e6) return (n / 1e6).toFixed(n >= 1e7 ? 1 : 2).replace(/\.?0+$/, "") + "M"
    if (n >= 1e3) return (n / 1e3).toFixed(n >= 1e5 ? 0 : 1).replace(/\.0$/, "") + "k"
    return String(n)
  }
  function fmtFull(n) {
    return (n || 0).toLocaleString("ru-RU")
  }

  function loadLimits() {
    // context limits from config (opencode API doesn't always expose them)
    return fetch("/config", { cache: "no-store" })
      .then(function (r) {
        return r.json()
      })
      .then(function (cfg) {
        var p = (cfg && cfg.provider) || {}
        Object.keys(p).forEach(function (pid) {
          var models = p[pid].models || {}
          Object.keys(models).forEach(function (mid) {
            var l = models[mid].limit
            if (l && l.context) tk.limits[pid + "/" + mid] = l.context
          })
        })
      })
      .catch(function () {})
      .then(function () {
        return fetch("/config/providers", { cache: "no-store" })
          .then(function (r) {
            return r.json()
          })
          .then(function (d) {
            ;(d.providers || []).forEach(function (p) {
              Object.keys(p.models || {}).forEach(function (mid) {
                var l = p.models[mid].limit
                var k = p.id + "/" + mid
                if (l && l.context && !tk.limits[k]) tk.limits[k] = l.context
              })
            })
          })
          .catch(function () {})
      })
  }

  function buildTokens() {
    tk.el = el("div", "", "")
    tk.el.id = "cx-tokens"
    tk.el.hidden = true
    tk.el.innerHTML = '<button class="cx-tk-pill" title="Потребление токенов"></button><div class="cx-tk-panel"></div>'
    tk.el.querySelector(".cx-tk-pill").onclick = function (e) {
      e.stopPropagation()
      tk.el.classList.toggle("open")
    }
    document.addEventListener("click", function (e) {
      if (!tk.el.contains(e.target)) tk.el.classList.remove("open")
    })
    document.body.appendChild(tk.el)
    // expose the pill width so the session title row can reserve space for it
    var syncW = function () {
      var w = tk.el.hidden ? 0 : Math.ceil(tk.el.getBoundingClientRect().width) + 8
      document.documentElement.style.setProperty("--cx-tk-w", w + "px")
    }
    if (window.ResizeObserver) new ResizeObserver(syncW).observe(tk.el)
    new MutationObserver(syncW).observe(tk.el, { attributes: true, attributeFilter: ["hidden"] })
    syncW()
  }

  function loadTokens() {
    var sid = currentSessionId()
    if (sid !== tk.sid) {
      tk.sid = sid
      tk.msgs = []
      tk.running = false
      tk.startedAt = 0
    }
    if (!sid) {
      tk.el.hidden = true
      return
    }
    fetch("/session/" + sid + "/message", { cache: "no-store" })
      .then(function (r) {
        return r.ok ? r.json() : []
      })
      .then(function (list) {
        if (sid !== tk.sid) return
        tk.msgs = (list || [])
          .map(function (m) {
            return m.info
          })
          .filter(function (i) {
            return i && i.role === "assistant" && i.tokens
          })
        renderTokens()
      })
      .catch(function () {})
  }

  function renderTokens() {
    var msgs = tk.msgs
    if (!tk.sid || !msgs.length) {
      tk.el.hidden = !tk.sid
      if (tk.sid) {
        tk.el.hidden = false
        tk.el.querySelector(".cx-tk-pill").innerHTML = '<span>0 токенов</span>'
        tk.el.querySelector(".cx-tk-panel").innerHTML = '<div class="cx-tk-foot">В этом треде ещё нет ответов модели.</div>'
      }
      feedWave(0, 0, false)
      wv.lastTotal = 0
      return
    }
    tk.el.hidden = false
    var sum = { input: 0, output: 0, reasoning: 0, cr: 0, cw: 0, cost: 0 }
    msgs.forEach(function (i) {
      var t = i.tokens
      sum.input += t.input || 0
      sum.output += t.output || 0
      sum.reasoning += t.reasoning || 0
      sum.cr += (t.cache && t.cache.read) || 0
      sum.cw += (t.cache && t.cache.write) || 0
      sum.cost += i.cost || 0
    })
    var total = sum.input + sum.output + sum.reasoning + sum.cr + sum.cw

    // current context = the last completed step's prompt size
    var last = null
    for (var k = msgs.length - 1; k >= 0; k--) {
      var tt = msgs[k].tokens
      if ((tt.input || 0) + (tt.cache && tt.cache.read || 0) > 0) {
        last = msgs[k]
        break
      }
    }
    var lt = last ? last.tokens : { input: 0, output: 0, cache: {} }
    var ctx = (lt.input || 0) + ((lt.cache && lt.cache.read) || 0) + ((lt.cache && lt.cache.write) || 0) + (lt.output || 0) + (lt.reasoning || 0)
    var model = last ? last.providerID + "/" + last.modelID : ""
    var limit = tk.limits[model] || 0
    var pct = limit ? Math.min(100, (ctx / limit) * 100) : 0
    var lvl = pct >= 85 ? "danger" : pct >= 65 ? "warn" : ""
    var cur = null
    msgs.forEach(function (i) {
      if (!i.time || !i.time.completed) cur = i
    })
    var running = isBusy(tk.sid)
    tk.running = running
    feedWave(pct, total, running)
    tk.startedAt = 0
    if (cur) {
      // turn start = earliest assistant message answering the same user message
      msgs.forEach(function (i) {
        if (i.parentID === cur.parentID && i.time && i.time.created && (!tk.startedAt || i.time.created < tk.startedAt))
          tk.startedAt = i.time.created
      })
    }

    var C = 2 * Math.PI * 6.5
    var ring = limit
      ? '<svg class="cx-ring ' + lvl + '" viewBox="0 0 16 16"><circle class="bg" cx="8" cy="8" r="6.5"/><circle class="fg" cx="8" cy="8" r="6.5" stroke-dasharray="' + ((pct / 100) * C).toFixed(1) + " " + C.toFixed(1) + '"/></svg>'
      : ""
    tk.el.querySelector(".cx-tk-pill").innerHTML =
      (running ? '<span class="cx-live"></span>' : ring) +
      "<span>" + (limit ? fmt(ctx) + " / " + fmt(limit) : fmt(ctx) + " ctx") + "</span>" +
      '<span style="opacity:.55">·</span><span>Σ ' + fmt(total) + "</span>"

    // spark: tokens per step (last 40)
    var steps = msgs.slice(-40).map(function (i) {
      var t = i.tokens
      return (t.input || 0) + (t.output || 0) + (t.reasoning || 0) + ((t.cache && t.cache.write) || 0)
    })
    var mx = Math.max.apply(null, steps.concat([1]))
    var spark = steps
      .map(function (v) {
        return '<i style="height:' + Math.max(6, (v / mx) * 100) + '%" title="' + fmtFull(v) + '"></i>'
      })
      .join("")

    var cacheHit = sum.input + sum.cr ? Math.round((sum.cr / (sum.input + sum.cr)) * 100) : 0

    tk.el.querySelector(".cx-tk-panel").innerHTML =
      '<div class="cx-tk-h"><b>Контекст</b><small>' + esc(last ? last.modelID : "") + "</small></div>" +
      (limit
        ? '<div class="cx-bar ' + lvl + '"><i style="width:' + pct.toFixed(1) + '%"></i></div>' +
          '<div class="cx-tk-sub"><span>' + fmtFull(ctx) + " из " + fmtFull(limit) + "</span><span>" + pct.toFixed(0) + "%</span></div>"
        : '<div class="cx-tk-sub"><span>' + fmtFull(ctx) + ' токенов в окне</span><span>лимит не задан</span></div>') +
      '<div class="cx-tk-h"><b>Всего за тред</b><small>' + msgs.length + " шаг(ов)</small></div>" +
      '<div class="cx-tk-grid">' +
      "<span>Вход</span><b>" + fmtFull(sum.input) + "</b>" +
      "<span>Кэш (чтение)</span><b>" + fmtFull(sum.cr) + "</b>" +
      (sum.cw ? "<span>Кэш (запись)</span><b>" + fmtFull(sum.cw) + "</b>" : "") +
      "<span>Выход</span><b>" + fmtFull(sum.output) + "</b>" +
      "<span>Рассуждения</span><b>" + fmtFull(sum.reasoning) + "</b>" +
      '<span class="tot">Итого</span><b class="tot">' + fmtFull(total) + "</b>" +
      (sum.cost ? '<span>Стоимость</span><b>$' + sum.cost.toFixed(4) + "</b>" : "") +
      "</div>" +
      '<div class="cx-spark" title="Токены по шагам (без кэша)">' + spark + "</div>" +
      '<div class="cx-tk-foot">Кэш-попадания: ' + cacheHit + "% · обновляется в реальном времени</div>"
  }

  // ---- Codex-style "working" indicator ------------------------------------
  // Overlay (not inserted into Solid-managed DOM): sits right under the last turn,
  // or pinned above the composer when the bottom of the chat is scrolled away.
  var wk = { el: null, sid: null, since: 0, raf: 0, on: false }

  function buildWorking() {
    wk.el = el(
      "div",
      "",
      '<span class="cx-wk-orb"><i></i><i></i><i></i></span>' +
        '<span class="cx-wk-label" data-text="Думаю">Думаю</span>' +
        '<span class="cx-wk-topic"></span>' +
        '<span class="cx-wk-meta"></span>',
    )
    wk.el.id = "cx-working"
    wk.el.hidden = true
    document.body.appendChild(wk.el)
  }

  function isBusy(sid) {
    var st = sid && state.status[sid]
    return !!(st && st.type && st.type !== "idle")
  }

  function fmtElapsed(ms) {
    var s = Math.max(0, Math.floor(ms / 1000))
    if (s < 60) return s + " с"
    var m = Math.floor(s / 60)
    return m + " мин " + (s % 60) + " с"
  }

  function updateWorking() {
    var sid = currentSessionId()
    var busy = isBusy(sid)
    if (sid !== wk.sid) {
      wk.sid = sid
      wk.since = 0
    }
    if (!busy) {
      if (wk.on) {
        wk.on = false
        wk.el.hidden = true
        document.documentElement.classList.remove("cx-busy")
      }
      wk.since = 0
      return
    }
    if (!wk.since) wk.since = (sid === tk.sid && tk.startedAt) || Date.now()
    if (!wk.on) {
      wk.on = true
      wk.el.hidden = false
      document.documentElement.classList.add("cx-busy")
    }
    placeWorking()
  }

  function placeWorking() {
    if (!wk.on) return
    var form = document.querySelector('form[data-component="prompt-input-v2"]')
    var turns = document.querySelectorAll('[data-component="session-turn"]')
    var last = turns[turns.length - 1]
    if (!form) {
      wk.el.style.visibility = "hidden"
      return
    }
    var fr = form.getBoundingClientRect()
    var dock = form.closest('[data-component="session-prompt-dock"]') || form
    var limit = Math.min(fr.top, dock.getBoundingClientRect().top + 0) - 34
    var top = limit
    var left = fr.left + 14
    if (last) {
      // bottom of the real content in the last turn (ignore the native thinking row we hide)
      var box = last.querySelector('[data-slot="session-turn-message-container"]') || last
      var kids = box.children
      var bottom = 0
      var lr = box.getBoundingClientRect()
      for (var i = 0; i < kids.length; i++) {
        if (kids[i].getAttribute("data-slot") === "session-turn-thinking") continue
        var r = kids[i].getBoundingClientRect()
        if (r.height) bottom = Math.max(bottom, r.bottom)
      }
      if (!bottom) bottom = lr.top
      top = Math.min(bottom + 10, limit)
      left = lr.left + 20
    }
    wk.el.style.visibility = ""
    wk.el.style.transform = "translate(" + Math.round(left) + "px," + Math.round(top) + "px)"
    wk.el.classList.toggle("is-pinned", top >= limit)

    var head = document.querySelector('[data-slot="session-turn-thinking"] .session-turn-thinking-heading')
    var topic = head ? (head.getAttribute("aria-label") || head.textContent || "").replace(/\s+/g, " ").trim() : ""
    var label = topic ? "Думаю" : "Работаю"
    var lEl = wk.el.querySelector(".cx-wk-label")
    if (lEl.dataset.text !== label) {
      lEl.dataset.text = label
      lEl.textContent = label
    }
    var tEl = wk.el.querySelector(".cx-wk-topic")
    if (tEl.textContent !== topic) tEl.textContent = topic
    var meta = "(" + fmtElapsed(Date.now() - wk.since) + " · Esc — прервать)"
    var mEl = wk.el.querySelector(".cx-wk-meta")
    if (mEl.textContent !== meta) mEl.textContent = meta
  }

  function workingLoop() {
    updateWorking()
    wk.raf = requestAnimationFrame(workingLoop)
  }

  function scheduleTokens() {
    clearTimeout(tk.timer)
    tk.timer = setTimeout(loadTokens, 250)
  }

  // ---- boot -----------------------------------------------------------------
  function boot() {
    build()
    buildAttention()
    buildTokens()
    buildWorking()
    workingLoop()
    var bg = el("div", "", "")
    bg.id = "cx-bg"
    document.body.insertBefore(bg, document.body.firstChild)
    buildWave(bg)
    loadLimits().then(loadTokens)
    setInterval(function () {
      // poll faster while the current thread is busy
      var sid = currentSessionId()
      var st = sid && state.status[sid]
      if (st && st.type && st.type !== "idle") loadTokens()
    }, 1500)
    listEl.addEventListener("click", onListClick)
    render()
    load().then(loadPendingAttention)
    loadStatus()
    setInterval(load, 8000)
    setInterval(loadStatus, 2500)
    setInterval(loadPendingAttention, 8000)

    // live refresh via SSE
    try {
      // Global events include every project; /event only follows one directory.
      var es = new EventSource("/global/event")
      var t = null
      es.onopen = function () { loadStatus() }
      es.onmessage = function (m) {
        var event
        try {
          event = JSON.parse(m.data)
          var eventDirectory = event.directory
          event = event.payload || event
        } catch (e) { return }
        var p = event.properties || {}
        var id = p.sessionID || (p.info && p.info.sessionID) || (p.part && p.part.sessionID)
        if (event.type === "question.asked" || event.type === "permission.asked") {
          var kind = event.type === "question.asked" ? "question" : "permission"
          var detail = kind === "question" ? (p.questions || []).map(function (q) { return q.question }).join("\n") : p.permission
          notifyAttention(id, kind, detail, p.id, eventDirectory)
        }
        if (id && (event.type === "session.status" || event.type === "session.idle")) {
          var status = event.type === "session.idle" ? { type: "idle" } : p.status
          if (status && status.type) {
            statusRevision++
            applyStatus(id, status)
            refreshActivity()
          }
        }
        if (tk.sid && id === tk.sid && /^(message\.updated|session\.idle|session\.status)$/.test(event.type)) scheduleTokens()
        if (!/^session\.(updated|created|deleted)$/.test(event.type)) return
        clearTimeout(t)
        t = setTimeout(function () {
          load()
        }, 300)
      }
    } catch (e) {}

    // Codex has no separate "home" page: open a new thread instead
    if (location.pathname === "/" && !sessionStorage.getItem("codex.home")) {
      setTimeout(function () {
        if (location.pathname === "/") newThread()
      }, 600)
    }

    // follow SPA navigation
    var last = location.href
    setInterval(function () {
      if (location.href !== last) {
        last = location.href
        render()
        loadTokens()
      }
      decorateNewSession()
    }, 300)
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", boot)
  else boot()
})()
