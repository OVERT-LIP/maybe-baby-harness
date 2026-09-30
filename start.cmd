@echo off
title MAYBE BABY HARNESS
rem Chain: browser -> Maybe Baby (4098) -> Codex skin (4097) -> OpenCode server (4096)
set OPENCODE_SERVER_PASSWORD=
set OPENCODE_SERVER_USERNAME=

rem 1) OpenCode server on 4096
powershell -NoProfile -Command "try { Invoke-WebRequest http://127.0.0.1:4096/session/status -UseBasicParsing -TimeoutSec 2 | Out-Null; exit 0 } catch { exit 1 }"
if not %errorlevel%==0 start "OpenCode server" /min opencode serve --port 4096 --hostname 127.0.0.1

rem 2) base Codex skin on 4097
powershell -NoProfile -Command "try { Invoke-WebRequest http://127.0.0.1:4097/__codex/codex.css -UseBasicParsing -TimeoutSec 2 | Out-Null; exit 0 } catch { exit 1 }"
if not %errorlevel%==0 start "Codex skin" /min node "%~dp0vendor\codex-web\server.js"

rem 3) Maybe Baby on 4098
powershell -NoProfile -Command "try { Invoke-WebRequest http://127.0.0.1:4098/__hannah/hannah.css -UseBasicParsing -TimeoutSec 2 | Out-Null; exit 0 } catch { exit 1 }"
if not %errorlevel%==0 start "Maybe Baby Harness" /min node "%~dp0server.js"

powershell -NoProfile -Command "for($i=0;$i -lt 60;$i++){ try { Invoke-WebRequest http://127.0.0.1:4096/session/status -UseBasicParsing -TimeoutSec 1 | Out-Null; Invoke-WebRequest http://127.0.0.1:4098/__hannah/hannah.css -UseBasicParsing -TimeoutSec 1 | Out-Null; Start-Process 'http://127.0.0.1:4098'; exit 0 } catch { Start-Sleep 1 } }; exit 1"
