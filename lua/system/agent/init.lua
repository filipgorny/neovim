-- Agent: czat z modelem-agentem w stylu Cursora, niezależny od dostawcy.
--
-- Rdzeń nie wie nic o konkretnym CLI — mówi tylko z abstrakcyjnym
-- providerem wstrzykiwanym przez setup{ provider = ... } (dependency
-- injection). Provider odpowiada za: zbudowanie argv procesu, zakodowanie
-- wiadomości użytkownika do formatu wejściowego oraz zdekodowanie strumienia
-- wyjściowego na znormalizowane zdarzenia (patrz providers/claude.lua).
--
-- <leader>C — start trwałej sesji headless (proces żyje w tle, trzyma kontekst).
-- <leader>c — panel czatu po prawej: na górze log rozmowy, na dole okienko
--   wpisywania, które od razu łapie focus. Gdy agent myśli, w pasku nad
--   inputem leci animacja z licznikiem czasu i tokenów.
--
-- Do każdej wiadomości doklejany jest kontekst edytora: ścieżka otwartego
-- pliku, pozycja kursora, git diff pliku i niezapisane zmiany bufora.
--
-- Znormalizowane zdarzenia zwracane przez provider.new_decoder():
--   { kind = "ready",  model = string, session_id = string }
--   { kind = "text",   text = string }
--   { kind = "tool",   label = string }
--   { kind = "tokens", output_tokens = number }
--   { kind = "result", duration_ms = number, output_tokens = number,
--                       error = boolean, message = string }

local M = {}

M.config = {
  chat_width = 0.2,        -- ułamek szerokości ekranu dla kolumny czatu (maks. 20%)
  input_height = 6,        -- wysokość okienka wpisywania (linie)
  max_context_lines = 300, -- limit linii na diff / zawartość bufora w kontekście
  persist_history = true,  -- zapisuj rozmowę do SQLite (patrz history.lua)

  -- Jak pokazywać kod dopisywany przez agenta (Edit/Write):
  --   mode = "flash"  → otwórz plik, przewiń do edycji, mignij tłem dodanego tekstu
  --   mode = "inline" → blok ``` w logu czatu
  --   mode = false    → tylko linia narzędzia, bez treści
  edit_preview = {
    mode = "flash",
    open = true,           -- otwórz edytowany plik w oknie edytora
    scroll = true,         -- przewiń do miejsca edycji
    flash_ms = 700,        -- czas migotania tła
    flash_hl = "IncSearch", -- grupa podświetlenia migotania
    inline_max_lines = 60, -- limit linii dla trybu "inline"
  },
}

M.provider = nil    -- aktywny provider (wstrzykiwany przez M.setup)
M.providers = {}    -- name -> provider module (do przełączania na <C-a>)
M.skills = {}       -- lista skilli wstrzykiwana przez M.setup{ skills = { ... } }

local SPINNER = { "⠋", "⠙", "⠹", "⠸", "⠼", "⠴", "⠦", "⠧", "⠇", "⠏" }

local ICON = {
  user = "",
  agent = "󰚩",
  ready = "",
  done = "",
  error = "",
  start = "",
  stop = "",
  interrupt = "",
}

local TOOL_ICON = {
  Read = "",
  Edit = "",
  Write = "",
  Grep = "",
  Glob = "",
  Bash = "",
}

-- Maks. liczba linii kodu pokazywanego pod użyciem narzędzia (reszta ucinana).
local MAX_TOOL_BODY_LINES = 60

-- Zgadnij język bloku kodu (do ``` fence) po rozszerzeniu pliku.
local function lang_from_path(path)
  local ext = (path or ""):match("%.([%w_]+)$")

  if not ext then return "" end

  local map = {
    lua = "lua", ts = "typescript", tsx = "tsx", js = "javascript", jsx = "jsx",
    go = "go", py = "python", rs = "rust", rb = "ruby", sh = "bash", zsh = "bash",
    json = "json", yaml = "yaml", yml = "yaml", toml = "toml", md = "markdown",
    css = "css", scss = "scss", html = "html", vim = "vim", sql = "sql", c = "c",
    cpp = "cpp", h = "c", java = "java", php = "php",
  }

  return map[ext:lower()] or ext:lower()
end

-- Rozszerzenia, po których poznajemy nazwę pliku w tekście wiadomości.
local PATH_EXT = {
  lua = 1, ts = 1, tsx = 1, js = 1, jsx = 1, go = 1, py = 1, rs = 1, rb = 1,
  sh = 1, zsh = 1, json = 1, yaml = 1, yml = 1, toml = 1, md = 1, css = 1,
  scss = 1, html = 1, vim = 1, sql = 1, c = 1, cpp = 1, h = 1, hpp = 1,
  java = 1, php = 1, txt = 1, lock = 1, conf = 1, cfg = 1, ini = 1, env = 1,
}

local function looks_like_path(tok)
  local ext = tok:match("%.([%w_]+)$")

  if ext and PATH_EXT[ext:lower()] then return true end

  -- ma ukośnik i kropkę → prawie na pewno ścieżka (np. src/a/b.unknown)
  if tok:find("/") and tok:find("%.") then return true end

  return false
end

-- Znajdź w linii tokeny wyglądające na ścieżki plików. Zwraca listę
-- { s, e (1-indeks, e włącznie), path, line }, uwzględniając sufiks :123 / :123:45.
local function scan_paths(text)
  local out = {}
  local init = 1

  while true do
    local s, e = text:find("[%w%._%-/~@]+", init)

    if not s then break end

    local tok = text:sub(s, e)
    local endpos = e
    local lnum
    local after = text:sub(e + 1)
    local full = after:match("^:%d+:%d+") or after:match("^:%d+")

    if full then
      lnum = tonumber(full:match("^:(%d+)"))
      endpos = e + #full
    end

    if looks_like_path(tok) then
      table.insert(out, { s = s, e = endpos, path = tok, line = lnum })
    end

    init = endpos + 1
  end

  return out
end

local uv = vim.uv or vim.loop

local ns = vim.api.nvim_create_namespace("agent_chat")

-- Grupy podświetleń czatu. Kolory w palecie tokyonight (spójne z resztą
-- konfiguracji); odświeżane przy zmianie motywu.
local function setup_highlights()
  local hl = vim.api.nvim_set_hl
  hl(0, "AgentUserHeader", { fg = "#7aa2f7", bg = "#20243a", bold = true })
  hl(0, "AgentAgentHeader", { fg = "#bb9af7", bg = "#262039", bold = true })
  hl(0, "AgentTool", { fg = "#9ece6a", italic = true })
  hl(0, "AgentReady", { fg = "#73daca", italic = true })
  hl(0, "AgentResult", { fg = "#73daca", bold = true })
  hl(0, "AgentError", { fg = "#f7768e", bold = true })
  hl(0, "AgentDim", { fg = "#565f89", italic = true })
  hl(0, "AgentThinking", { fg = "#e0af68", bold = true })
  -- Nazwy plików w wiadomościach: pogrubione, jaskrawe, podkreślone (klikalne).
  hl(0, "AgentFile", { fg = "#7dcfff", bold = true, underline = true })
end

local state = {
  job = nil,
  decoder = nil,
  ready = false,     -- (oneshot) sesja zainicjowana, gotowa na wiadomość
  session_id = nil,
  model = nil,
  provider_name = nil,
  target_buf = nil,  -- bufor pliku, którego dotyczy rozmowa
  log_buf = nil,
  log_win = nil,
  input_buf = nil,
  input_win = nil,
  thinking = { active = false, timer = nil, start_ms = 0, tokens = 0, frame = 1 },
  interrupt_pending = false,
  turn_had_error = false,
  -- śledzenie do podsumowania przy przełączaniu agenta
  last_user_msg = nil,
  turn_count = 0,
  touched_files = {},
  bg_agents = {},   -- lista agentów w tle (Task): { id, desc, status, steps, label }
  bg_index = {},    -- id -> wpis powyżej
}

local bg_ns = vim.api.nvim_create_namespace("agent_bg_panel")

local history = require("system.agent.history")

local function provider_label()
  return (M.provider and (M.provider.label or M.provider.name)) or "Agent"
end

local function is_oneshot()
  return M.provider and M.provider.mode == "oneshot"
end

---------------------------------------------------------------------------
-- Bufory i layout czatu
---------------------------------------------------------------------------

local function ensure_log_buf()
  if state.log_buf and vim.api.nvim_buf_is_valid(state.log_buf) then
    return state.log_buf
  end

  local buf = vim.api.nvim_create_buf(false, true)
  vim.bo[buf].buftype = "nofile"
  vim.bo[buf].bufhidden = "hide"
  vim.bo[buf].swapfile = false
  vim.bo[buf].filetype = "markdown"
  vim.bo[buf].modifiable = false
  pcall(vim.api.nvim_buf_set_name, buf, "agent://log")

  -- Klikanie/otwieranie nazw plików w wiadomościach: <CR>, gf i podwójny klik
  -- otwierają plik pod kursorem (z przewinięciem+mignięciem, jeśli jest :linia).
  local kopts = { buffer = buf, nowait = true, silent = true }

  vim.keymap.set("n", "<CR>", function() M.open_path_under_cursor() end, kopts)
  vim.keymap.set("n", "gf", function() M.open_path_under_cursor() end, kopts)
  vim.keymap.set("n", "<2-LeftMouse>", function() M.open_path_under_cursor() end, kopts)

  state.log_buf = buf
  return buf
end

local function ensure_input_buf()
  if state.input_buf and vim.api.nvim_buf_is_valid(state.input_buf) then
    return state.input_buf
  end

  local buf = vim.api.nvim_create_buf(false, true)
  vim.bo[buf].buftype = "nofile"
  vim.bo[buf].bufhidden = "hide"
  vim.bo[buf].swapfile = false
  vim.bo[buf].filetype = "markdown"
  pcall(vim.api.nvim_buf_set_name, buf, "agent://input")

  local map_opts = { buffer = buf, noremap = true, silent = true }
  vim.keymap.set("i", "<CR>", function() M.submit() end, map_opts)
  vim.keymap.set("n", "<CR>", function() M.submit() end, map_opts)
  -- Shift/Ctrl+Enter → nowa linia (jeśli terminal je rozróżnia)
  vim.keymap.set("i", "<S-CR>", "<CR>", map_opts)
  vim.keymap.set("i", "<C-CR>", "<CR>", map_opts)
  vim.keymap.set("n", "q", function() M.close() end, map_opts)
  -- Ctrl-C przerywa myślenie (jak w CLI); poza turą zachowuje się jak Esc
  vim.keymap.set({ "n", "i" }, "<C-c>", function()
    if state.thinking.active then
      M.interrupt()
    else
      vim.cmd("stopinsert")
    end
  end, map_opts)
  -- Ctrl-A → wybór/przełączenie agenta (z podsumowaniem)
  vim.keymap.set({ "n", "i" }, "<C-a>", function()
    vim.cmd("stopinsert")
    vim.schedule(M.pick_agent)
  end, map_opts)
  -- Ctrl-G → wybór modelu (Ctrl-M nie da rady — to w terminalu Enter)
  vim.keymap.set({ "n", "i" }, "<C-g>", function()
    vim.cmd("stopinsert")
    vim.schedule(M.pick_model)
  end, map_opts)

  state.input_buf = buf
  return buf
end

local function provider_icon()
  return (M.provider and M.provider.icon) or ICON.agent
end

local function hl_line(buf, line0, group)
  pcall(vim.api.nvim_buf_set_extmark, buf, ns, line0, 0, {
    line_hl_group = group,
    priority = 200,
  })
end

-- Renderuje panel agentów w tle (Task) jako wirtualne linie DOKLEJONE POD ostatnią
-- linią logu — dzięki temu lista trzyma się dołu wiadomości i aktualizuje w miejscu.
local function render_bg_panel()
  local buf = state.log_buf

  if not buf or not vim.api.nvim_buf_is_valid(buf) then return end

  vim.api.nvim_buf_clear_namespace(buf, bg_ns, 0, -1)

  if #state.bg_agents == 0 then return end

  local virt = { { { "", "AgentDim" }, { "  agenci w tle", "AgentDim" } } }

  for _, e in ipairs(state.bg_agents) do
    local icon, group

    if e.status == "error" then
      icon, group = "", "AgentError"
    elseif e.status == "done" then
      icon, group = "", "AgentResult"
    else
      icon, group = "", "AgentTool"
    end

    local detail = ""

    if e.status == "running" then
      detail = ("  ·  %s  ·  %d kr."):format(e.label or "…", e.steps)
    end

    table.insert(virt, { { ("  %s %s"):format(icon, e.desc), group }, { detail, "AgentDim" } })
  end

  local last = vim.api.nvim_buf_line_count(buf) - 1

  pcall(vim.api.nvim_buf_set_extmark, buf, bg_ns, last, 0, {
    virt_lines = virt,
    virt_lines_above = false,
  })
end

-- Dopisz linie do logu; opcjonalnie pokoloruj każdą z nich grupą `group`.
-- Zwraca 0-indeksowaną pozycję pierwszej dopisanej linii.
local function append_chat(lines, group)
  local buf = ensure_log_buf()
  vim.bo[buf].modifiable = true

  -- nvim_buf_set_lines odrzuca elementy z '\n' — rozbij je na osobne linie.
  local normalized = {}

  for _, l in ipairs(lines) do
    if type(l) == "string" and l:find("\n", 1, true) then
      for _, part in ipairs(vim.split(l, "\n", { plain = true })) do
        table.insert(normalized, part)
      end
    else
      table.insert(normalized, l)
    end
  end

  lines = normalized

  local count = vim.api.nvim_buf_line_count(buf)
  local fresh = count == 1 and (vim.api.nvim_buf_get_lines(buf, 0, 1, false)[1] == "")
  local start

  if fresh then
    vim.api.nvim_buf_set_lines(buf, 0, -1, false, lines)
    start = 0
  else
    start = count
    vim.api.nvim_buf_set_lines(buf, -1, -1, false, lines)
  end

  vim.bo[buf].modifiable = false

  if group then
    for i = 0, #lines - 1 do
      hl_line(buf, start + i, group)
    end
  end

  -- Podświetl nazwy plików w dopisanych liniach (klikalne przez <CR>/dblklik).
  for i = 1, #lines do
    local text = lines[i]

    if type(text) == "string" then
      for _, m in ipairs(scan_paths(text)) do
        pcall(vim.api.nvim_buf_set_extmark, buf, ns, start + i - 1, m.s - 1, {
          end_col = m.e,
          hl_group = "AgentFile",
          priority = 250,
        })
      end
    end
  end

  -- Nowa treść zepchnęła koniec bufora — przenieś panel agentów pod nią.
  render_bg_panel()

  if state.log_win and vim.api.nvim_win_is_valid(state.log_win) then
    local last = vim.api.nvim_buf_line_count(buf)
    pcall(vim.api.nvim_win_set_cursor, state.log_win, { last, 0 })
  end

  return start
end

-- Wiadomość z kolorowym paskiem-nagłówkiem (ikona + nazwa mówcy).
local function append_speaker(icon, name, header_group, text)
  local buf = ensure_log_buf()
  local time = os.date("%H:%M")
  local header = icon .. " " .. name .. "   " .. time
  local lines = { "", header }

  for _, l in ipairs(vim.split(text or "", "\n", { plain = true })) do
    table.insert(lines, l)
  end

  local start = append_chat(lines)
  local hline = start + 1
  hl_line(buf, hline, header_group)

  -- Przygaszony czas wysłania na końcu paska nagłówka
  pcall(vim.api.nvim_buf_set_extmark, buf, ns, hline, #header - #time, {
    end_col = #header,
    hl_group = "AgentDim",
    priority = 300,
  })
end

-- Pasek statusu w winbar okienka wpisywania. Wywoływany przez wyrażenie
-- `%!` przy każdym przerysowaniu, więc animacja aktualizuje się z timerem.
function M.statusbar()
  local t = state.thinking

  if t.active then
    local spinner = SPINNER[(t.frame % #SPINNER) + 1]
    local secs = (uv.now() - t.start_ms) / 1000
    return string.format(
      "%%#AgentThinking# %s %s myśli… %%#AgentDim#%.1fs · %d tok%%*",
      spinner, provider_label(), secs, t.tokens
    )
  end

  local model = state.model or (state.job and "łączenie…" or "sesja nieaktywna")
  return string.format("%%#AgentDim#  ⏎ wyślij · ⇧⏎ nowa linia · q zamknij   —   %s%%*", model)
end

local function start_thinking()
  local t = state.thinking

  if t.timer and not t.timer:is_closing() then
    t.timer:stop()
    t.timer:close()
  end

  t.active = true
  t.start_ms = uv.now()
  t.tokens = 0
  t.frame = 1
  t.timer = uv.new_timer()

  t.timer:start(120, 120, vim.schedule_wrap(function()
    if not state.thinking.active then return end
    state.thinking.frame = state.thinking.frame + 1
    pcall(vim.cmd, "redrawstatus")
  end))
end

-- Zatrzymuje animację myślenia i zwraca { secs, tokens } jeśli tura trwała
-- (albo nil). Podsumowanie w logu dopisuje wołający — zależnie od tego, czy
-- tura się udała, wywaliła błędem czy została przerwana.
local function stop_thinking(duration_ms, final_tokens)
  local t = state.thinking

  if t.timer and not t.timer:is_closing() then
    t.timer:stop()
    t.timer:close()
    t.timer = nil
  end

  if not t.active then return nil end

  local info = {
    secs = (duration_ms or (uv.now() - t.start_ms)) / 1000,
    tokens = final_tokens or t.tokens,
  }
  t.active = false
  pcall(vim.cmd, "redrawstatus")
  return info
end

local function open_layout()
  local log_buf = ensure_log_buf()
  local input_buf = ensure_input_buf()

  -- Kolumna po prawej z logiem
  vim.cmd("botright vsplit")
  state.log_win = vim.api.nvim_get_current_win()
  vim.api.nvim_win_set_buf(state.log_win, log_buf)
  vim.api.nvim_win_set_width(state.log_win, math.floor(vim.o.columns * M.config.chat_width))
  vim.wo[state.log_win].wrap = true
  vim.wo[state.log_win].number = false
  vim.wo[state.log_win].relativenumber = false
  vim.wo[state.log_win].signcolumn = "no"
  -- Zablokuj podmianę bufora w tym oknie (żeby :edit/agent nie otworzył tu pliku)
  pcall(function() vim.wo[state.log_win].winfixbuf = true end)

  -- Okienko wpisywania pod logiem
  vim.cmd("belowright split")
  state.input_win = vim.api.nvim_get_current_win()
  vim.api.nvim_win_set_buf(state.input_win, input_buf)
  vim.api.nvim_win_set_height(state.input_win, M.config.input_height)
  vim.wo[state.input_win].wrap = true
  vim.wo[state.input_win].number = false
  vim.wo[state.input_win].relativenumber = false
  vim.wo[state.input_win].signcolumn = "no"
  vim.wo[state.input_win].winbar = "%!v:lua.require'system.agent'.statusbar()"
  pcall(function() vim.wo[state.input_win].winfixbuf = true end)

  vim.api.nvim_set_current_win(state.input_win)
  vim.cmd("startinsert")
end

function M.close()
  for _, win in ipairs({ state.input_win, state.log_win }) do
    if win and vim.api.nvim_win_is_valid(win) then
      pcall(vim.api.nvim_win_close, win, true)
    end
  end

  state.input_win = nil
  state.log_win = nil
end

---------------------------------------------------------------------------
-- Kontekst edytora doklejany do wiadomości
---------------------------------------------------------------------------

local function truncate(lines)
  local max = M.config.max_context_lines

  if #lines <= max then
    return lines
  end

  local out = vim.list_slice(lines, 1, max)
  table.insert(out, ("... (skrócono, %d linii ukryto)"):format(#lines - max))
  return out
end

local function build_context()
  local buf = state.target_buf

  if not buf or not vim.api.nvim_buf_is_valid(buf) then
    return ""
  end

  local name = vim.api.nvim_buf_get_name(buf)

  if name == "" then
    return ""
  end

  local rel = vim.fn.fnamemodify(name, ":.")
  local ft = vim.bo[buf].filetype
  local parts = {
    "[Editor context — attached automatically, not written by the user]",
    ("Open file: %s%s"):format(rel, ft ~= "" and (" (filetype: " .. ft .. ")") or ""),
  }

  for _, win in ipairs(vim.api.nvim_list_wins()) do
    if vim.api.nvim_win_get_buf(win) == buf then
      local row = vim.api.nvim_win_get_cursor(win)[1]
      table.insert(parts, ("Cursor at line %d."):format(row))
      break
    end
  end

  local diff = vim.fn.systemlist({ "git", "diff", "HEAD", "--", name })

  if vim.v.shell_error == 0 and #diff > 0 then
    table.insert(parts, "")
    table.insert(parts, "Uncommitted changes in this file (git diff HEAD):")
    table.insert(parts, "```diff")
    vim.list_extend(parts, truncate(diff))
    table.insert(parts, "```")
  end

  if vim.bo[buf].modified then
    table.insert(parts, "")
    table.insert(parts, "NOTE: the buffer has UNSAVED changes — the file on disk is stale.")
    table.insert(parts, "Current buffer contents:")
    table.insert(parts, "```" .. (ft ~= "" and ft or ""))
    vim.list_extend(parts, truncate(vim.api.nvim_buf_get_lines(buf, 0, -1, false)))
    table.insert(parts, "```")
  end

  return table.concat(parts, "\n")
end

---------------------------------------------------------------------------
-- Podgląd edycji: otwórz plik, przewiń do zmiany, mignij tłem dodanego tekstu
---------------------------------------------------------------------------

local flash_ns = vim.api.nvim_create_namespace("agent_edit_flash")

-- Migocze tłem `count` linii od first0 (0-indeks) grupą `hl` na `ms` ms.
local function flash_lines(buf, first0, count, hl, ms)
  local last = vim.api.nvim_buf_line_count(buf) - 1

  for l = first0, math.min(first0 + count - 1, last) do
    pcall(vim.api.nvim_buf_set_extmark, buf, flash_ns, l, 0, {
      line_hl_group = hl,
      priority = 500,
    })
  end

  vim.defer_fn(function()
    if vim.api.nvim_buf_is_valid(buf) then
      vim.api.nvim_buf_clear_namespace(buf, flash_ns, 0, -1)
    end
  end, ms)
end

-- Czy okno nadaje się do otwarcia w nim pliku: normalny bufor z plikiem, nie
-- czat, nie neo-tree/eksplorator, nie float, nie bufor specjalny.
local SIDEBAR_FT = {
  ["neo-tree"] = true, ["NvimTree"] = true, ["neo-tree-popup"] = true,
  ["aerial"] = true, ["Outline"] = true, ["undotree"] = true,
}

local function is_file_win(w)
  if not vim.api.nvim_win_is_valid(w) then return false end
  if w == state.log_win or w == state.input_win then return false end
  if vim.api.nvim_win_get_config(w).relative ~= "" then return false end -- float

  local b = vim.api.nvim_win_get_buf(w)

  if vim.bo[b].buftype ~= "" then return false end -- nofile/terminal/prompt (neo-tree=nofile)
  if SIDEBAR_FT[vim.bo[b].filetype] then return false end

  return true
end

-- Prawdziwe okno edytora do otwarcia pliku. Nie rusza czatu ani listy plików —
-- gdy brak normalnego okna, tworzy nowe (nie zamykając paneli bocznych).
local function get_editor_win(create)
  local cur = vim.api.nvim_get_current_win()

  if is_file_win(cur) then
    return cur
  end

  for _, w in ipairs(vim.api.nvim_list_wins()) do
    if is_file_win(w) then
      return w
    end
  end

  if create then
    local prev = vim.api.nvim_get_current_win()
    -- Nowe okno obok istniejących (bez zamykania czatu/eksploratora)
    vim.cmd("topleft vsplit")
    local w = vim.api.nvim_get_current_win()
    -- Wyczyść bufor specjalny / winfixbuf odziedziczony po panelu, z którego
    -- powstał split, żeby dało się otworzyć plik.
    pcall(function() vim.wo[w].winfixbuf = false end)

    if vim.api.nvim_win_is_valid(prev) then
      pcall(vim.api.nvim_set_current_win, prev)
    end

    return w
  end

  return nil
end

-- Otwórz plik w głównym oknie edytora (nie w kolumnie czatu). Używane przez
-- podgląd edycji oraz przez skill neovim, gdy user prosi o otwarcie pliku.
function M.open_file(path)
  if not path or path == "" then return nil end

  local win = get_editor_win(true)

  if not win then return nil end

  local abs = vim.fn.fnamemodify(path, ":p")
  vim.api.nvim_win_call(win, function()
    pcall(vim.cmd, "edit " .. vim.fn.fnameescape(abs))
  end)

  return win
end

-- Publiczne: przenieś focus do PRAWDZIWEGO okna edytora (w razie potrzeby je
-- tworząc), zostawiając kolumnę czatu po prawej nietkniętą. Zwraca true, jeśli
-- po wywołaniu stoimy w oknie na plik. Bufferline woła to przed cyklowaniem/
-- zamykaniem buforów, żeby nie próbować podmienić bufora w oknie z winfixbuf.
function M.focus_editor_win()
  local win = get_editor_win(true)

  if win and vim.api.nvim_win_is_valid(win) then
    pcall(vim.api.nvim_set_current_win, win)

    return true
  end

  return false
end

-- Otwórz plik w oknie edytora i — jeśli podano linię — przewiń do niej (zz)
-- oraz mignij jej tłem. Nie tworzy nieistniejących plików (chroni przed
-- fałszywym trafieniem skanera ścieżek).
function M.open_and_reveal(path, lnum)
  if not path or path == "" then return end

  local abs = vim.fn.fnamemodify(vim.fn.expand(path), ":p")

  if vim.fn.filereadable(abs) ~= 1 then
    vim.notify("Agent: nie znaleziono pliku " .. path, vim.log.levels.WARN)

    return
  end

  local win = M.open_file(abs)

  if not win or not vim.api.nvim_win_is_valid(win) then return end

  if lnum then
    local fbuf = vim.api.nvim_win_get_buf(win)
    local target = math.max(1, math.min(lnum, vim.api.nvim_buf_line_count(fbuf)))

    pcall(vim.api.nvim_win_set_cursor, win, { target, 0 })
    vim.api.nvim_win_call(win, function() vim.cmd("normal! zz") end)

    local cfg = M.config.edit_preview or {}
    flash_lines(fbuf, target - 1, 1, cfg.flash_hl or "IncSearch", cfg.flash_ms or 700)
  end
end

-- Otwórz plik wskazany przez nazwę pod kursorem w logu czatu (np. po <CR> albo
-- podwójnym kliknięciu). Jeśli kursor nie stoi na ścieżce, bierze pierwszą w linii.
function M.open_path_under_cursor()
  local ok_line, line = pcall(vim.api.nvim_get_current_line)

  if not ok_line then return end

  local col = vim.api.nvim_win_get_cursor(0)[2] + 1
  local matches = scan_paths(line)
  local hit

  for _, m in ipairs(matches) do
    if col >= m.s and col <= m.e then
      hit = m

      break
    end
  end

  hit = hit or matches[1]

  if hit then
    M.open_and_reveal(hit.path, hit.line)
  end
end

-- Otwiera edytowany plik, przewija do wstawionego tekstu i migocze jego tłem.
-- Best-effort: zapis agenta na dysk jest asynchroniczny, więc próbujemy kilka
-- razy, aż dopisany tekst pojawi się w pliku.
local function preview_edit(path, body)
  local cfg = M.config.edit_preview or {}

  if not path or path == "" or not body or body == "" then return end

  local win = get_editor_win(true)

  if not win then return end

  local abs = vim.fn.fnamemodify(path, ":p")
  local body_lines = vim.split(body, "\n", { plain = true })

  local needle
  for _, l in ipairs(body_lines) do
    if vim.trim(l) ~= "" then needle = vim.trim(l); break end
  end

  local attempts = 0
  local function try()
    attempts = attempts + 1

    vim.api.nvim_win_call(win, function()
      vim.cmd("silent! checktime")
      local cur = vim.fn.fnamemodify(vim.api.nvim_buf_get_name(0), ":p")

      if cur ~= abs then
        if cfg.open ~= false then
          pcall(vim.cmd, "silent! edit " .. vim.fn.fnameescape(abs))
        end
      else
        pcall(vim.cmd, "silent! edit")
      end
    end)

    local buf = vim.api.nvim_win_get_buf(win)
    local lines = vim.api.nvim_buf_get_lines(buf, 0, -1, false)
    local found

    if needle then
      for i, l in ipairs(lines) do
        if vim.trim(l) == needle then found = i; break end
      end
    end

    if not found then
      if attempts < 3 then vim.defer_fn(try, 300) end
      return
    end

    if cfg.scroll ~= false then
      pcall(vim.api.nvim_win_set_cursor, win, { found, 0 })
      vim.api.nvim_win_call(win, function() vim.cmd("normal! zz") end)
    end

    flash_lines(buf, found - 1, #body_lines, cfg.flash_hl or "IncSearch", cfg.flash_ms or 700)
  end

  vim.defer_fn(try, 350)
end

-- Blok ``` z kodem dopisywanym przez narzędzie (tryb "inline").
local function append_code_block(target, body)
  local cfg = M.config.edit_preview or {}
  local limit = cfg.inline_max_lines or MAX_TOOL_BODY_LINES
  local lines = vim.split(body, "\n", { plain = true })
  local clipped = #lines > limit
  local block = { "```" .. lang_from_path(target) }

  for i = 1, math.min(#lines, limit) do
    table.insert(block, lines[i])
  end

  table.insert(block, "```")

  if clipped then
    table.insert(block, ("… (+%d linii)"):format(#lines - limit))
  end

  append_chat(block)
end

---------------------------------------------------------------------------
-- Sesja headless — sterowanie procesem providera
---------------------------------------------------------------------------

local function persist(role, content)
  if M.config.persist_history then
    pcall(history.append, role, content)
  end
end

-- Dzwonek terminala (BEL) prosto do pty pane'a. W tmux z monitor-bell zapala flagę
-- dzwonka na oknie (mignięcie tytułu), gdy agent skończy turę, a Ty pracujesz w
-- innym panelu. Tylko w tmux, żeby poza nim nie robić słyszalnego beepa.
local function ring_bell()
  if not vim.env.TMUX then return end

  local ok, tty = pcall(io.open, "/dev/tty", "w")

  if ok and tty then
    tty:write("\a")
    tty:close()
  end
end

local function handle_event(evt)
  if evt.kind == "ready" then
    state.session_id = evt.session_id
    state.model = evt.model
    append_chat({ ("%s sesja gotowa · %s"):format(ICON.ready, evt.model or "?") }, "AgentReady")
    pcall(vim.cmd, "redrawstatus")
    return
  end

  -- (oneshot) id sesji do kontynuacji kolejnej tury
  if evt.kind == "session" then
    state.session_id = evt.session_id
    return
  end

  if evt.kind == "tokens" then
    state.thinking.tokens = state.thinking.tokens + (evt.output_tokens or 0)
    return
  end

  -- Agenci w tle (Task) — lista i postęp na dole wiadomości.
  if evt.kind == "agent_start" then
    local entry = {
      id = evt.id,
      desc = evt.desc or evt.subagent or "agent",
      subagent = evt.subagent,
      status = "running",
      steps = 0,
    }

    table.insert(state.bg_agents, entry)

    if evt.id then
      state.bg_index[evt.id] = entry
    end

    render_bg_panel()
    return
  end

  if evt.kind == "agent_progress" then
    local e = state.bg_index[evt.id]

    if e and e.status == "running" then
      e.steps = e.steps + 1
      e.label = evt.label or e.label
      render_bg_panel()
    end

    return
  end

  if evt.kind == "agent_done" then
    local e = state.bg_index[evt.id]

    if e and e.status == "running" then
      e.status = evt.error and "error" or "done"
      render_bg_panel()
    end

    return
  end

  if evt.kind == "text" then
    append_speaker(provider_icon(), provider_label(), "AgentAgentHeader", evt.text)
    persist("assistant", evt.text)
    return
  end

  if evt.kind == "tool" then
    local icon = TOOL_ICON[evt.tool] or ""
    local target = (evt.target and evt.target ~= "") and (" " .. evt.target) or ""
    append_chat({ ("%s %s%s"):format(icon, evt.tool or "tool", target) }, "AgentTool")

    if evt.body and evt.target and evt.target ~= "" then
      state.touched_files[evt.target] = true
    end

    -- Pokaż dopisywany kod wg trybu z konfiguracji
    if evt.body and evt.body ~= "" then
      local mode = M.config.edit_preview and M.config.edit_preview.mode

      if mode == "flash" then
        preview_edit(evt.target, evt.body)
      elseif mode == "inline" then
        append_code_block(evt.target, evt.body)
      end
    end

    return
  end

  if evt.kind == "error" then
    state.turn_had_error = true
    append_chat({ ("%s błąd: %s"):format(ICON.error, tostring(evt.message)) }, "AgentError")
    return
  end

  if evt.kind == "result" then
    local info = stop_thinking(evt.duration_ms, evt.output_tokens)
    -- Przeładuj bufory zmienione przez agenta na dysku
    vim.cmd("checktime")

    local suffix = info and (" · %.1fs · %d tok"):format(info.secs, info.tokens) or ""

    if state.interrupt_pending then
      state.interrupt_pending = false
      append_chat({ ("%s przerwano%s"):format(ICON.interrupt, suffix) }, "AgentDim")
    elseif evt.error then
      append_chat({ ("%s błąd: %s"):format(ICON.error, tostring(evt.message)) }, "AgentError")
      vim.notify(provider_label() .. ": błąd tury — " .. tostring(evt.message), vim.log.levels.ERROR)
      ring_bell()
    elseif info then
      append_chat({ ("%s gotowe%s"):format(ICON.done, suffix) }, "AgentResult")
      ring_bell()
    end
  end
end

function M.running()
  return state.job ~= nil
end

-- Adres RPC żywej instancji nvim — przez niego skille dają agentowi dostęp
-- do edytora (np. `nvim --server $addr --remote-expr ...`).
local function ensure_server()
  if vim.v.servername and vim.v.servername ~= "" then
    return vim.v.servername
  end

  return vim.fn.serverstart()
end

-- Złóż konfigurację i środowisko procesu z wkładu włączonych skilli:
-- dodatkowe narzędzia, dopiski do system-promptu i zmienne środowiskowe.
local function collect_launch()
  local ctx = { server = ensure_server() }
  local cfg = vim.deepcopy(M.provider.config or {})
  local env = {}

  local tools = {}
  for _, t in ipairs(vim.split(cfg.allowed_tools or "", ",", { plain = true })) do
    if t ~= "" then tools[t] = true end
  end

  local prompts = {}

  for _, skill in ipairs(M.skills) do
    if skill.on_enable and not skill._enabled then
      pcall(skill.on_enable, ctx)
      skill._enabled = true
    end

    for _, t in ipairs(skill.tools or {}) do
      tools[t] = true
    end

    if skill.system_prompt then
      table.insert(prompts, skill.system_prompt(ctx))
    end

    if skill.env then
      for k, v in pairs(skill.env(ctx)) do
        env[k] = v
      end
    end
  end

  cfg.allowed_tools = table.concat(vim.tbl_keys(tools), ",")

  if #prompts > 0 then
    cfg.append_system_prompt = table.concat(prompts, "\n\n")
  end

  return cfg, env
end

-- Odetnij proces agenta od terminala pane'a (własna sesja przez setsid), żeby
-- tmux z automatic-rename nie przemianował okna na nazwę procesu (np. "claude").
-- Ten sam PID po exec, więc Neovim dalej nim zarządza i ubija przy wyjściu.
local function detach_argv(argv)
  if vim.fn.executable("setsid") ~= 1 then
    return argv
  end

  local wrapped = { "setsid" }

  for _, a in ipairs(argv) do
    table.insert(wrapped, a)
  end

  return wrapped
end

-- Uruchom proces dla jednej tury (tryb oneshot, np. opencode). Kontekst
-- między turami trzyma id sesji przekazywane w opts.session.
local function spawn_oneshot(full)
  state.decoder = M.provider.new_decoder()
  state.turn_had_error = false

  local cfg, env = collect_launch()
  local argv = detach_argv(M.provider.command(cfg, { message = full, session = state.session_id }))

  local job = vim.fn.jobstart(argv, {
    cwd = vim.fn.getcwd(),
    env = next(env) and env or nil,
    on_stdout = function(id, data)
      if id ~= state.job or not data then return end

      for _, evt in ipairs(state.decoder(data)) do
        handle_event(evt)
      end
    end,
    on_exit = function(id, code)
      if id ~= state.job then return end

      state.job = nil
      local info = stop_thinking()
      vim.cmd("checktime")
      local suffix = info and (" · %.1fs · %d tok"):format(info.secs, info.tokens) or ""

      if state.interrupt_pending then
        state.interrupt_pending = false
        append_chat({ ("%s przerwano%s"):format(ICON.interrupt, suffix) }, "AgentDim")
      elseif state.turn_had_error then
        -- linia błędu już dopisana przez zdarzenie error
        ring_bell()
      elseif code ~= 0 then
        append_chat({ ("%s proces zakończył się kodem %d"):format(ICON.error, code) }, "AgentError")
        ring_bell()
      elseif info then
        append_chat({ ("%s gotowe%s"):format(ICON.done, suffix) }, "AgentResult")
        ring_bell()
      end
    end,
  })

  if job <= 0 then
    stop_thinking()
    vim.notify(provider_label() .. ": nie udało się uruchomić procesu", vim.log.levels.ERROR)
    return
  end

  state.job = job
end

function M.start()
  if not M.provider then
    vim.notify("Agent: brak wstrzykniętego providera", vim.log.levels.ERROR)
    return
  end

  -- Oneshot: nie ma trwałego procesu — tylko zaznaczamy gotowość
  if is_oneshot() then
    if state.ready then
      vim.notify(("%s: sesja gotowa"):format(provider_label()), vim.log.levels.INFO)
      return
    end

    state.ready = true
    state.session_id = nil
    state.model = (M.provider.config or {}).model
    append_chat({ ("%s sesja gotowa · %s"):format(ICON.ready, state.model or provider_label()) }, "AgentReady")
    pcall(vim.cmd, "redrawstatus")
    return
  end

  if state.job then
    vim.notify(
      ("%s: sesja już działa%s"):format(provider_label(), state.session_id and (" (" .. state.session_id .. ")") or ""),
      vim.log.levels.INFO
    )
    return
  end

  state.decoder = M.provider.new_decoder()
  state.session_id = nil

  local cfg, env = collect_launch()

  local job = vim.fn.jobstart(detach_argv(M.provider.command(cfg)), {
    cwd = vim.fn.getcwd(),
    env = next(env) and env or nil,
    on_stdout = function(id, data)
      -- Ignoruj strumień ze starego procesu po restarcie sesji
      if id ~= state.job or not data then return end

      for _, evt in ipairs(state.decoder(data)) do
        handle_event(evt)
      end
    end,
    on_exit = function(id, code)
      -- Stary proces (po restarcie) — nie ruszaj stanu nowej sesji
      if id ~= state.job then return end

      state.job = nil
      state.session_id = nil
      stop_thinking()
      append_chat({ "", ("%s sesja zakończona (kod %d)"):format(ICON.stop, code) }, "AgentDim")
    end,
  })

  if job <= 0 then
    vim.notify(provider_label() .. ": nie udało się uruchomić procesu", vim.log.levels.ERROR)
    return
  end

  state.job = job
  append_chat({ ("%s uruchamiam sesję %s…"):format(ICON.start, provider_label()) }, "AgentDim")
end

function M.stop()
  if not state.job then
    vim.notify(provider_label() .. ": sesja nie działa", vim.log.levels.INFO)
    return
  end

  vim.fn.jobstop(state.job)
end

local interrupt_seq = 0

-- Przerwij bieżącą turę bez ubijania sesji (jak Ctrl-C w CLI).
function M.interrupt()
  if not state.job or not state.thinking.active then
    return
  end

  -- Oneshot: ubicie procesu tury kończy turę, sesja (na dysku) zostaje
  if is_oneshot() then
    state.interrupt_pending = true
    vim.fn.jobstop(state.job)
    return
  end

  if not M.provider.interrupt_payload then
    vim.notify(provider_label() .. ": provider nie wspiera przerywania", vim.log.levels.WARN)
    return
  end

  interrupt_seq = interrupt_seq + 1
  state.interrupt_pending = true
  vim.fn.chansend(state.job, M.provider.interrupt_payload("int-" .. interrupt_seq) .. "\n")
end

function M.send(text)
  -- Zapewnij działającą/gotową sesję zależnie od trybu
  if is_oneshot() then
    if not state.ready then M.start() end
  elseif not state.job then
    M.start()
  end

  local context = build_context()
  local full = context ~= "" and (context .. "\n\n" .. text) or text

  -- Nowa tura — wyczyść panel agentów w tle z poprzedniej.
  state.bg_agents = {}
  state.bg_index = {}
  render_bg_panel()

  append_speaker(ICON.user, "Ty", "AgentUserHeader", text)
  persist("user", text)
  state.turn_count = state.turn_count + 1
  start_thinking()

  if is_oneshot() then
    spawn_oneshot(full)
  else
    if not state.job then return end
    vim.fn.chansend(state.job, M.provider.encode(full) .. "\n")
  end
end

local function refocus_input()
  if state.input_win and vim.api.nvim_win_is_valid(state.input_win) then
    vim.api.nvim_set_current_win(state.input_win)
    vim.cmd("startinsert")
  end
end

-- Slash-komendy wpisywane w polu (zamiast wysyłania do agenta).
local SLASH = {
  model = function() M.pick_model() end,
  agent = function() M.pick_agent() end,
  new = function() M.fresh() end,
  live = function() M.toggle_live() end,
}

-- Wyślij zawartość okienka wpisywania i wyczyść je (focus zostaje w inpucie).
function M.submit()
  if not state.input_buf or not vim.api.nvim_buf_is_valid(state.input_buf) then
    return
  end

  local text = vim.trim(table.concat(vim.api.nvim_buf_get_lines(state.input_buf, 0, -1, false), "\n"))

  if text == "" then return end

  -- Sama linia typu "/model" → uruchom komendę zamiast wysyłać wiadomość
  local cmd = text:match("^/(%a+)%s*$")

  if cmd then
    vim.api.nvim_buf_set_lines(state.input_buf, 0, -1, false, { "" })

    if SLASH[cmd] then
      SLASH[cmd]()
    else
      vim.notify("Agent: nieznana komenda /" .. cmd .. " (dostępne: /model, /agent, /new, /live)", vim.log.levels.WARN)
      refocus_input()
    end

    return
  end

  vim.api.nvim_buf_set_lines(state.input_buf, 0, -1, false, { "" })
  state.last_user_msg = text
  M.send(text)
  refocus_input()
end

---------------------------------------------------------------------------
-- Wejście: <leader>c / <leader>C
---------------------------------------------------------------------------

-- Zapamiętaj plik, którego dotyczy rozmowa (bufor sprzed otwarcia czatu).
local function remember_target()
  local cur = vim.api.nvim_get_current_buf()

  if vim.bo[cur].buftype == "" and vim.api.nvim_buf_get_name(cur) ~= "" then
    state.target_buf = cur
  end
end

-- Pokaż panel czatu (lub przenieś do niego focus, jeśli już otwarty).
local function show_chat()
  if state.input_win and vim.api.nvim_win_is_valid(state.input_win) then
    vim.api.nvim_set_current_win(state.input_win)
    vim.cmd("startinsert")
    return
  end

  open_layout()
end

-- Czy jest aktywna sesja (dla stream = proces, dla oneshot = flaga ready).
local function session_active()
  if is_oneshot() then return state.ready end
  return state.job ~= nil
end

-- Zakończ bieżącą sesję i wyzeruj jej stan (bez czyszczenia logu).
local function teardown_session()
  if state.job then
    local old = state.job
    state.job = nil -- odetnij callbacki starego procesu (strażnik id)
    pcall(vim.fn.jobstop, old)
  end

  stop_thinking()
  state.ready = false
  state.session_id = nil
  state.model = nil
end

local function clear_log()
  if state.log_buf and vim.api.nvim_buf_is_valid(state.log_buf) then
    vim.bo[state.log_buf].modifiable = true
    vim.api.nvim_buf_set_lines(state.log_buf, 0, -1, false, {})
    vim.bo[state.log_buf].modifiable = false
    pcall(vim.api.nvim_buf_clear_namespace, state.log_buf, ns, 0, -1)
  end
end

-- Podsumowanie dotychczasowej pracy (≤500 znaków) — przekazywane nowemu
-- agentowi/modelowi przy przełączeniu, żeby zachować kontekst.
local function build_summary()
  local parts = {}

  if state.last_user_msg and state.last_user_msg ~= "" then
    table.insert(parts, "Ostatnie polecenie użytkownika: " .. state.last_user_msg)
  end

  local files = vim.tbl_keys(state.touched_files or {})

  if #files > 0 then
    table.insert(parts, "Zmienione pliki: " .. table.concat(files, ", "))
  end

  table.insert(parts, ("Liczba tur: %d"):format(state.turn_count or 0))

  local s = table.concat(parts, ". ")

  if vim.fn.strchars(s) > 500 then
    s = vim.fn.strcharpart(s, 0, 497) .. "..."
  end

  return s
end

-- <leader>c — otwórz/kontynuuj czat (startuje sesję, jeśli żadnej nie ma).
function M.open()
  remember_target()

  if not session_active() then
    M.start()
  end

  show_chat()
end

-- <leader>C — nowy czat: zakończ sesję, wyczyść log i licznik, startuj świeżą.
function M.fresh()
  remember_target()
  teardown_session()
  clear_log()
  state.touched_files = {}
  state.turn_count = 0
  state.last_user_msg = nil
  M.start()
  show_chat()
end

-- Wspólna procedura przełączenia sesji z przekazaniem podsumowania nowemu
-- agentowi/modelowi (używana przez picker agenta i picker modelu).
local function handoff(note)
  local summary = build_summary()
  teardown_session()
  state.touched_files = {}
  state.turn_count = 0
  append_chat({ "", note }, "AgentDim")
  M.start()

  if summary ~= "" then
    M.send("Kontynuujemy pracę — oto podsumowanie dotychczasowej rozmowy (do 500 znaków):\n" .. summary)
  end

  show_chat()
end

-- Picker przez telescope (fallback: vim.ui.select). opts: prompt, format_item.
local function pick(items, opts, on_choice)
  local ok, pickers = pcall(require, "telescope.pickers")

  if not ok then
    vim.ui.select(items, opts, on_choice)
    return
  end

  local finders = require("telescope.finders")
  local conf = require("telescope.config").values
  local actions = require("telescope.actions")
  local action_state = require("telescope.actions.state")

  pickers.new({}, {
    prompt_title = opts.prompt or "Wybierz",
    finder = finders.new_table({
      results = items,
      entry_maker = function(item)
        local display = opts.format_item and opts.format_item(item) or tostring(item)
        return { value = item, display = display, ordinal = display }
      end,
    }),
    sorter = conf.generic_sorter({}),
    attach_mappings = function(bufnr)
      actions.select_default:replace(function()
        local sel = action_state.get_selected_entry()
        actions.close(bufnr)

        if sel then on_choice(sel.value) end
      end)

      return true
    end,
  }):find()
end

-- <C-a> w polu wpisywania — wybór i przełączenie agenta (z podsumowaniem).
function M.pick_agent()
  local names = {}

  for name, _ in pairs(M.providers) do
    if name ~= state.provider_name then
      table.insert(names, name)
    end
  end

  if #names == 0 then
    vim.notify("Agent: brak innych agentów do wyboru", vim.log.levels.INFO)
    return
  end

  table.sort(names)
  pick(names, {
    prompt = "Przełącz agenta (z podsumowaniem)",
    format_item = function(n) return (M.providers[n].label or n) end,
  }, function(choice)
    if not choice then return end

    M.provider = M.providers[choice]
    state.provider_name = choice
    handoff(("%s przełączono na %s"):format(ICON.start, M.provider.label or choice))
  end)
end

-- <C-g> w polu wpisywania — wybór modelu bieżącego agenta.
function M.pick_model()
  if not M.provider or not M.provider.models then
    vim.notify(provider_label() .. ": brak listy modeli", vim.log.levels.WARN)
    return
  end

  local models = M.provider.models(M.provider.config or {})

  if not models or #models == 0 then
    vim.notify(provider_label() .. ": brak modeli", vim.log.levels.INFO)
    return
  end

  pick(models, { prompt = "Model dla " .. provider_label() }, function(choice)
    if not choice then return end

    M.provider.config = M.provider.config or {}
    M.provider.config.model = choice
    handoff(("%s model → %s"):format(ICON.start, choice))
  end)
end

-- /live — przełącz otwieranie okien z podglądem edytowanych plików.
-- Włączone → tryb "flash" (otwórz plik, przewiń, mignij tłem).
-- Wyłączone → wróć do poprzedniego trybu (domyślnie "inline" — blok w czacie).
function M.toggle_live()
  local ep = M.config.edit_preview or {}
  M.config.edit_preview = ep

  if ep.mode == "flash" then
    ep.mode = ep._prev or "inline"
    append_chat({ ("%s live podgląd: wył (tryb: %s)"):format(ICON.stop, tostring(ep.mode)) }, "AgentDim")
  else
    ep._prev = ep.mode
    ep.mode = "flash"
    append_chat({ ("%s live podgląd: wł (otwieram edytowane pliki)"):format(ICON.ready) }, "AgentReady")
  end

  refocus_input()
end

function M.setup(opts)
  opts = opts or {}

  -- Zbuduj zbiór providerów (do przełączania). Akceptuje nazwy z rejestru lub
  -- gotowe moduły. Wstecznie: pojedynczy opts.provider.
  local registry = require("system.agent.providers")
  local specs = opts.providers or (opts.provider and { opts.provider }) or { "claude" }
  M.providers = {}
  local resolved = {}

  for _, spec in ipairs(specs) do
    local p = registry.resolve(spec)

    if p then
      M.providers[p.name] = p
      table.insert(resolved, p)
    else
      vim.notify("Agent: nieznany provider '" .. tostring(spec) .. "'", vim.log.levels.WARN)
    end
  end

  M.provider = (opts.default and M.providers[opts.default]) or resolved[1]

  if not M.provider then
    vim.notify("Agent: brak poprawnego providera", vim.log.levels.ERROR)
    return
  end

  state.provider_name = M.provider.name

  if opts.provider_config and M.provider.config then
    M.provider.config = vim.tbl_deep_extend("force", M.provider.config, opts.provider_config)
  end

  if opts.config then
    M.config = vim.tbl_deep_extend("force", M.config, opts.config)
  end

  if opts.ui then
    M.config = vim.tbl_deep_extend("force", M.config, opts.ui)
  end

  M.skills = {}
  for _, spec in ipairs(opts.skills or {}) do
    local skill = require("system.agent.skills").resolve(spec)

    if skill then
      table.insert(M.skills, skill)
    else
      vim.notify("Agent: nieznany skill '" .. tostring(spec) .. "'", vim.log.levels.WARN)
    end
  end

  setup_highlights()
  vim.api.nvim_create_autocmd("ColorScheme", {
    group = vim.api.nvim_create_augroup("AgentChatHighlights", { clear = true }),
    callback = setup_highlights,
  })

  -- Świadomość aktualnie otwartego pliku: okno agenta jest niezależne od okna
  -- z plikiem, ale zawsze wie, na którym pliku pracujesz (do kontekstu wiadomości).
  vim.api.nvim_create_autocmd({ "BufEnter", "WinEnter" }, {
    group = vim.api.nvim_create_augroup("AgentTrackFile", { clear = true }),
    callback = function(args)
      local b = args.buf or vim.api.nvim_get_current_buf()

      if vim.bo[b].buftype == "" and vim.api.nvim_buf_get_name(b) ~= "" and not SIDEBAR_FT[vim.bo[b].filetype] then
        state.target_buf = b
      end
    end,
  })

  vim.keymap.set("n", "<leader>C", M.fresh, { desc = "Agent: nowy czat (świeża sesja)" })
  vim.keymap.set("n", "<leader>c", M.open, { desc = "Agent: czat" })

  vim.api.nvim_create_user_command("AgentStop", M.stop, {})
  vim.api.nvim_create_user_command("AgentInterrupt", M.interrupt, {})
  vim.api.nvim_create_user_command("AgentSwitch", M.pick_agent, {})
  vim.api.nvim_create_user_command("AgentModel", M.pick_model, {})
  vim.api.nvim_create_user_command("AgentLive", M.toggle_live, {})
  vim.api.nvim_create_user_command("AgentRestart", function()
    M.stop()
    vim.defer_fn(M.start, 200)
  end, {})
end

return M
