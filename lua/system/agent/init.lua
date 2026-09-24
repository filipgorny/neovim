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
--   { kind = "tool",   tool = string, target = string, body = string,
--                       detail = string, label = string }
--                       -- detail ≠ nil → w logu tylko nagłówek `label`,
--                       -- treść po rozwinięciu (<CR>/dblklik), np. komenda basha
--   { kind = "tokens", output_tokens = number }
--   { kind = "question", questions = { { header, question, options, multiSelect } } }
--   { kind = "result", duration_ms = number, output_tokens = number,
--                       error = boolean, message = string }
--
-- Pytania: gdy agent potrzebuje decyzji, w okienku wpisywania pojawia się
-- wyróżniony tłem blok z listą odpowiedzi (j/k, cyfra, ⏎) — patrz question.lua.
-- Wywołanie AskUserQuestion przychodzi w praktyce przez --permission-prompt-tool
-- (patrz permission.lua) i jest obsługiwane W TRAKCIE tury; zdarzenie `question`
-- z providera zostaje jako zapasowa ścieżka „zapytaj po turze".

local M = {}

M.config = {
  chat_width = 0.4,         -- ułamek szerokości ekranu dla kolumny czatu (40%)
  input_height_ratio = 0.15, -- wysokość okienka wpisywania jako ułamek wysokości panelu (15%)
  max_context_lines = 300, -- limit linii na diff / zawartość bufora w kontekście
  persist_history = true,  -- zapisuj rozmowę do SQLite (patrz history.lua)

  -- Doklejane do system-promptu: agent działa headless, więc bez tego pisze
  -- "nie mam potwierdzenia użytkownika" i przerywa zadanie. Z tym — zadaje
  -- pytanie narzędziem, a my pokazujemy listę odpowiedzi do wyboru.
  ask_prompt = table.concat({
    "Pracujesz w edytorze, gdzie użytkownik NIE widzi interaktywnego promptu CLI.",
    "Gdy potrzebujesz jego decyzji (wybór wariantu, potwierdzenie ryzykownej",
    "zmiany, brakujący parametr), NIE pisz, że brakuje Ci potwierdzenia i nie",
    "przerywaj zadania — wywołaj narzędzie AskUserQuestion z 2-4 konkretnymi,",
    "wykluczającymi się opcjami. Wybór użytkownika wróci do Ciebie jako WYNIK",
    "tego wywołania — dokończ wtedy zadanie, nie pytaj drugi raz.",
  }, "\n"),

  -- Agent siedzi w edytorze, nie w CI: build i testy odpala użytkownik, który
  -- ma projekt pod ręką. Bez tego dopisku CLI po każdej zmianie próbuje budować
  -- projekt i puszczać testy, co przy większym repo trwa dłużej niż sama zmiana.
  fast_prompt = table.concat({
    "Pracujesz w edytorze i liczy się czas odpowiedzi — wykonaj polecenie i skończ.",
    "NIE buduj projektu, NIE uruchamiaj testów, linterów, formaterów ani samego",
    "programu, żeby sprawdzić, czy Twoja zmiana działa i czy się kompiluje —",
    "zweryfikuje to użytkownik, który ma projekt otwarty. Nie dopisuj testów,",
    "jeśli o nie nie poprosił. Czytaj tylko te pliki, które są naprawdę potrzebne",
    "do wykonania zmiany, i nie odczytuj z powrotem tego, co przed chwilą zapisałeś.",
    "Na koniec odpowiedz krótko, co zmieniłeś — bez planu weryfikacji.",
  }, "\n"),

  -- Edytor otwiera i podświetla plik tylko przy narzędziach Edit/Write — zmiany
  -- przez Bash (sed -i, python, cat >) przechodzą niezauważone.
  edit_prompt = table.concat({
    "Użytkownik widzi Twoje zmiany na żywo: edytor otwiera plik, który edytujesz.",
    "Zmieniaj pliki WYŁĄCZNIE narzędziami do edycji plików (Edit/Write) — nigdy",
    "przez Bash (sed -i, python, perl, cat >, tee, heredoc).",
    "Edytuj jeden plik na raz: skończ zmiany w jednym pliku, zanim przejdziesz do",
    "następnego. Przed zmianami w pliku napisz jednym krótkim zdaniem, który plik",
    "edytujesz i co w nim zmieniasz.",
  }, "\n"),

  -- Jak pokazywać kod dopisywany przez agenta (Edit/Write):
  --   mode = "flash"  → otwórz plik, przewiń do edycji, mignij tłem dodanego tekstu
  --   mode = "inline" → blok ``` w logu czatu
  --   mode = false    → tylko linia narzędzia, bez treści
  edit_preview = {
    mode = "flash",
    open = true,           -- otwórz edytowany plik w oknie edytora
    scroll = true,         -- przewiń do miejsca edycji
    context_lines = 3,     -- ile linii nad pierwszą zmianą widać po przewinięciu
    flash_ms = 700,        -- jak długo podświetlenie trzyma pełny kolor
    fade_ms = 900,         -- czas wygaszania podświetlenia do tła
    flash_hl = "Search",   -- skąd brać kolor tła podświetlenia (wygasa do tła Normal)
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
  bash = "",
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
  -- Rozwinięta treść zwijanego bloku (np. pełna komenda basha) — bursztyn na
  -- własnym tle, żeby na pierwszy rzut oka odcinała się od reszty logu.
  hl(0, "AgentToolDetail", { fg = "#e0af68", bg = "#1f2335" })
  hl(0, "AgentReady", { fg = "#73daca", italic = true })
  hl(0, "AgentResult", { fg = "#73daca", bold = true })
  hl(0, "AgentError", { fg = "#f7768e", bold = true })
  hl(0, "AgentDim", { fg = "#565f89", italic = true })
  hl(0, "AgentThinking", { fg = "#e0af68", bold = true })
  -- Nazwy plików w wiadomościach: pogrubione, jaskrawe, podkreślone (klikalne).
  hl(0, "AgentFile", { fg = "#7dcfff", bold = true, underline = true })
  require("system.agent.question").setup_highlights()
end

local state = {
  job = nil,
  decoder = nil,
  ready = false,     -- (oneshot) sesja zainicjowana, gotowa na wiadomość
  session_id = nil,
  model = nil,
  provider_name = nil,
  target_buf = nil,  -- bufor pliku, którego dotyczy rozmowa
  root = nil,        -- korzeń projektu = cwd procesu agenta (przypięty na czas sesji)
  selection = nil,   -- zaznaczenie z trybu wizualnego: { rel, ft, first, last, lines }
  log_buf = nil,
  log_win = nil,
  input_buf = nil,
  input_win = nil,
  thinking = { active = false, timer = nil, start_ms = 0, tokens = 0, frame = 1 },
  interrupt_pending = false,
  last_turn_interrupted = false, -- poprzednia tura ubita w połowie pracy
  turn_had_error = false,
  -- śledzenie do podsumowania przy przełączaniu agenta
  last_user_msg = nil,
  turn_count = 0,
  touched_files = {},
  bg_agents = {},   -- lista agentów w tle (Task): { id, desc, status, steps, label }
  bg_index = {},    -- id -> wpis powyżej
  pending_question = nil, -- pytania z AskUserQuestion; pokazywane po turze
  question_answered = false, -- pytanie tej tury poszło już przez permission.lua
  folds = {},       -- extmark id -> { label, group, lines, open } (zwijane bloki w logu)
}

local question = require("system.agent.question")

local bg_ns = vim.api.nvim_create_namespace("agent_bg_panel")
local fold_ns = vim.api.nvim_create_namespace("agent_chat_folds")

local FOLD_CLOSED, FOLD_OPEN = "▸", "▾"

local history = require("system.agent.history")
local reload = require("system.agent.reload")

local function provider_label()
  return (M.provider and (M.provider.label or M.provider.name)) or "Agent"
end

local function is_oneshot()
  return M.provider and M.provider.mode == "oneshot"
end

---------------------------------------------------------------------------
-- Bufory i layout czatu
---------------------------------------------------------------------------

-- Klikanie/otwieranie nazw plików w wiadomościach: <CR>, gf i podwójny klik
-- otwierają plik pod kursorem (z przewinięciem+mignięciem, jeśli jest :linia).
-- Wydzielone, bo blok pytania (question.lua) przejmuje te klawisze na czas
-- wyboru odpowiedzi i po zamknięciu przywraca je tym wywołaniem.
local function install_log_keymaps(buf)
  if not buf or not vim.api.nvim_buf_is_valid(buf) then return end

  local kopts = { buffer = buf, nowait = true, silent = true }

  vim.keymap.set("n", "<CR>", function() M.activate_under_cursor() end, kopts)
  vim.keymap.set("n", "gf", function() M.open_path_under_cursor() end, kopts)
  -- Dwuklik także w trybie INSERT: klikając z okienka wpisywania (gdzie się
  -- pisze), pierwszy klik przenosi okno, ale nvim zostaje w insercie — mapa
  -- normalna nie jest wtedy w ogóle sprawdzana i dwuklik lądował w domyślnym
  -- zaznaczaniu słowa zamiast rozwijać blok.
  vim.keymap.set({ "n", "i" }, "<2-LeftMouse>", function() M.activate_mouse() end, kopts)
  -- q / Q / <Esc> z okna logu zamykają cały panel (oba okna naraz).
  vim.keymap.set("n", "q", function() M.close() end, kopts)
  vim.keymap.set("n", "Q", function() M.close() end, kopts)
  vim.keymap.set("n", "<Esc>", function() M.close() end, kopts)
end

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

  install_log_keymaps(buf)

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
  vim.keymap.set("n", "Q", function() M.close() end, map_opts)
  -- Okienko wpisywania samo wchodzi w insert (autocmd AgentInputInsert), więc
  -- pierwszy <Esc> tylko z niego wychodzi — drugi zamyka panel. Bez tego jedyną
  -- drogą wyjścia było `q`, o czym nie da się zgadnąć, siedząc w insercie.
  vim.keymap.set("n", "<Esc>", function() M.close() end, map_opts)

  -- <C-w>h/j/k/l prosto z insertu: w trybie wpisywania <C-w> kasuje słowo, więc
  -- standardowe przechodzenie między oknami w tym panelu nie działało wcale.
  for _, dir in ipairs({ "h", "j", "k", "l" }) do
    vim.keymap.set("i", "<C-w>" .. dir, function()
      vim.cmd("stopinsert")
      vim.schedule(function() vim.cmd("wincmd " .. dir) end)
    end, map_opts)
  end
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

-- Czy log kończy się pustą linią? Bloki komend basha same otaczają się pustymi
-- liniami, więc dwa z rzędu (albo blok zaraz po świeżym buforze) dałyby podwójny
-- odstęp — sprawdzamy to przed dopisaniem separatora.
local function log_ends_blank()
  local buf = state.log_buf

  if not (buf and vim.api.nvim_buf_is_valid(buf)) then return true end

  local count = vim.api.nvim_buf_line_count(buf)
  local last = vim.api.nvim_buf_get_lines(buf, count - 1, count, false)[1]

  return last == nil or vim.trim(last) == ""
end

---------------------------------------------------------------------------
-- Zwijane bloki w logu
--
-- Długa treść (np. cała komenda basha) nie zaśmieca wąskiej kolumny czatu:
-- w buforze zostaje jedna linia-nagłówek ze strzałką, a treść dopisuje się pod
-- nią dopiero po rozwinięciu (<CR> / podwójny klik). Pozycję nagłówka trzyma
-- extmark, więc przesuwa się sama, gdy inne bloki się rozwijają.
---------------------------------------------------------------------------

-- Odśwież strzałkę ▸/▾ (wirtualny tekst na końcu linii nagłówka).
local function render_fold_chevron(buf, id, lnum0, fold)
  pcall(vim.api.nvim_buf_set_extmark, buf, fold_ns, lnum0, 0, {
    id = id,
    virt_text = { { " " .. (fold.open and FOLD_OPEN or FOLD_CLOSED), "AgentDim" } },
    virt_text_pos = "eol",
  })
end

-- Dopisz nagłówek zwijanego bloku; `detail` to treść pokazywana po rozwinięciu.
local function append_fold(label, detail, group)
  local buf = ensure_log_buf()
  local line0 = append_chat({ label }, group)
  local id = vim.api.nvim_buf_set_extmark(buf, fold_ns, line0, 0, {})

  state.folds[id] = {
    label = label,
    group = group,
    lines = vim.split(vim.trim(detail), "\n", { plain = true }),
    open = false,
  }

  render_fold_chevron(buf, id, line0, state.folds[id])

  return line0
end

-- Znajdź blok, którego dotyczy linia `lnum0`: nagłówek albo (dla rozwiniętych)
-- któraś z linii treści. Zwraca id, wpis i numer linii nagłówka.
local function fold_at(buf, lnum0)
  for id, fold in pairs(state.folds) do
    local pos = vim.api.nvim_buf_get_extmark_by_id(buf, fold_ns, id, {})

    if pos and pos[1] then
      if pos[1] == lnum0 then
        return id, fold, pos[1], true
      end

      if fold.open and lnum0 > pos[1] and lnum0 <= pos[1] + #fold.lines then
        return id, fold, pos[1], false
      end
    end
  end
end

local function toggle_fold(buf, id, fold, head)
  vim.bo[buf].modifiable = true

  if fold.open then
    -- Najpierw zdejmij podświetlenia treści: extmarki z usuwanych linii
    -- inaczej „spadłyby” na linię pod nagłówkiem i pokolorowały cudzy tekst.
    pcall(vim.api.nvim_buf_clear_namespace, buf, ns, head + 1, head + 1 + #fold.lines)
    vim.api.nvim_buf_set_lines(buf, head + 1, head + 1 + #fold.lines, false, {})
  else
    local body = {}

    for _, l in ipairs(fold.lines) do
      table.insert(body, "  " .. l)
    end

    vim.api.nvim_buf_set_lines(buf, head + 1, head + 1, false, body)

    for i = 0, #body - 1 do
      hl_line(buf, head + 1 + i, "AgentToolDetail")
    end
  end

  vim.bo[buf].modifiable = false
  fold.open = not fold.open
  render_fold_chevron(buf, id, head, fold)
  render_bg_panel()
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
  local sel = state.selection
  local sel_txt = sel and string.format("   —   ✂ %s:%d-%d", sel.rel, sel.first, sel.last) or ""

  return string.format(
    "%%#AgentDim#  ⏎ wyślij · ⇧⏎ nowa linia · q zamknij   —   %s%s%%*",
    model, sel_txt
  )
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

-- Wylicz i zastosuj rozmiary paneli czatu: kolumna po prawej = 40% szerokości
-- ekranu, okienko wpisywania = 15% wysokości panelu. Wołane przy otwarciu
-- layoutu ORAZ przy każdej zmianie rozmiaru terminala (VimResized), żeby
-- proporcje trzymały się automatycznie.
--
-- Jeśli użytkownik ręcznie zmieni szerokość kolumny (mysz, <C-w>< / >), jego
-- proporcja wygrywa — zapamiętujemy ją w state.width_ratio i to ona jest
-- utrzymywana przy kolejnych zmianach rozmiaru terminala.
local function apply_layout_size()
  if state.log_win and vim.api.nvim_win_is_valid(state.log_win) then
    local w = math.max(10, math.floor(vim.o.columns * (state.width_ratio or M.config.chat_width)))
    vim.api.nvim_win_set_width(state.log_win, w)
    state.applied_width = vim.api.nvim_win_get_width(state.log_win)
  end

  if state.input_win and vim.api.nvim_win_is_valid(state.input_win) then
    local h = math.max(3, math.floor(vim.o.lines * M.config.input_height_ratio))
    vim.api.nvim_win_set_height(state.input_win, h)
  end
end

-- Wykryj ręczny resize kolumny czatu: jeśli jej szerokość różni się od tej,
-- którą sami ostatnio ustawiliśmy, to znaczy, że zmienił ją użytkownik —
-- zapisujemy jego proporcję. Zmiany wywołane przez nas samych (albo przez
-- resize całego terminala, po którym i tak zaraz nakładamy layout) pomijamy.
local function track_manual_resize()
  if state.suppress_resize_track then return end

  if not (state.log_win and vim.api.nvim_win_is_valid(state.log_win)) then return end

  local w = vim.api.nvim_win_get_width(state.log_win)

  if state.applied_width and w ~= state.applied_width and vim.o.columns > 0 then
    state.width_ratio = w / vim.o.columns
    state.applied_width = w
  end
end

local function open_layout()
  local log_buf = ensure_log_buf()
  local input_buf = ensure_input_buf()

  -- Kolumna po prawej z logiem
  vim.cmd("botright vsplit")
  state.log_win = vim.api.nvim_get_current_win()
  vim.api.nvim_win_set_buf(state.log_win, log_buf)
  vim.wo[state.log_win].wrap = true
  vim.wo[state.log_win].number = false
  vim.wo[state.log_win].relativenumber = false
  vim.wo[state.log_win].signcolumn = "no"
  vim.wo[state.log_win].fillchars = "eob: "
  -- Trzymaj szerokość kolumny: zwykłe :split/:vsplit w edytorze (equalalways)
  -- nie mają przestawiać panelu — ręczny resize użytkownika nadal działa.
  vim.wo[state.log_win].winfixwidth = true
  -- Zablokuj podmianę bufora w tym oknie (żeby :edit/agent nie otworzył tu pliku)
  pcall(function() vim.wo[state.log_win].winfixbuf = true end)

  -- Okienko wpisywania pod logiem
  vim.cmd("belowright split")
  state.input_win = vim.api.nvim_get_current_win()
  vim.api.nvim_win_set_buf(state.input_win, input_buf)
  vim.wo[state.input_win].wrap = true
  vim.wo[state.input_win].number = false
  vim.wo[state.input_win].relativenumber = false
  vim.wo[state.input_win].signcolumn = "no"
  vim.wo[state.input_win].fillchars = "eob: "
  vim.wo[state.input_win].winfixwidth = true
  vim.wo[state.input_win].winfixheight = true
  vim.wo[state.input_win].winbar = "%!v:lua.require'system.agent'.statusbar()"
  pcall(function() vim.wo[state.input_win].winfixbuf = true end)

  apply_layout_size()

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

-- Czy plik był edytowany przez agenta w tej sesji? Bez tego git diff w
-- kontekście wygląda jak zmiany napisane przez usera — a po przerwanej turze
-- to najczęściej własna robota agenta.
local function agent_touched(path)
  local want = vim.fn.fnamemodify(path, ":p")

  for touched in pairs(state.touched_files or {}) do
    if vim.fn.fnamemodify(touched, ":p") == want then
      return true
    end
  end

  return false
end

-- Korzeń projektu — katalog roboczy procesu agenta.
--
-- Claude wczytuje reguły (CLAUDE.md) i pamięć projektu idąc od swojego cwd
-- W GÓRĘ, nigdy w dół. Gdyby cwd procesu było cwd nvima, edytor odpalony
-- w ~ (albo z panelem czatu mającym własne :lcd) puszczałby agenta bez reguł
-- repozytorium, w którym faktycznie pracujesz. Dlatego korzeń liczymy
-- z bufora rozmowy, a getcwd() zostaje fallbackiem.
local ROOT_MARKERS = { ".git", "CLAUDE.md", ".claude" }

local function detect_root()
  local buf = state.target_buf

  if not (buf and vim.api.nvim_buf_is_valid(buf)) then
    buf = vim.api.nvim_get_current_buf()
  end

  if vim.api.nvim_buf_is_valid(buf) and vim.bo[buf].buftype == "" then
    local name = vim.api.nvim_buf_get_name(buf)

    if name ~= "" then
      local root = vim.fs.root(vim.fs.dirname(name), ROOT_MARKERS)

      if root then
        return root
      end
    end
  end

  return vim.fn.getcwd()
end

-- Korzeń przypinamy na całą sesję: --resume musi wracać do tego samego cwd,
-- a ścieżki w kontekście nie mogą przesuwać się w połowie rozmowy. Nowy czat
-- (<leader>C) czyści przypięcie, więc korzeń liczy się od nowa.
local function session_root()
  if not state.root then
    state.root = detect_root()
  end

  return state.root
end

-- Ścieżka względem korzenia projektu. fnamemodify(":.") liczy od cwd nvima,
-- które nie musi być cwd agenta — model dostałby ścieżkę, której u siebie nie
-- znajdzie. Plik spoza korzenia zostaje absolutny (jednoznaczny).
local function rel_path(path)
  if not path or path == "" then
    return path
  end

  return vim.fs.relpath(session_root(), path) or path
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

  local rel = rel_path(name)
  local ft = vim.bo[buf].filetype
  local parts = {
    "[Editor context — attached automatically by the editor, not written by the user]",
    ("Open file: %s%s"):format(rel, ft ~= "" and (" (filetype: " .. ft .. ")") or ""),
    "This is the file the user is looking at right now. Unless the message names "
      .. "another file, deictic requests (\"add this\", \"fix it\", \"here\", \"dopisz\", "
      .. "\"popraw to\") refer to THIS file — act on it instead of asking which file is meant.",
  }

  if state.last_turn_interrupted then
    table.insert(parts, "NOTE: your previous turn was interrupted by the user mid-work. "
      .. "Files you had already changed are on disk as YOUR edits — do not read them back as the user's own work.")
  end

  local sel = state.selection

  -- Zaznaczenie jest precyzyjniejsze od kursora — gdy jest, pokazujemy je
  -- zamiast pozycji kursora (kursor i tak stoi na jednym z jego końców).
  if sel then
    table.insert(parts, "")
    table.insert(parts, ("The user selected lines %d-%d of %s and is asking about THAT selection — "):format(sel.first, sel.last, sel.rel)
      .. "it is the target of the request, not the whole file:")
    table.insert(parts, "```" .. (sel.ft ~= "" and sel.ft or ""))
    vim.list_extend(parts, truncate(sel.lines))
    table.insert(parts, "```")
  else
    for _, win in ipairs(vim.api.nvim_list_wins()) do
      if vim.api.nvim_win_get_buf(win) == buf then
        local row = vim.api.nvim_win_get_cursor(win)[1]
        table.insert(parts, ("Cursor at line %d."):format(row))
        break
      end
    end
  end

  local diff = vim.fn.systemlist({ "git", "diff", "HEAD", "--", name })

  if vim.v.shell_error == 0 and #diff > 0 then
    table.insert(parts, "")

    if agent_touched(name) then
      table.insert(parts, "Uncommitted changes in this file (git diff HEAD) — this file was edited by YOU "
        .. "earlier in this session, so these changes are (at least partly) your own, not the user's:")
    else
      table.insert(parts, "Uncommitted changes in this file (git diff HEAD), authored by the user:")
    end
    table.insert(parts, "```diff")
    vim.list_extend(parts, truncate(diff))
    table.insert(parts, "```")
  end

  if vim.bo[buf].modified then
    table.insert(parts, "")
    table.insert(parts, "NOTE: the buffer has UNSAVED changes — the file on disk is stale. "
      .. "Edit/Write still operate on the file ON DISK, so anchor your edits (old_string) in the "
      .. "disk version, not in the buffer text below. Do NOT re-type the user's unsaved changes: "
      .. "the editor 3-way merges your saved version with them, so writing them again would "
      .. "duplicate them or cause a conflict. Use the buffer contents below only to understand "
      .. "what the user is working on:")
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

local FADE_STEPS = 12

-- Kolor tła grupy (z rozwiązaniem linków) albo nil.
local function hl_bg(name)
  local ok, hl = pcall(vim.api.nvim_get_hl, 0, { name = name, link = false })

  return ok and hl and hl.bg or nil
end

-- Mieszanka dwóch kolorów 0xRRGGBB: t = 0 → from, t = 1 → to.
local function blend(from, to, t)
  local function ch(c, shift)
    return math.floor(c / 2 ^ shift) % 256
  end

  local out = 0

  for _, shift in ipairs({ 16, 8, 0 }) do
    local v = math.floor(ch(from, shift) + (ch(to, shift) - ch(from, shift)) * t + 0.5)
    out = out + v * 2 ^ shift
  end

  return out
end

-- Podświetla tłem `count` linii od first0 (0-indeks): kolor grupy `hl` trzyma
-- się `ms` ms, potem przez `fade_ms` ciemnieje do tła Normal i znika.
local function flash_lines(buf, first0, count, hl, ms, fade_ms)
  local cfg = M.config.edit_preview or {}
  fade_ms = fade_ms or cfg.fade_ms or 900

  local last = vim.api.nvim_buf_line_count(buf) - 1
  local from = hl_bg(hl)
  local to = hl_bg("Normal") or 0

  -- Grupy kolejnych kroków wygaszania (przeliczane przy każdym podświetleniu,
  -- bo motyw mógł się zmienić).
  -- Krok 0 to pełny kolor; tylko tło, żeby tekst zachował kolory składni.
  if from then
    for i = 0, FADE_STEPS do
      vim.api.nvim_set_hl(0, "AgentEditFade" .. i, { bg = blend(from, to, i / FADE_STEPS) })
    end
  end

  local marks = {}

  for l = first0, math.min(first0 + count - 1, last) do
    local ok, id = pcall(vim.api.nvim_buf_set_extmark, buf, flash_ns, l, 0, {
      line_hl_group = from and "AgentEditFade0" or hl,
      priority = 500,
    })

    if ok then
      marks[id] = l
    end
  end

  local function clear()
    if not vim.api.nvim_buf_is_valid(buf) then return end

    for id in pairs(marks) do
      pcall(vim.api.nvim_buf_del_extmark, buf, flash_ns, id)
    end
  end

  -- Motyw bez tła w grupie: nie ma czego wygaszać, samo zniknięcie.
  if not from then
    vim.defer_fn(clear, ms)

    return
  end

  local function step(i)
    if not vim.api.nvim_buf_is_valid(buf) then return end

    if i > FADE_STEPS then
      clear()

      return
    end

    for id in pairs(marks) do
      local pos = vim.api.nvim_buf_get_extmark_by_id(buf, flash_ns, id, {})

      if pos[1] then
        pcall(vim.api.nvim_buf_set_extmark, buf, flash_ns, pos[1], 0, {
          id = id,
          line_hl_group = "AgentEditFade" .. i,
          priority = 500,
        })
      end
    end

    vim.defer_fn(function() step(i + 1) end, math.floor(fade_ms / FADE_STEPS))
  end

  vim.defer_fn(function() step(1) end, ms)
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
    -- Wyczyść bufor specjalny / winfixbuf / winfix{width,height} odziedziczone
    -- po panelu, z którego powstał split, żeby dało się otworzyć plik i żeby
    -- okno edytora normalnie się skalowało.
    pcall(function() vim.wo[w].winfixbuf = false end)
    vim.wo[w].winfixwidth = false
    vim.wo[w].winfixheight = false

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
    flash_lines(fbuf, target - 1, 1, cfg.flash_hl or "Search", cfg.flash_ms or 700)
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

-- <CR> / podwójny klik w logu: najpierw zwijany blok (np. komenda basha),
-- potem ścieżka pod kursorem. Kliknięcie w rozwiniętą treść ją zwija.
function M.activate_under_cursor()
  local buf = vim.api.nvim_get_current_buf()

  if buf ~= state.log_buf then
    return M.open_path_under_cursor()
  end

  local lnum0 = vim.api.nvim_win_get_cursor(0)[1] - 1
  local id, fold, head, is_header = fold_at(buf, lnum0)

  if id and is_header then
    return toggle_fold(buf, id, fold, head)
  end

  local line = vim.api.nvim_get_current_line()

  if #scan_paths(line) > 0 then
    return M.open_path_under_cursor()
  end

  if id then
    toggle_fold(buf, id, fold, head)
  end
end

-- Dwuklik myszą w log. Cel bierzemy z POZYCJI MYSZY, nie z kursora: klikając z
-- okienka wpisywania, w chwili sprawdzania mapy jesteśmy jeszcze w tamtym oknie
-- (pierwszy klik dopiero przenosi focus), więc kursor logu wskazuje co innego.
function M.activate_mouse()
  local mp = vim.fn.getmousepos()
  local win = mp.winid

  if not (win and win ~= 0 and vim.api.nvim_win_is_valid(win)) then return end

  if vim.api.nvim_win_get_buf(win) ~= state.log_buf or (mp.line or 0) <= 0 then
    return
  end

  vim.cmd("stopinsert")
  vim.api.nvim_set_current_win(win)
  pcall(vim.api.nvim_win_set_cursor, win, { mp.line, math.max((mp.column or 1) - 1, 0) })

  M.activate_under_cursor()
end

-- Linie tekstu narzędzia bez pustego ogona po końcowym "\n".
local function text_lines(text)
  local lines = vim.split(text or "", "\n", { plain = true })

  if #lines > 1 and lines[#lines] == "" then
    table.remove(lines)
  end

  return lines
end

-- Ile linii na początku i na końcu body pokrywa się z before — to kontekst,
-- który model dokleja do Edit, a nie zmiana. Zwraca lead, trail.
local function common_edges(before, body)
  local lead, trail = 0, 0

  while lead < #before and lead < #body and before[lead + 1] == body[lead + 1] do
    lead = lead + 1
  end

  while trail < #before - lead and trail < #body - lead
    and before[#before - trail] == body[#body - trail] do
    trail = trail + 1
  end

  return lead, trail
end

-- Pierwsza linia (1-indeks), od której plik zawiera cały blok `block`.
local function find_block(lines, block)
  for i = 1, #lines - #block + 1 do
    local hit = true

    for j = 1, #block do
      if lines[i + j - 1] ~= block[j] then
        hit = false

        break
      end
    end

    if hit then return i end
  end

  return nil
end

-- Otwiera edytowany plik, przewija do pierwszej zmienionej linii i podświetla
-- zmienione linie. Best-effort: zapis agenta na dysk jest asynchroniczny, więc
-- próbujemy kilka razy, aż dopisany tekst pojawi się w pliku.
local function preview_edit(path, body, before)
  local cfg = M.config.edit_preview or {}

  if not path or path == "" or not body or body == "" then return end

  -- Podgląd tylko, gdy siedzisz w okienku promptu — pracując w innym oknie nie
  -- chcesz, żeby agent podmieniał Ci otwarty plik.
  local function in_input()
    return state.input_win ~= nil and vim.api.nvim_get_current_win() == state.input_win
  end

  if not in_input() then return end

  local win = get_editor_win(true)

  if not win then return end

  local abs = vim.fn.fnamemodify(path, ":p")
  local body_lines = text_lines(body)
  local lead, trail = common_edges(before and text_lines(before) or {}, body_lines)
  -- Czyste usunięcie linii (nic nowego) — pokazujemy miejsce, bez podświetlenia.
  local changed = math.max(#body_lines - lead - trail, 0)

  -- Zapasowo, gdy blok w pliku nie pasuje 1:1 (np. formatter po zapisie).
  local needle
  for i = lead + 1, #body_lines do
    if vim.trim(body_lines[i]) ~= "" then needle = vim.trim(body_lines[i]); break end
  end

  local attempts = 0
  local function try()
    attempts = attempts + 1

    -- Między próbami mogłeś przejść do innego okna.
    if not in_input() or not vim.api.nvim_win_is_valid(win) then return end

    vim.api.nvim_win_call(win, function()
      vim.cmd("silent! checktime")
      local cur = vim.fn.fnamemodify(vim.api.nvim_buf_get_name(0), ":p")

      if cur ~= abs and cfg.open ~= false then
        pcall(vim.cmd, "silent! edit " .. vim.fn.fnameescape(abs))
      end
    end)

    -- Zmodyfikowany bufor nie da się przeładować (:e bez ! to E37) — reload
    -- scali wersję agenta z Twoimi niezapisanymi zmianami.
    reload.sync(abs)

    local buf = vim.api.nvim_win_get_buf(win)
    local lines = vim.api.nvim_buf_get_lines(buf, 0, -1, false)
    local block_at = find_block(lines, body_lines)
    local first

    if block_at then
      first = block_at + lead
    elseif needle then
      for i, l in ipairs(lines) do
        if vim.trim(l) == needle then first = i; break end
      end
    end

    if not first then
      if attempts < 10 then vim.defer_fn(try, 300) end
      return
    end

    first = math.max(1, math.min(first, #lines))

    -- Pierwsza zmiana u góry okna, z kilkoma liniami kontekstu nad nią.
    if cfg.scroll ~= false then
      vim.api.nvim_win_call(win, function()
        pcall(vim.fn.winrestview, {
          lnum = first,
          col = 0,
          topline = math.max(1, first - (cfg.context_lines or 3)),
        })
      end)
    end

    -- Zmiana obejmuje cały plik (nowy plik, Write nadpisujący całość) —
    -- podświetlanie wszystkiego nic nie mówi, więc go nie ma.
    if changed == 0 or changed >= #lines then return end

    flash_lines(buf, first - 1, changed, cfg.flash_hl or "Search", cfg.flash_ms or 700)
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

-- Zdefiniowane niżej (potrzebne już tutaj — po wyborze odpowiedzi wracamy
-- focusem do okienka wpisywania).
local refocus_input

-- Bufor, w którym renderuje się blok pytania. Podmieniany na czas pytania w
-- OKIENKU WPISYWANIA — decyzja pojawia się tam, gdzie i tak trzymasz ręce.
local function ensure_question_buf()
  if state.question_buf and vim.api.nvim_buf_is_valid(state.question_buf) then
    return state.question_buf
  end

  local buf = vim.api.nvim_create_buf(false, true)
  vim.bo[buf].buftype = "nofile"
  vim.bo[buf].bufhidden = "hide"
  vim.bo[buf].swapfile = false
  vim.bo[buf].modifiable = false
  pcall(vim.api.nvim_buf_set_name, buf, "agent://question")

  state.question_buf = buf
  return buf
end

local function set_input_win_buf(buf)
  local win = state.input_win

  pcall(function() vim.wo[win].winfixbuf = false end)
  vim.api.nvim_win_set_buf(win, buf)
  pcall(function() vim.wo[win].winfixbuf = true end)
end

-- Wstaw bufor pytania do okienka wpisywania, zapamiętując, do czego wrócić.
local function enter_question_mode()
  local win = state.input_win

  if not (win and vim.api.nvim_win_is_valid(win)) then return nil end

  local qbuf = ensure_question_buf()

  state.input_restore = {
    cursor = vim.api.nvim_win_get_cursor(win),
    height = vim.api.nvim_win_get_height(win),
    insert = vim.api.nvim_get_current_win() == win and vim.fn.mode():sub(1, 1) == "i",
  }

  vim.cmd("stopinsert")
  set_input_win_buf(qbuf)

  return qbuf
end

-- Blok pytania bywa wyższy niż okienko wpisywania — podrastamy je do połowy
-- ekranu, a reszta (jeśli nadal się nie mieści) po prostu się przewija.
--
-- Liczymy WIERSZE EKRANU, nie linie bufora: kolumna czatu jest wąska i ma
-- wrap=true, więc treść pytania oraz opisy opcji zawijają się na kilka wierszy
-- (11 linii bufora potrafi zająć 17 wierszy). Wysokość liczona z linii bufora
-- robiła okienko za niskie — widok przewijał się do zaznaczonej opcji, a
-- nagłówek i treść pytania znikały ponad górną krawędzią.
local function fit_question_win(line_count)
  local win = state.input_win

  if not (win and vim.api.nvim_win_is_valid(win)) then return end

  local max = math.max(5, math.floor(vim.o.lines * 0.5))
  local ok, height = pcall(function() return vim.api.nvim_win_text_height(win, {}).all end)
  local needed = (ok and type(height) == "number" and height > 0) and height or line_count

  vim.api.nvim_win_set_height(win, math.min(math.max(needed, 3), max))
end

-- Wróć okienkiem wpisywania do trybu sprzed pytania (bufor, kursor, insert).
local function leave_question_mode()
  local r = state.input_restore or {}
  state.input_restore = nil

  local win = state.input_win

  if not (win and vim.api.nvim_win_is_valid(win)) then return end

  if r.height then
    pcall(vim.api.nvim_win_set_height, win, r.height)
  end

  if state.input_buf and vim.api.nvim_buf_is_valid(state.input_buf) then
    set_input_win_buf(state.input_buf)
    pcall(vim.api.nvim_win_set_cursor, win, r.cursor or { 1, 0 })
  end

  vim.api.nvim_set_current_win(win)

  if r.insert ~= false then
    vim.cmd("startinsert")
  end
end

-- Pokaż listę odpowiedzi z AskUserQuestion. Wołane dopiero po zakończeniu tury:
-- w trybie oneshot proces już nie żyje, więc wybór wraca do modelu jako kolejna
-- wiadomość (kontekst trzyma --resume).
-- Blok pytania zajmuje na chwilę okienko wpisywania (jest niskie — lista może
-- się przewijać), a podsumowanie wyboru ląduje w logu. Wspólne wejście dla
-- pytań modelu (AskUserQuestion) i próśb o zgodę (permission.lua). Zwraca
-- false, gdy inne pytanie właśnie zajmuje UI — wołający decyduje, czy ponowić.
function M.ask_question(questions, on_done, on_cancel)
  if question.is_active() then return false end

  local qbuf = enter_question_mode()

  -- Panel czatu zamknięty — question.ask spadnie na vim.ui.select.
  if not qbuf then
    return question.ask({
      questions = questions,
      on_done = on_done,
      on_cancel = on_cancel,
    })
  end

  local shown = question.ask({
    buf = qbuf,
    win = state.input_win,
    own_buf = true,
    questions = questions,
    on_summary = function(summary, group)
      append_chat({ summary }, group)
    end,
    on_render = fit_question_win,
    on_close = function()
      install_log_keymaps(state.log_buf)
      leave_question_mode()
    end,
    on_done = function(text, answers)
      on_done(text, answers)
    end,
    on_cancel = function()
      if on_cancel then on_cancel() end
    end,
  })

  -- Nie udało się pokazać bloku (np. puste pytania) — nie zostawiaj okienka
  -- wpisywania w trybie pytania.
  if not shown then
    leave_question_mode()
  end

  return shown
end

-- Woła permission.lua, gdy pytanie modelu zostało pokazane W LOCIE (CLI w trybie
-- -p przepuszcza AskUserQuestion przez --permission-prompt-tool). Provider widzi
-- to samo wywołanie jako zdarzenie `question`, więc bez tego znacznika po turze
-- wyskoczyłoby drugie, identyczne pytanie.
function M.mark_question_handled()
  state.question_answered = true
  state.pending_question = nil
end

local function ask_pending_question()
  local questions = state.pending_question

  if state.question_answered then
    state.pending_question = nil

    return
  end

  if not questions or question.is_active() then return end

  state.pending_question = nil

  M.ask_question(questions, function(text)
    state.last_user_msg = text
    M.send(text)
  end)
end

local function handle_event(evt)
  if evt.kind == "ready" then
    state.session_id = evt.session_id
    state.model = evt.model
    append_chat({ ("%s sesja gotowa · %s · %s"):format(
      ICON.ready, evt.model or "?", vim.fn.fnamemodify(session_root(), ":~")
    ) }, "AgentReady")
    pcall(vim.cmd, "redrawstatus")
    return
  end

  -- (oneshot) id sesji do kontynuacji kolejnej tury; (stream) start kolejnej
  -- tury — gdy bez wiadomości usera (np. po zadaniu w tle), włącz spinner.
  if evt.kind == "session" then
    state.session_id = evt.session_id

    if not state.thinking.active then
      start_thinking()
    end

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

  -- Pytanie do użytkownika: odkładamy je na koniec tury, żeby lista odpowiedzi
  -- nie wskoczyła w środek lecącego jeszcze strumienia.
  if evt.kind == "question" then
    state.pending_question = evt.questions
    return
  end

  if evt.kind == "tool" then
    local icon = TOOL_ICON[evt.tool] or ""

    -- Komenda basha potrafi mieć kilka linii i pipe'ów — pokazujemy ją w
    -- całości, oddzieloną pustymi liniami od reszty logu.
    if evt.detail and evt.detail ~= "" then
      local block = log_ends_blank() and {} or { "" }

      -- Ikona tylko przy pierwszej linii, kolejne wcięte pod nią.
      for i, l in ipairs(vim.split(vim.trim(evt.detail), "\n", { plain = true })) do
        table.insert(block, i == 1 and ("%s %s"):format(icon, l) or ("  %s"):format(l))
      end

      table.insert(block, "")
      append_chat(block, "AgentTool")

      return
    end

    local target = (evt.target and evt.target ~= "") and (" " .. evt.target) or ""
    append_chat({ ("%s %s%s"):format(icon, evt.tool or "tool", target) }, "AgentTool")

    if evt.target and evt.target ~= "" then
      reload.mark(evt.target, session_root())

      if evt.body then
        state.touched_files[evt.target] = true
      end
    end

    -- Pokaż dopisywany kod wg trybu z konfiguracji
    if evt.body and evt.body ~= "" then
      local mode = M.config.edit_preview and M.config.edit_preview.mode

      if mode == "flash" then
        preview_edit(evt.target, evt.body, evt.before)
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
    -- Przeładuj / scal bufory zmienione przez agenta na dysku
    vim.cmd("checktime")
    reload.turn_end()

    local suffix = info and (" · %.1fs · %d tok"):format(info.secs, info.tokens) or ""

    if state.interrupt_pending then
      state.interrupt_pending = false
      state.last_turn_interrupted = true
      append_chat({ ("%s przerwano%s"):format(ICON.interrupt, suffix) }, "AgentDim")
    elseif evt.error then
      append_chat({ ("%s błąd: %s"):format(ICON.error, tostring(evt.message)) }, "AgentError")
      vim.notify(provider_label() .. ": błąd tury — " .. tostring(evt.message), vim.log.levels.ERROR)
      ring_bell()
    elseif info then
      append_chat({ ("%s gotowe%s"):format(ICON.done, suffix) }, "AgentResult")
      ring_bell()
    end

    -- Oneshot dopisuje jeszcze linie w on_exit — tam wołamy pytanie, żeby blok
    -- z odpowiedziami został ostatni w buforze (renderuje się w miejscu).
    if not is_oneshot() then
      ask_pending_question()
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
  local mcp = {}   -- name -> definicja serwera MCP (wnoszone przez skille)

  if M.config.ask_prompt and M.config.ask_prompt ~= "" then
    table.insert(prompts, M.config.ask_prompt)
  end

  if M.config.fast_prompt and M.config.fast_prompt ~= "" then
    table.insert(prompts, M.config.fast_prompt)
  end

  if M.config.edit_prompt and M.config.edit_prompt ~= "" then
    table.insert(prompts, M.config.edit_prompt)
    -- Osobno dla providerów bez system-promptu (opencode dokleja do wiadomości).
    cfg.edit_prompt = M.config.edit_prompt
  end

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

    -- Skill może wystawić serwer MCP (nazwa + jak go odpalić + jego narzędzia).
    -- Rejestrujemy definicję i dopuszczamy jego tools jako mcp__<serwer>__<tool>.
    if skill.mcp then
      local spec = skill.mcp(ctx)

      if spec and spec.name then
        -- Serwer zdalny (Figma) niesie adres zamiast komendy — nie ma procesu
        -- do odpalenia, a autoryzację (OAuth) CLI bierze ze swojego magazynu
        -- poświadczeń po nazwie serwera. Serwer lokalny jedzie po stdio.
        if spec.url and spec.url ~= "" then
          mcp[spec.name] = { type = spec.type or "http", url = spec.url, headers = spec.headers }
        else
          mcp[spec.name] = { command = spec.command, args = spec.args or {}, env = spec.env }
        end

        for _, t in ipairs(spec.tools or {}) do
          tools["mcp__" .. spec.name .. "__" .. t] = true
        end

        -- Skill może wystawić narzędzie pytające usera o zgodę. Dzięki niemu
        -- tool spoza allowlisty nie jest po cichu odrzucany — CLI woła to
        -- narzędzie, a ono pokazuje w czacie listę odpowiedzi (permission.lua).
        if spec.permission_tool then
          local full = "mcp__" .. spec.name .. "__" .. spec.permission_tool
          cfg.permission_prompt_tool = full
          tools[full] = true
        end
      end
    end
  end

  cfg.allowed_tools = table.concat(vim.tbl_keys(tools), ",")

  if #prompts > 0 then
    cfg.append_system_prompt = table.concat(prompts, "\n\n")
  end

  -- Złóż plik --mcp-config z zebranych serwerów (provider zdecyduje, czy go użyje).
  if next(mcp) then
    local path = vim.fn.stdpath("cache") .. "/agent-mcp.json"
    local fh = io.open(path, "w")

    if fh then
      fh:write(vim.json.encode({ mcpServers = mcp }))
      fh:close()
      cfg.mcp_config = path
    end
  end

  return cfg, env
end

-- Odetnij proces agenta od terminala pane'a (własna sesja przez setsid), żeby
-- tmux z automatic-rename nie przemianował okna na nazwę procesu (np. "claude").
-- WAŻNE: flaga -w (--wait) jest konieczna — bez niej setsid forkuje dziecko do
-- nowej sesji i NATYCHMIAST kończy się z kodem 0. Neovim widzi wtedy wyjście
-- wrappera po ~1ms, zamyka pipe'y, a odłączony proces pisze donikąd (objaw:
-- "gotowe · 0.0s · 0 tok" bez odpowiedzi). Z -w setsid czeka na dziecko i
-- przekazuje jego stdout oraz kod wyjścia.
local function detach_argv(argv)
  if vim.fn.executable("setsid") ~= 1 then
    return argv
  end

  local wrapped = { "setsid", "-w" }

  for _, a in ipairs(argv) do
    table.insert(wrapped, a)
  end

  return wrapped
end

-- Ubij CAŁE drzewo procesów zadania. setsid -w odcina claude do nowej sesji,
-- więc samo jobstop kładzie tylko wrapper setsid — claude (lider tej sesji)
-- zostaje sierotą i dalej mieli prompt. Kolejny send startuje wtedy drugiego
-- claude i dwa procesy pracują nad tym samym promptem. Dlatego oprócz jobstop
-- wyłuskujemy pid claude (dziecko wrappera) i ubijamy jego grupę procesów
-- (claude + odpalone przez niego narzędzia).
local function kill_job_tree(job)
  if not job then return end

  local ok, wrapper = pcall(vim.fn.jobpid, job)

  pcall(vim.fn.jobstop, job)

  if not ok or type(wrapper) ~= "number" or wrapper <= 0 then
    return
  end

  for _, line in ipairs(vim.fn.systemlist({ "pgrep", "-P", tostring(wrapper) })) do
    local pid = tonumber(line)

    if pid then
      pcall(vim.fn.system, { "kill", "-TERM", "-" .. pid }) -- grupa (claude liderem sesji)
      pcall(vim.fn.system, { "kill", "-TERM", tostring(pid) })
    end
  end
end

-- Uruchom proces dla jednej tury (tryb oneshot, np. opencode). Kontekst
-- między turami trzyma id sesji przekazywane w opts.session.
local function spawn_oneshot(full)
  -- Gwarancja jednego procesu: jeśli poprzednia tura wciąż żyje (podwójny
  -- submit, wyścig, sierota po setsid), ubij ją W CAŁOŚCI, zanim wystartujemy
  -- nową. Na wierzchu zostaje wyłącznie świeżo uruchomiona tura.
  if state.job then
    local old = state.job
    state.job = nil -- odetnij callbacki starego procesu (strażnik id)
    kill_job_tree(old)
  end

  state.decoder = M.provider.new_decoder()
  state.turn_had_error = false

  local cfg, env = collect_launch()
  local argv = detach_argv(M.provider.command(cfg, { message = full, session = state.session_id }))

  local job = vim.fn.jobstart(argv, {
    cwd = session_root(),
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
      reload.turn_end()
      local suffix = info and (" · %.1fs · %d tok"):format(info.secs, info.tokens) or ""

      if state.interrupt_pending then
        state.interrupt_pending = false
        state.last_turn_interrupted = true
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

      ask_pending_question()
    end,
  })

  if job <= 0 then
    stop_thinking()
    vim.notify(provider_label() .. ": nie udało się uruchomić procesu", vim.log.levels.ERROR)
    return
  end

  state.job = job

  -- Oneshot dostaje cały prompt w argv (-p), nic nie wysyłamy na stdin. Zamknij
  -- go (EOF), bo inaczej claude czeka ~3s na dane ze stdin, zanim ruszy z turą.
  pcall(vim.fn.chanclose, job, "stdin")
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
    append_chat({ ("%s sesja gotowa · %s · %s"):format(
      ICON.ready, state.model or provider_label(), vim.fn.fnamemodify(session_root(), ":~")
    ) }, "AgentReady")
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
    cwd = session_root(),
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

  local job = state.job
  state.job = nil
  kill_job_tree(job)
end

local interrupt_seq = 0

-- Przerwij bieżącą turę bez ubijania sesji (jak Ctrl-C w CLI).
function M.interrupt()
  if not state.job or not state.thinking.active then
    return
  end

  -- Oneshot: ubicie procesu tury kończy turę, sesja (na dysku) zostaje.
  -- Zostawiamy state.job — on_exit dopisze linię "przerwano" i wyzeruje stan.
  if is_oneshot() then
    state.interrupt_pending = true
    kill_job_tree(state.job)
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

  -- Zaznaczenie dotyczy jednej wiadomości — kolejne tury nie mają się do niego
  -- odnosić, bo user zwykle zdążył już przejść gdzie indziej.
  state.selection = nil

  -- Nota o przerwanej turze idzie tylko raz — w pierwszej wiadomości po niej.
  state.last_turn_interrupted = false

  -- Nowa tura — wyczyść panel agentów w tle i niezadane pytanie z poprzedniej.
  state.bg_agents = {}
  state.bg_index = {}
  state.pending_question = nil
  state.question_answered = false
  render_bg_panel()

  -- Stan plików sprzed tury = baza scalania, gdy agent zapisze plik, który
  -- masz otwarty z niezapisanymi zmianami (patrz system.agent.reload).
  reload.snapshot()

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

function refocus_input()
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

-- Zapamiętaj zaznaczenie z trybu wizualnego (wywoływane, gdy <leader>c/<leader>C
-- przyszło z trybu x). Kontekst dostaje wtedy konkretne linie zamiast kursora.
-- Znaki `<`/`>` są jeszcze nieustawione w chwili mapowania, więc bierzemy żywe
-- końce zaznaczenia: getpos("v") i pozycję kursora.
local function capture_selection()
  local buf = vim.api.nvim_get_current_buf()

  if vim.bo[buf].buftype ~= "" or vim.api.nvim_buf_get_name(buf) == "" then
    return
  end

  local a = vim.fn.getpos("v")[2]
  local b = vim.fn.getpos(".")[2]
  local first, last = math.min(a, b), math.max(a, b)
  local lines = vim.api.nvim_buf_get_lines(buf, first - 1, last, false)

  if #lines == 0 then
    return
  end

  state.selection = {
    rel = rel_path(vim.api.nvim_buf_get_name(buf)),
    ft = vim.bo[buf].filetype,
    first = first,
    last = last,
    lines = lines,
  }
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
    kill_job_tree(old)
  end

  stop_thinking()
  state.ready = false
  state.session_id = nil
  state.root = nil
  state.model = nil
  state.pending_question = nil
  state.question_answered = false
  -- Zgody "na całą sesję" nie przechodzą na nową rozmowę.
  require("system.agent.permission").reset()
end

local function clear_log()
  if state.log_buf and vim.api.nvim_buf_is_valid(state.log_buf) then
    vim.bo[state.log_buf].modifiable = true
    vim.api.nvim_buf_set_lines(state.log_buf, 0, -1, false, {})
    vim.bo[state.log_buf].modifiable = false
    pcall(vim.api.nvim_buf_clear_namespace, state.log_buf, ns, 0, -1)
    pcall(vim.api.nvim_buf_clear_namespace, state.log_buf, fold_ns, 0, -1)
  end

  state.folds = {}
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

-- Wspólny wstęp obu wejść: zapamiętaj plik, a przy wywołaniu z trybu wizualnego
-- także zaznaczone linie. Wyjście z trybu x musi nastąpić PO odczycie zaznaczenia.
local function enter(visual)
  remember_target()

  if visual then
    capture_selection()
    vim.cmd("normal! \27")
  else
    state.selection = nil
  end
end

-- <leader>c — otwórz/kontynuuj czat (startuje sesję, jeśli żadnej nie ma).
function M.open(visual)
  enter(visual)

  if not session_active() then
    M.start()
  end

  show_chat()
end

-- <leader>C — nowy czat: zakończ sesję, wyczyść log i licznik, startuj świeżą.
function M.fresh(visual)
  enter(visual)
  teardown_session()
  clear_log()
  state.touched_files = {}
  state.last_turn_interrupted = false
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
  state.last_turn_interrupted = false
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

  -- Bufory otwartych plików, które agent zmienia na dysku: przeładowanie, a
  -- przy niezapisanych zmianach usera — scalenie 3-way (system.agent.reload).
  reload.setup({
    log = function(lines, hl)
      append_chat(lines, hl)
    end,
    root = session_root,
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

  -- Okienko wpisywania jest zawsze "gotowe do pisania": wejście do niego
  -- (klik myszą, <C-w>, powrót z pickera) od razu włącza insert mode.
  vim.api.nvim_create_autocmd({ "WinEnter", "BufEnter" }, {
    group = vim.api.nvim_create_augroup("AgentInputInsert", { clear = true }),
    callback = function()
      local win = vim.api.nvim_get_current_win()

      if win ~= state.input_win or not vim.api.nvim_win_is_valid(win) then return end

      if vim.api.nvim_win_get_buf(win) ~= state.input_buf then return end

      if vim.fn.mode() ~= "i" then
        vim.cmd("startinsert")
      end
    end,
  })

  -- Trzymaj proporcje panelu przy zmianie rozmiaru terminala: czat = 40%
  -- szerokości po prawej (albo proporcja ustawiona ręcznie przez użytkownika),
  -- input = 15% wysokości panelu.
  local resize_group = vim.api.nvim_create_augroup("AgentChatResize", { clear = true })

  vim.api.nvim_create_autocmd("VimResized", {
    group = resize_group,
    callback = function()
      -- Neovim sam przeskaluje okna, zanim zdążymy nałożyć layout — te zmiany
      -- to nie ręczny resize użytkownika, więc na czas przeliczenia wyłączamy
      -- śledzenie.
      state.suppress_resize_track = true
      vim.schedule(function()
        apply_layout_size()
        state.suppress_resize_track = false
      end)
    end,
  })

  vim.api.nvim_create_autocmd("WinResized", {
    group = resize_group,
    callback = track_manual_resize,
  })

  vim.keymap.set("n", "<leader>C", function() M.fresh(false) end, { desc = "Agent: nowy czat (świeża sesja)" })
  vim.keymap.set("n", "<leader>c", function() M.open(false) end, { desc = "Agent: czat" })
  -- Z trybu wizualnego zaznaczone linie jadą do agenta jako cel polecenia.
  vim.keymap.set("x", "<leader>C", function() M.fresh(true) end, { desc = "Agent: nowy czat z zaznaczeniem" })
  vim.keymap.set("x", "<leader>c", function() M.open(true) end, { desc = "Agent: czat z zaznaczeniem" })

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
