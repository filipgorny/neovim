-- Provider Claude Code CLI dla system.agent.
--
-- Tryb "oneshot": każda wiadomość to osobny `claude -p <msg>` z wyjściem
-- stream-json. CLI (od 2.x) przetwarza wiadomość i kończy proces po `result`,
-- więc trwały proces (stream) nie ma sensu — kontekst trzymamy przez id sesji
-- przekazywane następnej turze przez `--resume <session_id>`.
--   command(config, opts) -> string[]         -- argv; opts.message/opts.session
--   new_decoder()          -> fun(data) -> Event[]  -- dekoder chunków stdout
--
-- Claude może modyfikować pliki (--permission-mode auto — CLI sam akceptuje
-- bezpieczne operacje, a o ryzykowne pyta przez permission_prompt_tool); rdzeń po
-- każdej turze robi :checktime, żeby przeładować zmienione bufory.

local M = {
  name = "claude",
  label = "Claude",
  icon = "󰚩",
  mode = "oneshot",
}

M.config = {
  cmd = "claude",
  permission_mode = "auto",
  -- AskUserQuestion: model zamiast pisać "brak potwierdzenia" zadaje pytanie z
  -- listą odpowiedzi, którą rdzeń renderuje w logu czatu (patrz question.lua).
  allowed_tools = "Read,Edit,Write,Grep,Glob,AskUserQuestion",
  model = "claude-opus-5", -- domyślnie Opus 5; zmienialny przez picker modeli (<C-g>)
}

-- Modele do pickera.
--
-- CLI nie ma podkomendy `claude models`, a /v1/models wymagałoby klucza API
-- (my chodzimy po OAuth). Zamiast tego wyciągamy ids wprost z binarki CLI —
-- to dokładnie ta lista, którą `--model` zaakceptuje, i aktualizuje się sama
-- przy `claude update`. `grep -a` zamiast `strings`: ~0.02s zamiast ~0.9s na
-- 260MB i bez zależności od binutils.

-- Rodziny modeli w kolejności prezentacji przy równym numerze wersji.
local FAMILY_RANK = { opus = 1, fable = 2, mythos = 3, sonnet = 4, haiku = 5 }

-- Gdy nie da się odczytać binarki (inny sposób instalacji, brak grep).
local FALLBACK_MODELS = {
  "claude-opus-5",
  "claude-fable-5",
  "claude-sonnet-5",
  "claude-opus-4-8",
  "claude-haiku-4-5",
}

-- Parsowanie binarki jest tanie, ale spawn procesu przy każdym otwarciu
-- pickera już nie — cache'ujemy per (ścieżka, mtime), więc lista odświeża się
-- automatycznie po aktualizacji CLI.
local models_cache = { key = nil, list = nil }

-- "claude-opus-4-8" -> { 4, 8 }; służy do sortowania malejąco po wersji.
local function version_of(id)
  local nums = {}

  for n in id:gmatch("%-(%d+)") do
    table.insert(nums, tonumber(n))
  end

  return nums
end

local function newer_first(a, b)
  local va, vb = version_of(a), version_of(b)

  for i = 1, math.max(#va, #vb) do
    local x, y = va[i] or 0, vb[i] or 0

    if x ~= y then
      return x > y
    end
  end

  local fa = FAMILY_RANK[a:match("^claude%-(%a+)")] or 99
  local fb = FAMILY_RANK[b:match("^claude%-(%a+)")] or 99

  if fa ~= fb then
    return fa < fb
  end

  return a < b
end

local function scan_binary(path)
  local out = vim.fn.systemlist({
    "grep",
    "-aoE",
    "claude-(opus|sonnet|haiku|fable|mythos)-[0-9][0-9-]*",
    path,
  })

  if vim.v.shell_error ~= 0 or not out or #out == 0 then
    return nil
  end

  local seen = {}

  for _, raw in ipairs(out) do
    -- Trafienia bywają obcięte w środku dłuższego stringa ("claude-opus-4-6-"),
    -- a snapshoty z datą ("…-20251001") to nie aliasy — picker ma pokazywać
    -- stabilne nazwy.
    local id = raw:gsub("%-+$", "")

    if not id:match("%-%d%d%d%d%d%d%d%d") then
      seen[id] = true
    end
  end

  -- Odsiewamy prefiksy ("claude-opus-4" to ucięte "claude-opus-4-1", nie alias).
  local ids = {}

  for id in pairs(seen) do
    local is_prefix = false

    for other in pairs(seen) do
      if other ~= id and other:sub(1, #id + 1) == id .. "-" then
        is_prefix = true
        break
      end
    end

    if not is_prefix then
      table.insert(ids, id)
    end
  end

  if #ids == 0 then
    return nil
  end

  table.sort(ids, newer_first)

  return ids
end

function M.models(config)
  config = config or {}

  local path = vim.fn.exepath(config.cmd or "claude")

  if path == "" then
    return FALLBACK_MODELS
  end

  path = vim.uv.fs_realpath(path) or path

  local stat = vim.uv.fs_stat(path)
  local key = path .. ":" .. tostring(stat and stat.mtime and stat.mtime.sec or 0)

  if models_cache.key == key and models_cache.list then
    return models_cache.list
  end

  local ids = scan_binary(path) or FALLBACK_MODELS

  models_cache.key = key
  models_cache.list = ids

  return ids
end

function M.command(config, opts)
  opts = opts or {}

  -- WAŻNE: prompt musi iść ZARAZ po -p. Gdyby był na końcu, wariadyczny
  -- --allowedTools połknąłby go jako nazwy narzędzi (claude: "Input must be
  -- provided…"). Dlatego message jako pierwszy argument pozycyjny.
  local argv = {
    config.cmd or "claude",
    "-p", opts.message or "",
    "--output-format", "stream-json",
    "--verbose",
    "--permission-mode", config.permission_mode or "auto",
    "--allowedTools", config.allowed_tools or "Read,Edit,Write,Grep,Glob",
  }

  if config.model and config.model ~= "" then
    vim.list_extend(argv, { "--model", config.model })
  end

  -- Kontynuuj poprzednią sesję (kontekst), jeśli mamy jej id.
  if opts.session and opts.session ~= "" then
    vim.list_extend(argv, { "--resume", opts.session })
  end

  -- Serwery MCP wniesione przez skille (patrz system.agent.collect_launch).
  -- --strict-mcp-config domyka wariadyczny --mcp-config i izoluje agenta od
  -- ambientnych konfiguracji MCP usera (deterministyczne zachowanie).
  if config.mcp_config and config.mcp_config ~= "" then
    vim.list_extend(argv, { "--mcp-config", config.mcp_config, "--strict-mcp-config" })
  end

  -- Narzędzie pytające usera o zgodę na tool spoza --allowedTools. Bez tego CLI
  -- w trybie -p po prostu odmawia (np. Bash) i model nie ma jak poprosić.
  if config.permission_prompt_tool and config.permission_prompt_tool ~= "" then
    vim.list_extend(argv, { "--permission-prompt-tool", config.permission_prompt_tool })
  end

  -- Dopiski do system-promptu (np. z włączonych skilli).
  if config.append_system_prompt and config.append_system_prompt ~= "" then
    vim.list_extend(argv, { "--append-system-prompt", config.append_system_prompt })
  end

  return argv
end

local function tool_target(block)
  local input = block.input or {}

  -- Bash: cała komenda idzie do `detail` (zwijany blok), nie do nagłówka.
  if block.name == "Bash" then return "" end

  return input.file_path or input.pattern or input.path or input.command or ""
end

-- Treść chowana pod zwijanym nagłówkiem w logu (rdzeń pokazuje ją po kliknięciu).
-- Zwraca detail, label — label zastępuje wtedy nazwę narzędzia w nagłówku.
local function tool_detail(block)
  local input = block.input or {}

  if block.name == "Bash" and input.command and input.command ~= "" then
    return input.command, "Running bash command"
  end

  return nil, nil
end

-- Treść, którą narzędzie zapisuje/dodaje — do pokazania w czacie.
local function tool_body(block)
  local input = block.input or {}

  if block.name == "Write" then
    return input.content
  end

  if block.name == "Edit" then
    return input.new_string
  end

  if block.name == "MultiEdit" then
    local parts = {}

    for _, e in ipairs(input.edits or {}) do
      table.insert(parts, e.new_string or "")
    end

    return #parts > 0 and table.concat(parts, "\n") or nil
  end

  return nil
end

-- Mapuje pojedynczy obiekt JSON linii na znormalizowane zdarzenia (emit).
local function parse_object(data, emit)
  if data.type == "system" and data.subtype == "init" then
    -- oneshot: zapamiętaj id sesji do kontynuacji kolejnej tury (--resume)
    emit({ kind = "session", session_id = data.session_id })
    return
  end

  -- Aktywność POD-AGENTA (uruchomionego przez Task): niesie parent_tool_use_id.
  -- Nie zaśmiecamy głównego czatu — tylko zbijamy postęp do panelu agentów w tle.
  local parent = data.parent_tool_use_id

  if type(parent) == "string" and parent ~= "" then
    local label

    if data.type == "assistant" then
      for _, block in ipairs((data.message or {}).content or {}) do
        if block.type == "tool_use" then
          label = block.name

          break
        elseif block.type == "text" and block.text and block.text ~= "" then
          label = "myśli…"
        end
      end
    end

    emit({ kind = "agent_progress", id = parent, label = label })

    return
  end

  if data.type == "assistant" then
    local message = data.message or {}
    local usage = message.usage or {}

    if usage.output_tokens then
      emit({ kind = "tokens", output_tokens = usage.output_tokens })
    end

    for _, block in ipairs(message.content or {}) do
      if block.type == "text" and block.text and block.text ~= "" then
        emit({ kind = "text", text = block.text })
      elseif block.type == "tool_use" then
        if block.name == "AskUserQuestion" then
          -- Pytanie do użytkownika: rdzeń pokaże listę odpowiedzi po turze.
          emit({ kind = "question", questions = (block.input or {}).questions })
        elseif block.name == "Task" then
          local input = block.input or {}

          emit({
            kind = "agent_start",
            id = block.id,
            desc = input.description,
            subagent = input.subagent_type,
          })
        else
          local detail, label = tool_detail(block)

          emit({
            kind = "tool",
            tool = block.name,
            label = label,
            detail = detail,
            target = tool_target(block),
            body = tool_body(block),
          })
        end
      end
    end

    return
  end

  -- Wyniki narzędzi wracają jako wiadomości "user"; interesują nas tool_result
  -- Taska (zamykają agenta w tle). Rdzeń ignoruje id, których nie śledzi.
  if data.type == "user" then
    for _, block in ipairs((data.message or {}).content or {}) do
      if type(block) == "table" and block.type == "tool_result" and block.tool_use_id then
        emit({ kind = "agent_done", id = block.tool_use_id, error = block.is_error and true or false })
      end
    end

    return
  end

  if data.type == "result" then
    local usage = data.usage or {}
    emit({
      kind = "result",
      duration_ms = data.duration_ms,
      output_tokens = usage.output_tokens,
      error = data.is_error and true or false,
      message = data.result,
    })
  end
end

-- Stanowy dekoder: bufor `tail` skleja linie rozjechane między chunkami
-- stdout (stream-json jest linia-per-JSON).
function M.new_decoder()
  local tail = ""

  return function(data)
    local events = {}
    local function emit(e)
      table.insert(events, e)
    end

    data[1] = tail .. (data[1] or "")
    tail = table.remove(data) or ""

    for _, line in ipairs(data) do
      if line ~= "" then
        local ok, obj = pcall(vim.fn.json_decode, line)

        if ok and type(obj) == "table" and obj.type then
          parse_object(obj, emit)
        end
      end
    end

    return events
  end
end

return M
