-- Skill "editor": daje agentowi żywy edytor + historię + schowek przez SERWER MCP.
--
-- Zastępuje trzy dawne skille (neovim, history, clipboard), które działały jako
-- miękki tekst w system-prompcie każący modelowi ręcznie sklejać kruche komendy
-- `nvim --server ... --remote-expr 'luaeval("...")'`. Tu zdolności są prawdziwymi
-- narzędziami MCP (patrz mcp/server.js) — model widzi je na liście toolów i woła
-- wprost, bez zgadywania cytowania.
--
-- Ten skill:
--   * definiuje helpery Lua wołane zdalnie przez serwer MCP (on_enable),
--   * rejestruje serwer MCP `nvim` (mcp) — rdzeń złoży z tego --mcp-config,
--   * dokłada krótki opis narzędzi do system-promptu (system_prompt).
-- Adres RPC nvim i namiary bazy historii jadą do procesu serwera w jego env.

local history = require("system.agent.history")

-- Ścieżka do serwera: .../agent/skills/editor.lua → .../agent/mcp/server.js
local SERVER_JS = vim.fn.fnamemodify(debug.getinfo(1, "S").source:sub(2), ":h:h") .. "/mcp/server.js"

local M = {
  name = "editor",
  description = "Żywy Neovim + historia + schowek przez serwer MCP (eval_lua, open_file, read_clipboard_image, search_history)",
}

-- Zrzut OBRAZU ze schowka do `path`. Wayland (wl-paste) → X11 (xclip) fallback.
-- Zwraca ścieżkę przy sukcesie albo "error: ...".
local function clip_image(path)
  path = path or "/tmp/agent-clip.png"

  local function run(cmd)
    local ok = os.execute(cmd .. " > " .. vim.fn.shellescape(path) .. " 2>/dev/null")

    if ok == true or ok == 0 then
      local size = vim.fn.getfsize(path)

      return type(size) == "number" and size > 0
    end

    return false
  end

  if vim.fn.executable("wl-paste") == 1 then
    if run("wl-paste --no-newline --type image/png") then
      return path
    end
  end

  if vim.fn.executable("xclip") == 1 then
    if run("xclip -selection clipboard -t image/png -o") then
      return path
    end
  end

  return "error: schowek nie zawiera obrazu (albo brak wl-paste/xclip)"
end

function M.on_enable(_)
  -- Wykonaj Lua przekazane z serwera MCP (base64 → load → run → vim.inspect).
  -- Base64 omija cytowanie: serwer podaje tylko czyste ASCII przez --remote-expr.
  function _G.__agent_mcp_eval(b64)
    local code = vim.base64.decode(b64)
    local chunk, load_err = load(code, "@agent_mcp_eval")

    if not chunk then
      return "load error: " .. tostring(load_err)
    end

    local ok, result = pcall(chunk)

    if not ok then
      return "runtime error: " .. tostring(result)
    end

    if result == nil then
      return "(brak wartości zwróconej — użyj `return ...`)"
    end

    return type(result) == "string" and result or vim.inspect(result)
  end

  -- Otwórz plik w GŁÓWNYM oknie edytora (nie w kolumnie czatu).
  function _G.__agent_mcp_open(b64)
    local path = vim.base64.decode(b64)
    local ok, agent = pcall(require, "system.agent")

    if not ok then
      return "error: moduł agenta niedostępny"
    end

    local win = agent.open_file(path)

    return win and ("opened " .. path) or ("could not open " .. path)
  end

  -- Zrzuć obraz ze schowka do pliku i zwróć ścieżkę.
  function _G.__agent_mcp_clip(b64)
    return clip_image(vim.base64.decode(b64))
  end

  -- Prośby o zgodę na narzędzie spoza allowlisty (--permission-prompt-tool).
  -- Rozdzielone na ask/poll/cancel, bo serwer MCP nie może zablokować pętli
  -- zdarzeń nvima na czas decyzji — patrz permission.lua.
  local permission = require("system.agent.permission")

  function _G.__agent_permission_ask(b64)
    return permission.ask(vim.base64.decode(b64))
  end

  function _G.__agent_permission_poll(b64)
    return permission.poll(vim.base64.decode(b64))
  end

  function _G.__agent_permission_cancel(b64)
    return permission.cancel(vim.base64.decode(b64))
  end
end

-- Rejestracja serwera MCP. ctx.server to adres RPC żywego nvim; namiary historii
-- z modułu history. Rdzeń zbierze to do --mcp-config i pozwoli na tools serwera.
function M.mcp(ctx)
  return {
    name = "nvim",
    command = "node",
    args = { SERVER_JS },
    env = {
      NVIM_AGENT_SERVER = ctx.server,
      AGENT_HISTORY_DB = history.path(),
      AGENT_HISTORY_PROJECT = history.project_key(),
    },
    tools = { "eval_lua", "open_file", "read_clipboard_image", "search_history" },
    -- Narzędzie, przez które CLI pyta o zgodę na tool spoza --allowedTools.
    -- Rdzeń przerobi to na --permission-prompt-tool mcp__nvim__permission_request.
    permission_tool = "permission_request",
  }
end

function M.system_prompt(_)
  return [[## Żywy Neovim (serwer MCP `nvim`)

Działasz WEWNĄTRZ żywego Neovima użytkownika; cwd to repozytorium jego configu.
Masz dedykowane narzędzia MCP — używaj ich zamiast sklejać komendy w Bashu:

- `eval_lua` — uruchom Lua w DZIAŁAJĄCYM nvim i odbierz wynik. Do stanu runtime:
  opcje (vim.o/vim.bo/vim.wo), keymapy (vim.fn.maparg), załadowane pluginy,
  bufory. Twój kod musi `return` wartość. Domyślnie tylko odczyt — nie zmieniaj
  stanu edytora, chyba że user wprost prosi.
- `open_file` — otwórz plik w GŁÓWNYM oknie edytora. Gdy user mówi „otwórz/
  pokaż/wejdź do <plik>", to znaczy OTWÓRZ TU — wywołaj od razu.
- `read_clipboard_image` — gdy user mówi „zobacz screena"/„spójrz na screenshot",
  obraz jest w schowku. Wywołaj to, a potem Read zwróconą ścieżkę, żeby go zobaczyć.
- `search_history` — ta rozmowa jest zapisywana per projekt w SQLite; przeszukaj
  wcześniejsze wiadomości, gdy user odwołuje się do czegoś spoza twojego kontekstu.

Na pytania „jak jest skonfigurowane X" zwykle wystarczy Read/Grep plików configu —
po `eval_lua` sięgaj tylko, gdy naprawdę liczy się stan runtime.]]
end

return M
