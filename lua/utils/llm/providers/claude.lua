-- Claude API implementation
local Base = require("utils.llm.providers.base")

local M = Base:new()

-- Claude API configuration
M.api_url = "https://api.anthropic.com/v1/messages"

-- Try to get model from environment, fallback to default
-- You can set CLAUDE_MODEL in your .env file
local env_model = os.getenv("CLAUDE_MODEL") or vim.env.CLAUDE_MODEL
M.model = env_model or "claude-sonnet-4-20250514"

M.api_version = "2023-06-01"
M.api_key = nil

-- Note: Common model IDs (add CLAUDE_MODEL=<model> to your .env to change):
-- claude-sonnet-4-20250514 (Sonnet 4 - May 2025)
-- claude-3-5-sonnet-20241022 (Sonnet 3.5 - Oct 2024)
-- claude-3-5-sonnet-20240620 (Sonnet 3.5 - June 2024)
-- claude-3-opus-20240229 (Opus 3 - Feb 2024)

-- Set API key
function M:set_api_key(key)
  self.api_key = key
end

-- Get API key
function M:get_api_key()
  return self.api_key
end

-- Check if API key is configured
function M:is_configured()
  return self.api_key ~= nil and self.api_key ~= ""
end

-- Get model name
function M:get_name()
  return "Claude (Anthropic)"
end

-- Send prompt to Claude API
-- @param prompt string: The user prompt
-- @param callback function: Callback(response_text, error)
-- @param options table: Optional parameters
--   - system: string - System prompt
--   - temperature: number - Temperature (0-1)
--   - max_tokens: number - Max tokens to generate
function M:prompt(prompt, callback, options)
  options = options or {}

  local api_key = self:get_api_key()
  if not api_key then
    callback(nil, "ANTHROPIC_API_KEY not set. Please set it in your environment.")
    return
  end

  -- Build request body
  local request_body = {
    model = self.model,
    max_tokens = options.max_tokens or 4096,
    messages = {
      {
        role = "user",
        content = prompt
      }
    }
  }

  -- Add system prompt if provided
  if options.system then
    request_body.system = options.system
  end

  -- Add temperature if provided
  if options.temperature then
    request_body.temperature = options.temperature
  end

  -- Convert to JSON
  local json_body = vim.fn.json_encode(request_body)

  -- Prepare curl command
  local curl_cmd = {
    "curl",
    "-s",
    "-X", "POST",
    self.api_url,
    "-H", "content-type: application/json",
    "-H", "x-api-key: " .. api_key,
    "-H", "anthropic-version: " .. self.api_version,
    "-d", json_body
  }

  -- Execute request
  vim.fn.jobstart(curl_cmd, {
    stdout_buffered = true,
    on_stdout = function(_, data)
      if not data then return end

      local response_text = table.concat(data, "\n")

      -- Parse JSON response
      local ok, response = pcall(vim.fn.json_decode, response_text)

      if not ok then
        callback(nil, "Failed to parse API response: " .. response_text)
        return
      end

      -- Check for API errors
      if response.error then
        callback(nil, response.error.message or "Unknown API error")
        return
      end

      -- Extract text from response
      if response.content and response.content[1] and response.content[1].text then
        callback(response.content[1].text, nil)
      else
        callback(nil, "Unexpected response format")
      end
    end,
    on_stderr = function(_, data)
      if data and #data > 0 then
        local error_text = table.concat(data, "\n")
        if error_text ~= "" then
          callback(nil, "API request failed: " .. error_text)
        end
      end
    end,
    on_exit = function(_, exit_code)
      if exit_code ~= 0 then
        callback(nil, "Request failed with exit code: " .. exit_code)
      end
    end,
  })
end

-- Stream prompt to Claude API with real-time text chunks
-- @param prompt string: The user prompt (or can be nil if messages provided in options)
-- @param on_chunk function: Callback(text_chunk) called for each chunk of text
-- @param on_done function: Callback(full_text, error) called when stream completes
-- @param options table: Optional parameters
--   - system: string - System prompt
--   - temperature: number - Temperature (0-1)
--   - max_tokens: number - Max tokens to generate
--   - messages: table - Full conversation history (if provided, prompt is ignored)
function M:stream(prompt, on_chunk, on_done, options)
  options = options or {}

  local api_key = self:get_api_key()
  if not api_key then
    on_done(nil, "ANTHROPIC_API_KEY not set. Please set it in your environment.")
    return
  end

  -- Build request body
  local request_body = {
    model = self.model,
    max_tokens = options.max_tokens or 4096,
    stream = true
  }

  -- Use full messages array if provided, otherwise create from prompt
  if options.messages then
    request_body.messages = options.messages
  else
    request_body.messages = {
      {
        role = "user",
        content = prompt
      }
    }
  end

  -- Add system prompt if provided
  if options.system then
    request_body.system = options.system
  end

  -- Add temperature if provided
  if options.temperature then
    request_body.temperature = options.temperature
  end

  -- Convert to JSON
  local json_body = vim.fn.json_encode(request_body)

  -- Prepare curl command with --no-buffer for streaming
  local curl_cmd = {
    "curl",
    "-s",
    "--no-buffer",
    "-X", "POST",
    self.api_url,
    "-H", "content-type: application/json",
    "-H", "x-api-key: " .. api_key,
    "-H", "anthropic-version: " .. self.api_version,
    "-d", json_body
  }

  local full_text = ""
  local buffer = ""

  -- Execute request with streaming
  local job_id = vim.fn.jobstart(curl_cmd, {
    stdout_buffered = false,
    on_stdout = function(_, data)
      if not data then return end

      for _, line in ipairs(data) do
        if line ~= "" then
          -- Each line is a complete SSE event
          if line:match("^data: ") then
            local event_line = line:match("^data: (.+)$")

            if event_line and event_line ~= "[DONE]" then
              local ok, event = pcall(vim.fn.json_decode, event_line)

              if ok and event.type == "content_block_delta" then
                if event.delta and event.delta.text then
                  local chunk = event.delta.text
                  full_text = full_text .. chunk

                  -- Call on_chunk callback with the text chunk
                  vim.schedule(function()
                    on_chunk(chunk)
                  end)
                end
              elseif ok and event.type == "error" then
                vim.schedule(function()
                  vim.notify("API Error: " .. (event.error and event.error.message or "Unknown error"), vim.log.levels.ERROR)
                  on_done(nil, event.error and event.error.message or "Unknown error")
                end)
                return
              end
            end
          end
        end
      end
    end,
    on_stderr = function(_, data)
      if data and #data > 0 then
        local error_text = table.concat(data, "\n")
        if error_text ~= "" then
          vim.schedule(function()
            vim.notify("Stream stderr: " .. error_text, vim.log.levels.ERROR)
            on_done(nil, "API request failed: " .. error_text)
          end)
        end
      end
    end,
    on_exit = function(_, exit_code)
      if exit_code == 0 then
        vim.schedule(function()
          on_done(full_text, nil)
        end)
      else
        vim.schedule(function()
          on_done(nil, "Request failed with exit code: " .. exit_code)
        end)
      end
    end,
  })
end

return M
