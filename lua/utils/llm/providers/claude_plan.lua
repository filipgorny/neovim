-- Claude Code Plan provider (uses your plan instead of API)
local Base = require("utils.llm.providers.base")

local M = Base:new()

-- Provider configuration
M.provider_name = "Claude Code Plan"

-- Get provider name
function M:get_name()
  return self.provider_name
end

-- Check if provider is configured
function M:is_configured()
  -- Check if claude command is available
  local result = vim.fn.system("which claude 2>/dev/null")
  return vim.v.shell_error == 0 and result ~= ""
end

-- Set API key (not needed for plan, but required by interface)
function M:set_api_key(key)
  -- No-op for plan provider
end

-- Get API key (not needed for plan)
function M:get_api_key()
  return "plan"
end

-- Send prompt to Claude Code Plan
-- @param prompt string: The user prompt
-- @param callback function: Callback(response_text, error)
-- @param options table: Optional parameters
--   - system: string - System prompt
--   - messages: table - Full conversation history
function M:prompt(prompt, callback, options)
  options = options or {}

  -- Build the prompt text
  local full_prompt = ""

  if options.system then
    full_prompt = full_prompt .. "System: " .. options.system .. "\n\n"
  end

  if options.messages then
    -- Format conversation history
    for _, msg in ipairs(options.messages) do
      if msg.role == "user" then
        full_prompt = full_prompt .. "User: " .. msg.content .. "\n\n"
      elseif msg.role == "assistant" then
        full_prompt = full_prompt .. "Assistant: " .. msg.content .. "\n\n"
      end
    end
  else
    full_prompt = full_prompt .. prompt
  end

  -- Create temporary file for the prompt
  local temp_file = vim.fn.tempname()
  local f = io.open(temp_file, "w")
  if not f then
    callback(nil, "Failed to create temporary file")
    return
  end
  f:write(full_prompt)
  f:close()

  -- Execute claude command with prompt via stdin (cat file | claude)
  local cmd = string.format("cat %s | claude", vim.fn.shellescape(temp_file))

  vim.fn.jobstart(cmd, {
    stdout_buffered = true,
    on_stdout = function(_, data)
      if not data then return end

      local response_text = table.concat(data, "\n")

      -- Clean up temp file
      vim.fn.delete(temp_file)

      if response_text and response_text ~= "" then
        callback(response_text, nil)
      else
        callback(nil, "Empty response from Claude Code")
      end
    end,
    on_stderr = function(_, data)
      if data and #data > 0 then
        local error_text = table.concat(data, "\n")
        if error_text ~= "" then
          vim.fn.delete(temp_file)
          callback(nil, "Claude Code error: " .. error_text)
        end
      end
    end,
    on_exit = function(_, exit_code)
      if exit_code ~= 0 then
        vim.fn.delete(temp_file)
        callback(nil, "Claude Code failed with exit code: " .. exit_code)
      end
    end,
  })
end

-- Stream prompt to Claude Code Plan
-- @param prompt string: The user prompt (or nil if messages provided)
-- @param on_chunk function: Callback(text_chunk) called for each chunk
-- @param on_done function: Callback(full_text, error) called when complete
-- @param options table: Optional parameters
--   - system: string - System prompt
--   - messages: table - Full conversation history
function M:stream(prompt, on_chunk, on_done, options)
  options = options or {}

  -- Build the prompt text
  local full_prompt = ""

  if options.system then
    full_prompt = full_prompt .. "System: " .. options.system .. "\n\n"
  end

  if options.messages then
    -- Format conversation history
    for _, msg in ipairs(options.messages) do
      if msg.role == "user" then
        full_prompt = full_prompt .. "User: " .. msg.content .. "\n\n"
      elseif msg.role == "assistant" then
        full_prompt = full_prompt .. "Assistant: " .. msg.content .. "\n\n"
      end
    end
  else
    full_prompt = full_prompt .. prompt
  end

  -- Create temporary file for the prompt
  local temp_file = vim.fn.tempname()
  local f = io.open(temp_file, "w")
  if not f then
    vim.schedule(function()
      on_done(nil, "Failed to create temporary file")
    end)
    return
  end
  f:write(full_prompt)
  f:close()

  -- Execute claude command with prompt via stdin (cat file | claude)
  local cmd = string.format("cat %s | claude", vim.fn.shellescape(temp_file))

  local full_text = ""

  vim.fn.jobstart(cmd, {
    stdout_buffered = false,
    on_stdout = function(_, data)
      if not data then return end

      for _, line in ipairs(data) do
        if line ~= "" then
          full_text = full_text .. line .. "\n"

          -- Call on_chunk for each line
          vim.schedule(function()
            on_chunk(line .. "\n")
          end)
        end
      end
    end,
    on_stderr = function(_, data)
      if data and #data > 0 then
        local error_text = table.concat(data, "\n")
        if error_text ~= "" then
          vim.schedule(function()
            vim.fn.delete(temp_file)
            on_done(nil, "Claude Code error: " .. error_text)
          end)
        end
      end
    end,
    on_exit = function(_, exit_code)
      vim.fn.delete(temp_file)

      if exit_code == 0 then
        vim.schedule(function()
          on_done(full_text, nil)
        end)
      else
        vim.schedule(function()
          on_done(nil, "Claude Code failed with exit code: " .. exit_code)
        end)
      end
    end,
  })
end

return M
