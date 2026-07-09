-- Provider opencode (https://opencode.ai) — darmowy, open-source agent.
--
-- Tryb "oneshot": każda wiadomość to osobny proces `opencode run --format json`.
-- Kontekst między turami trzymamy przez id sesji (--session), które opencode
-- podaje w polu sessionID każdego zdarzenia. Model przez -m provider/model
-- (np. ollama/deepseek-coder-v2:16b lokalnie, albo opencode/…-free w chmurze).

local M = {
  name = "opencode",
  label = "opencode",
  icon = "",
  mode = "oneshot",
}

M.config = {
  cmd = "opencode",
  model = "opencode/deepseek-v4-flash-free",
}

function M.command(config, opts)
  opts = opts or {}
  local argv = { config.cmd or "opencode", "run", "--format", "json" }

  if config.model and config.model ~= "" then
    vim.list_extend(argv, { "-m", config.model })
  end

  -- Kontynuuj poprzednią sesję (kontekst), jeśli mamy jej id
  if opts.session and opts.session ~= "" then
    vim.list_extend(argv, { "-s", opts.session })
  end

  table.insert(argv, opts.message or "")

  return argv
end

-- Lista modeli do pickera (`opencode models`).
function M.models(config)
  local out = vim.fn.systemlist({ config.cmd or "opencode", "models" })

  if vim.v.shell_error ~= 0 then
    return {}
  end

  return out
end

local function tool_from_part(part)
  local st = part.state or {}
  local input = st.input or part.input or {}
  local target = input.filePath or input.file_path or input.path or input.pattern or input.command or ""
  local body = input.content or input.newString or input.new_string

  return {
    tool = part.tool or st.tool or part.name or "tool",
    target = target,
    body = body,
  }
end

function M.new_decoder()
  local tail = ""
  local session_sent = false

  return function(data)
    local events = {}
    local function emit(e)
      table.insert(events, e)
    end

    data[1] = tail .. (data[1] or "")
    tail = table.remove(data) or ""

    for _, line in ipairs(data) do
      line = vim.trim(line)

      if line:sub(1, 1) == "{" then
        local ok, d = pcall(vim.fn.json_decode, line)

        if ok and type(d) == "table" then
          if d.sessionID and not session_sent then
            session_sent = true
            emit({ kind = "session", session_id = d.sessionID })
          end

          local part = d.part or {}

          if d.type == "text" and part.text and part.text ~= "" then
            emit({ kind = "text", text = part.text })
          elseif d.type == "tool" then
            local tp = tool_from_part(part)
            emit({ kind = "tool", tool = tp.tool, target = tp.target, body = tp.body })
          elseif d.type == "step_finish" then
            local tokens = (part.tokens or {}).output

            if tokens then
              emit({ kind = "tokens", output_tokens = tokens })
            end
          elseif d.type == "error" then
            local err = d.error or {}
            emit({ kind = "error", message = (err.data or {}).message or err.name or "błąd" })
          end
        end
      end
    end

    return events
  end
end

return M
