-- Ollama (local) provider
local Base = require("utils.llm.providers.base")

local M = Base:new()

M.api_url = os.getenv("OLLAMA_URL") or vim.env.OLLAMA_URL or "http://localhost:11434"
M.model = os.getenv("OLLAMA_MODEL") or vim.env.OLLAMA_MODEL or "llama3.2"

-- Ollama's default num_ctx is 4096, which silently truncates the prompt as soon
-- as a medium-sized file is pasted into the conversation. Set it explicitly.
M.num_ctx = 16384
-- Keep the weights resident so a request after a coffee break doesn't pay for
-- a reload.
M.keep_alive = "30m"
-- nil = leave the model's default alone; false disables reasoning on models
-- that support it.
M.think = nil

function M:set_model(name)
  if name and name ~= "" then
    self.model = name
  end
end

function M:set_api_url(url)
  if url and url ~= "" then
    self.api_url = url
  end
end

function M:set_num_ctx(n)
  if n and n > 0 then
    self.num_ctx = n
  end
end

function M:set_think(v)
  self.think = v
end

function M:set_keep_alive(v)
  if v ~= nil then
    self.keep_alive = v
  end
end

function M:set_api_key(_) end
function M:get_api_key() return nil end
function M:is_configured() return true end

function M:get_name()
  return "Ollama (" .. self.model .. ")"
end

local function build_messages(prompt, options)
  if options.messages then
    return options.messages
  end
  return { { role = "user", content = prompt } }
end

-- Shared request builder for /api/chat.
function M:build_body(messages, options, stream)
  options = options or {}

  local body = {
    model = options.model or self.model,
    messages = messages,
    stream = stream and true or false,
    keep_alive = options.keep_alive or self.keep_alive,
    options = {
      num_ctx = options.num_ctx or self.num_ctx,
    },
  }

  if options.tools and #options.tools > 0 then
    body.tools = options.tools
  end
  -- Reasoning models (qwen3, deepseek-r1) burn a lot of tokens thinking before
  -- they emit anything. `think = false` turns that off where supported.
  local think = options.think
  if think == nil then think = self.think end
  if think ~= nil then
    body.think = think
  end
  if options.temperature then
    body.options.temperature = options.temperature
  end
  if options.num_predict or options.max_tokens then
    body.options.num_predict = options.num_predict or options.max_tokens
  end

  return body
end

function M:curl_cmd(body, stream)
  local cmd = { "curl", "-s" }
  if stream then
    table.insert(cmd, "--no-buffer")
  end
  vim.list_extend(cmd, {
    "-X", "POST",
    self.api_url .. "/api/chat",
    "-H", "content-type: application/json",
    "-d", vim.fn.json_encode(body),
  })
  return cmd
end

-- Multi-turn chat with optional tool calling. Non-streaming.
-- `messages` is the full conversation history (with role/content/tool_calls/etc).
-- `options.tools` is an optional list of tool definitions (Ollama function-calling schema).
-- callback(reply, err) where reply = { content = string, tool_calls = table|nil }
function M:chat(messages, options, callback)
  local done = false
  local function finish(reply, err)
    if done then return end
    done = true
    vim.schedule(function() callback(reply, err) end)
  end

  vim.fn.jobstart(self:curl_cmd(self:build_body(messages, options, false), false), {
    stdout_buffered = true,
    on_stdout = function(_, data)
      if not data then return end
      local response_text = table.concat(data, "\n")
      if vim.trim(response_text) == "" then return end
      local ok, response = pcall(vim.fn.json_decode, response_text)
      if not ok then
        finish(nil, "JSON parse failed: " .. response_text)
        return
      end
      if response.error then
        finish(nil, response.error)
        return
      end
      local msg = response.message or {}
      finish({ content = msg.content or "", tool_calls = msg.tool_calls }, nil)
    end,
    on_stderr = function(_, data)
      if data and #data > 0 then
        local err = table.concat(data, "\n")
        if vim.trim(err) ~= "" then
          finish(nil, "curl stderr: " .. err)
        end
      end
    end,
    on_exit = function(_, code)
      if code ~= 0 then
        finish(nil, "curl exited " .. code .. " (is Ollama at " .. self.api_url .. "?)")
      end
    end,
  })
end

-- Streaming multi-turn chat WITH tool support. This is the one the agent loop
-- wants: content arrives live via on_chunk, and if the model decides to call a
-- tool instead, the accumulated tool_calls come back through on_done. One pass,
-- never two.
-- on_chunk(text), on_done(reply, err) where reply = { content, tool_calls }
function M:chat_stream(messages, options, on_chunk, on_done)
  local content = ""
  local tool_calls = nil
  local done = false

  local function finish(err)
    if done then return end
    done = true
    vim.schedule(function()
      if err then
        on_done(nil, err)
      else
        on_done({ content = content, tool_calls = tool_calls }, nil)
      end
    end)
  end

  vim.fn.jobstart(self:curl_cmd(self:build_body(messages, options, true), true), {
    stdout_buffered = false,
    on_stdout = function(_, data)
      if not data then return end
      for _, line in ipairs(data) do
        if vim.trim(line) ~= "" then
          local ok, event = pcall(vim.fn.json_decode, line)
          if ok and type(event) == "table" then
            if event.error then
              finish(event.error)
              return
            end
            local msg = event.message or {}
            if msg.tool_calls and #msg.tool_calls > 0 then
              tool_calls = tool_calls or {}
              vim.list_extend(tool_calls, msg.tool_calls)
            end
            local chunk = msg.content or event.response
            if chunk and chunk ~= "" then
              content = content .. chunk
              vim.schedule(function() on_chunk(chunk) end)
            end
          end
        end
      end
    end,
    on_stderr = function(_, data)
      if data and #data > 0 then
        local err = table.concat(data, "\n")
        if vim.trim(err) ~= "" then
          finish("Ollama stream error: " .. err)
        end
      end
    end,
    on_exit = function(_, exit_code)
      if exit_code ~= 0 then
        finish("Ollama stream exited with code: " .. exit_code)
      else
        finish(nil)
      end
    end,
  })
end

function M:prompt(prompt, callback, options)
  options = options or {}

  local messages = build_messages(prompt, options)
  if options.system then
    table.insert(messages, 1, { role = "system", content = options.system })
  end

  local done = false
  local function finish(text, err)
    if done then return end
    done = true
    vim.schedule(function() callback(text, err) end)
  end

  vim.fn.jobstart(self:curl_cmd(self:build_body(messages, options, false), false), {
    stdout_buffered = true,
    on_stdout = function(_, data)
      if not data then return end
      local response_text = table.concat(data, "\n")
      if vim.trim(response_text) == "" then return end

      local ok, response = pcall(vim.fn.json_decode, response_text)
      if not ok then
        finish(nil, "Failed to parse Ollama response: " .. response_text)
        return
      end
      if response.error then
        finish(nil, response.error)
        return
      end

      local text = response.message and response.message.content or response.response
      if text then
        finish(text, nil)
      else
        finish(nil, "Unexpected Ollama response format")
      end
    end,
    on_stderr = function(_, data)
      if data and #data > 0 then
        local error_text = table.concat(data, "\n")
        if vim.trim(error_text) ~= "" then
          finish(nil, "Ollama request failed: " .. error_text)
        end
      end
    end,
    on_exit = function(_, exit_code)
      if exit_code ~= 0 then
        finish(nil, "Ollama request exited with code: " .. exit_code .. " (is Ollama running on " .. self.api_url .. "?)")
      end
    end,
  })
end

function M:stream(prompt, on_chunk, on_done, options)
  options = options or {}

  local messages = build_messages(prompt, options)
  if options.system then
    table.insert(messages, 1, { role = "system", content = options.system })
  end

  self:chat_stream(messages, options, on_chunk, function(reply, err)
    if err then
      on_done(nil, err)
    else
      on_done(reply.content, nil)
    end
  end)
end

return M
