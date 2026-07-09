-- Provider Claude Code CLI dla system.agent.
--
-- Rozmawia z `claude -p` przez stream-json po stdin/stdout i mapuje jego
-- zdarzenia na znormalizowany interfejs, którego oczekuje rdzeń agenta:
--   command(config) -> string[]         -- argv dla jobstart
--   encode(text)     -> string          -- linia payloadu dla wiadomości usera
--   new_decoder()    -> fun(data) -> Event[]  -- stanowy dekoder chunków stdout
--
-- Claude może modyfikować pliki (--permission-mode acceptEdits); rdzeń po
-- każdej turze robi :checktime, żeby przeładować zmienione bufory.

local M = {
  name = "claude",
  label = "Claude",
  icon = "󰚩",
  mode = "stream",
}

M.config = {
  cmd = "claude",
  permission_mode = "acceptEdits",
  allowed_tools = "Read,Edit,Write,Grep,Glob",
  model = nil, -- nil = domyślny model konta; ustawiany przez picker modeli
}

-- Modele do pickera (ids z rodziny Claude).
function M.models()
  return {
    "claude-fable-5",
    "claude-opus-4-8",
    "claude-sonnet-5",
    "claude-haiku-4-5-20251001",
  }
end

function M.command(config)
  local argv = {
    config.cmd or "claude",
    "-p",
    "--input-format", "stream-json",
    "--output-format", "stream-json",
    "--verbose",
    "--permission-mode", config.permission_mode or "acceptEdits",
    "--allowedTools", config.allowed_tools or "Read,Edit,Write,Grep,Glob",
  }

  if config.model and config.model ~= "" then
    table.insert(argv, "--model")
    table.insert(argv, config.model)
  end

  -- Dopiski do system-promptu (np. z włączonych skilli)
  if config.append_system_prompt and config.append_system_prompt ~= "" then
    table.insert(argv, "--append-system-prompt")
    table.insert(argv, config.append_system_prompt)
  end

  return argv
end

function M.encode(text)
  return vim.fn.json_encode({
    type = "user",
    message = {
      role = "user",
      content = { { type = "text", text = text } },
    },
  })
end

-- Payload przerywający bieżącą turę (sesja żyje dalej, kontekst zostaje).
function M.interrupt_payload(request_id)
  return vim.fn.json_encode({
    type = "control_request",
    request_id = request_id,
    request = { subtype = "interrupt" },
  })
end

local function tool_target(block)
  local input = block.input or {}
  return input.file_path or input.pattern or input.path or input.command or ""
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
    emit({ kind = "ready", model = data.model, session_id = data.session_id })
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
        if block.name == "Task" then
          local input = block.input or {}

          emit({
            kind = "agent_start",
            id = block.id,
            desc = input.description,
            subagent = input.subagent_type,
          })
        else
          emit({
            kind = "tool",
            tool = block.name,
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
