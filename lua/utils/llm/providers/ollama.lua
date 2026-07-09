-- Ollama (local) provider
local Base = require("utils.llm.providers.base")

local M = Base:new()

M.api_url = os.getenv("OLLAMA_URL") or vim.env.OLLAMA_URL or "http://localhost:11434"
M.model = os.getenv("OLLAMA_MODEL") or vim.env.OLLAMA_MODEL or "llama3.2"

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

-- Multi-turn chat with optional tool calling. Non-streaming.
-- `messages` is the full conversation history (with role/content/tool_calls/etc).
-- `options.tools` is an optional list of tool definitions (Ollama function-calling schema).
-- callback(reply, err) where reply = { content = string, tool_calls = table|nil }
function M:chat(messages, options, callback)
  options = options or {}

  local request_body = {
    model = options.model or self.model,
    messages = messages,
    stream = false,
    options = {},
  }
  if options.tools and #options.tools > 0 then
    request_body.tools = options.tools
  end
  if options.temperature then
    request_body.options.temperature = options.temperature
  end
  if options.num_predict or options.max_tokens then
    request_body.options.num_predict = options.num_predict or options.max_tokens
  end

  local json_body = vim.fn.json_encode(request_body)
  vim.fn.jobstart({
    "curl", "-s",
    "-X", "POST",
    self.api_url .. "/api/chat",
    "-H", "content-type: application/json",
    "-d", json_body,
  }, {
    stdout_buffered = true,
    on_stdout = function(_, data)
      if not data then return end
      local response_text = table.concat(data, "\n")
      if response_text == "" then return end
      local ok, response = pcall(vim.fn.json_decode, response_text)
      if not ok then
        vim.schedule(function() callback(nil, "JSON parse failed: " .. response_text) end)
        return
      end
      if response.error then
        vim.schedule(function() callback(nil, response.error) end)
        return
      end
      local msg = response.message or {}
      vim.schedule(function()
        callback({
          content = msg.content or "",
          tool_calls = msg.tool_calls,
        }, nil)
      end)
    end,
    on_stderr = function(_, data)
      if data and #data > 0 then
        local err = table.concat(data, "\n")
        if err ~= "" then
          vim.schedule(function() callback(nil, "curl stderr: " .. err) end)
        end
      end
    end,
    on_exit = function(_, code)
      if code ~= 0 then
        vim.schedule(function()
          callback(nil, "curl exited " .. code .. " (is Ollama at " .. self.api_url .. "?)")
        end)
      end
    end,
  })
end

function M:prompt(prompt, callback, options)
  options = options or {}

  local request_body = {
    model = options.model or self.model,
    messages = build_messages(prompt, options),
    stream = false,
    options = {},
  }

  if options.system then
    table.insert(request_body.messages, 1, { role = "system", content = options.system })
  end
  if options.temperature then
    request_body.options.temperature = options.temperature
  end
  if options.num_predict or options.max_tokens then
    request_body.options.num_predict = options.num_predict or options.max_tokens
  end

  local json_body = vim.fn.json_encode(request_body)

  local curl_cmd = {
    "curl",
    "-s",
    "-X", "POST",
    self.api_url .. "/api/chat",
    "-H", "content-type: application/json",
    "-d", json_body,
  }

  vim.fn.jobstart(curl_cmd, {
    stdout_buffered = true,
    on_stdout = function(_, data)
      if not data then return end
      local response_text = table.concat(data, "\n")
      if response_text == "" then return end

      local ok, response = pcall(vim.fn.json_decode, response_text)
      if not ok then
        vim.schedule(function()
          callback(nil, "Failed to parse Ollama response: " .. response_text)
        end)
        return
      end

      if response.error then
        vim.schedule(function() callback(nil, response.error) end)
        return
      end

      local text = response.message and response.message.content or response.response
      vim.schedule(function()
        if text then
          callback(text, nil)
        else
          callback(nil, "Unexpected Ollama response format")
        end
      end)
    end,
    on_stderr = function(_, data)
      if data and #data > 0 then
        local error_text = table.concat(data, "\n")
        if error_text ~= "" then
          vim.schedule(function()
            callback(nil, "Ollama request failed: " .. error_text)
          end)
        end
      end
    end,
    on_exit = function(_, exit_code)
      if exit_code ~= 0 then
        vim.schedule(function()
          callback(nil, "Ollama request exited with code: " .. exit_code .. " (is Ollama running on " .. self.api_url .. "?)")
        end)
      end
    end,
  })
end

function M:stream(prompt, on_chunk, on_done, options)
  options = options or {}

  local request_body = {
    model = options.model or self.model,
    messages = build_messages(prompt, options),
    stream = true,
    options = {},
  }

  if options.system then
    table.insert(request_body.messages, 1, { role = "system", content = options.system })
  end
  if options.temperature then
    request_body.options.temperature = options.temperature
  end
  if options.num_predict or options.max_tokens then
    request_body.options.num_predict = options.num_predict or options.max_tokens
  end

  local json_body = vim.fn.json_encode(request_body)

  local curl_cmd = {
    "curl",
    "-s",
    "--no-buffer",
    "-X", "POST",
    self.api_url .. "/api/chat",
    "-H", "content-type: application/json",
    "-d", json_body,
  }

  local full_text = ""

  vim.fn.jobstart(curl_cmd, {
    stdout_buffered = false,
    on_stdout = function(_, data)
      if not data then return end
      for _, line in ipairs(data) do
        if line ~= "" then
          local ok, event = pcall(vim.fn.json_decode, line)
          if ok and event then
            if event.error then
              vim.schedule(function() on_done(nil, event.error) end)
              return
            end
            local chunk = event.message and event.message.content or event.response
            if chunk and chunk ~= "" then
              full_text = full_text .. chunk
              vim.schedule(function() on_chunk(chunk) end)
            end
          end
        end
      end
    end,
    on_stderr = function(_, data)
      if data and #data > 0 then
        local err = table.concat(data, "\n")
        if err ~= "" then
          vim.schedule(function() on_done(nil, "Ollama stream error: " .. err) end)
        end
      end
    end,
    on_exit = function(_, exit_code)
      vim.schedule(function()
        if exit_code == 0 then
          on_done(full_text, nil)
        else
          on_done(nil, "Ollama stream exited with code: " .. exit_code)
        end
      end)
    end,
  })
end

return M
