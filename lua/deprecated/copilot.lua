local M = {}

-- Configuration
local config = {
  enabled = true,
  auto_trigger = false, -- Set to true to trigger on typing
  trigger_key = "<C-Space>", -- Manual trigger key
  accept_key = "<CR>", -- Key to accept suggestion (Enter)
  dismiss_key = "<Esc>", -- Key to dismiss suggestion (Esc)
  debounce_ms = 150, -- Debounce time for auto-trigger (reduced for faster response)
  max_context_lines = 30, -- Max lines of context before/after cursor (reduced for faster processing)
  cache_enabled = true,
  cache_ttl_ms = 60000, -- Cache time-to-live: 60 seconds (increased for better caching)
}

-- State
local state = {
  current_suggestion = nil, -- Current completion text
  namespace_id = nil, -- Virtual text namespace
  timer = nil, -- Debounce timer
  is_requesting = false, -- Whether a request is in progress
  last_request_time = 0,
  cache = {}, -- Cache of completions: key = context hash, value = {text, timestamp}
  extmark_ids = {}, -- All extmark IDs for current suggestion
  request_id = 0, -- Incrementing ID to track requests
  current_request_id = nil, -- ID of the current request
  context_position = nil, -- Position where suggestion was requested {row, col}
}

-- Setup copilot with custom configuration
function M.setup(opts)
  opts = opts or {}
  config = vim.tbl_deep_extend("force", config, opts)

  -- Create namespace for virtual text
  state.namespace_id = vim.api.nvim_create_namespace("llm_copilot")

  -- Setup keybindings
  M.setup_keybindings()

  -- Setup autocommands if auto_trigger is enabled
  if config.auto_trigger then
    M.setup_auto_trigger()
  end

  return true
end

-- Enable copilot
function M.enable()
  config.enabled = true
  vim.notify("LLM Copilot enabled", vim.log.levels.INFO)
end

-- Disable copilot
function M.disable()
  config.enabled = false
  M.clear_suggestion()
  vim.notify("LLM Copilot disabled", vim.log.levels.INFO)
end

-- Toggle copilot
function M.toggle()
  if config.enabled then
    M.disable()
  else
    M.enable()
  end
end

-- Setup keybindings
function M.setup_keybindings()
  -- Manual trigger
  vim.keymap.set("i", config.trigger_key, function()
    M.trigger_completion()
  end, { desc = "Trigger LLM completion", silent = true })

  -- Accept suggestion with Enter
  vim.keymap.set("i", config.accept_key, function()
    if state.current_suggestion then
      M.accept_suggestion()
      return "" -- Don't insert newline
    else
      -- No suggestion, fallback to default Enter behavior
      return vim.api.nvim_replace_termcodes("<CR>", true, false, true)
    end
  end, { expr = true, desc = "Accept LLM suggestion or insert newline", silent = true, replace_keycodes = false })

  -- Dismiss suggestion with Esc
  vim.keymap.set("i", config.dismiss_key, function()
    if state.current_suggestion then
      M.clear_suggestion()
      return "" -- Don't exit insert mode
    else
      -- No suggestion, fallback to default Esc behavior (exit insert mode)
      return vim.api.nvim_replace_termcodes("<Esc>", true, false, true)
    end
  end, { expr = true, desc = "Dismiss LLM suggestion or exit insert mode", silent = true, replace_keycodes = false })
end

-- Check if current buffer is suitable for copilot
local function is_valid_buffer()
  local bufnr = vim.api.nvim_get_current_buf()
  local buftype = vim.api.nvim_buf_get_option(bufnr, "buftype")
  local filetype = vim.api.nvim_buf_get_option(bufnr, "filetype")

  -- Don't trigger in special buffers
  local excluded_buftypes = {
    "nofile",    -- Review windows, scratch buffers
    "prompt",    -- Command prompts
    "help",      -- Help buffers
    "quickfix",  -- Quickfix/location lists
    "terminal",  -- Terminal buffers
  }

  for _, excluded in ipairs(excluded_buftypes) do
    if buftype == excluded then
      return false
    end
  end

  -- Don't trigger in certain filetypes
  local excluded_filetypes = {
    "TelescopePrompt",
    "help",
    "man",
  }

  for _, excluded in ipairs(excluded_filetypes) do
    if filetype == excluded then
      return false
    end
  end

  return true
end

-- Setup auto-trigger on text changes
function M.setup_auto_trigger()
  local group = vim.api.nvim_create_augroup("LLMCopilot", { clear = true })

  -- Trigger on text change in insert mode
  vim.api.nvim_create_autocmd("TextChangedI", {
    group = group,
    callback = function()
      -- Check if copilot is enabled and auto_trigger is on
      if not config.enabled or not config.auto_trigger then
        return
      end

      -- Check if buffer is valid for copilot
      if not is_valid_buffer() then
        return
      end

      -- Clear existing suggestion when typing new text
      if state.current_suggestion then
        M.clear_suggestion()
      end
      M.debounced_trigger()
    end,
  })

  -- Clear suggestion when leaving insert mode
  vim.api.nvim_create_autocmd("InsertLeave", {
    group = group,
    callback = function()
      M.clear_suggestion()
    end,
  })

  -- Clear suggestion when moving cursor (but only if moved away from suggestion position)
  vim.api.nvim_create_autocmd("CursorMovedI", {
    group = group,
    callback = function()
      -- Only clear if we have a suggestion and cursor moved away from the saved position
      if state.current_suggestion and cursor_moved_from_position(state.context_position) then
        M.clear_suggestion()
      end
    end,
  })

  -- Clear suggestion when switching buffers
  vim.api.nvim_create_autocmd("BufLeave", {
    group = group,
    callback = function()
      M.clear_suggestion()
    end,
  })

  -- Clear suggestion when entering command mode
  vim.api.nvim_create_autocmd("CmdlineEnter", {
    group = group,
    callback = function()
      M.clear_suggestion()
    end,
  })
end

-- Debounced trigger (for auto-complete)
function M.debounced_trigger()
  if not config.enabled then
    return
  end

  -- Cancel existing timer
  if state.timer then
    vim.fn.timer_stop(state.timer)
  end

  -- Create new timer
  state.timer = vim.fn.timer_start(config.debounce_ms, function()
    M.trigger_completion()
  end)
end

-- Get context around cursor
function M.get_context()
  local bufnr = vim.api.nvim_get_current_buf()
  local cursor = vim.api.nvim_win_get_cursor(0)
  local row = cursor[1] - 1 -- 0-indexed
  local col = cursor[2]

  local total_lines = vim.api.nvim_buf_line_count(bufnr)
  local filetype = vim.api.nvim_buf_get_option(bufnr, "filetype")

  -- Calculate range for context
  local start_line = math.max(0, row - config.max_context_lines)
  local end_line = math.min(total_lines, row + config.max_context_lines + 1)

  -- Get all lines in range
  local lines = vim.api.nvim_buf_get_lines(bufnr, start_line, end_line, false)

  -- Split into before and after cursor
  local before_cursor_lines = {}
  local after_cursor_lines = {}

  for i, line in ipairs(lines) do
    local line_idx = start_line + i - 1
    if line_idx < row then
      table.insert(before_cursor_lines, line)
    elseif line_idx == row then
      -- Split the current line at cursor position
      table.insert(before_cursor_lines, line:sub(1, col))
      if col < #line then
        table.insert(after_cursor_lines, line:sub(col + 1))
      end
    else
      table.insert(after_cursor_lines, line)
    end
  end

  local before_cursor = table.concat(before_cursor_lines, "\n")
  local after_cursor = table.concat(after_cursor_lines, "\n")

  return {
    filetype = filetype,
    before_cursor = before_cursor,
    after_cursor = after_cursor,
    cursor_row = row,
    cursor_col = col,
  }
end

-- Generate cache key from context
local function get_cache_key(context)
  -- Simple hash: concatenate and use vim.fn.sha256 if available, otherwise just concat
  local key = context.filetype .. "|" .. context.before_cursor .. "|" .. context.after_cursor

  -- Try to use sha256 for better keys
  if vim.fn.exists("*sha256") == 1 then
    return vim.fn.sha256(key)
  end

  return key
end

-- Get from cache
local function get_from_cache(context)
  if not config.cache_enabled then
    return nil
  end

  local key = get_cache_key(context)
  local cached = state.cache[key]

  if cached then
    local age = vim.loop.now() - cached.timestamp
    if age < config.cache_ttl_ms then
      return cached.text
    else
      -- Expired, remove from cache
      state.cache[key] = nil
    end
  end

  return nil
end

-- Save to cache
local function save_to_cache(context, text)
  if not config.cache_enabled then
    return
  end

  local key = get_cache_key(context)
  state.cache[key] = {
    text = text,
    timestamp = vim.loop.now()
  }
end

-- Clear old cache entries
local function cleanup_cache()
  local now = vim.loop.now()
  for key, cached in pairs(state.cache) do
    local age = now - cached.timestamp
    if age >= config.cache_ttl_ms then
      state.cache[key] = nil
    end
  end
end

-- Check if cursor has moved from the saved position
local function cursor_moved_from_position(saved_position)
  if not saved_position then
    return true
  end

  local cursor = vim.api.nvim_win_get_cursor(0)
  local current_row = cursor[1] - 1 -- 0-indexed
  local current_col = cursor[2]

  return current_row ~= saved_position.row or current_col ~= saved_position.col
end

-- Trigger completion request
function M.trigger_completion()
  if not config.enabled then
    return
  end

  -- Clear any existing suggestion when triggering new completion
  M.clear_suggestion()

  -- Cancel any existing timer
  if state.timer then
    vim.fn.timer_stop(state.timer)
    state.timer = nil
  end

  -- Get context
  local context = M.get_context()

  -- Check if context is too short (avoid triggering on empty lines)
  -- Don't trigger if current line is empty or only whitespace
  local current_line = context.before_cursor:match("[^\n]*$") or ""
  if current_line:match("^%s*$") or context.before_cursor == "" then
    return
  end

  -- Don't trigger if we have less than 3 characters on the current line
  if #current_line:gsub("%s", "") < 3 then
    return
  end

  -- Don't trigger if already requesting (prevent multiple concurrent requests)
  if state.is_requesting then
    return
  end

  -- Save the cursor position when request is made
  state.context_position = {
    row = context.cursor_row,
    col = context.cursor_col
  }

  -- Generate a new request ID
  state.request_id = state.request_id + 1
  local this_request_id = state.request_id
  state.current_request_id = this_request_id

  -- Check cache first
  local cached_result = get_from_cache(context)
  if cached_result then
    -- Validate cursor hasn't moved
    if not cursor_moved_from_position(state.context_position) then
      M.show_suggestion(cached_result, context)
    end
    return
  end

  state.is_requesting = true
  state.last_request_time = vim.loop.now()

  -- Get LLM module
  local llm = require("utils.llm")

  -- Request completion using streaming
  llm.suggest_completion(
    context,
    -- on_chunk: Update ghost text as chunks arrive
    function(chunk)
      vim.schedule(function()
        -- Check if this request is still valid
        if this_request_id ~= state.current_request_id then
          return -- Outdated request
        end

        -- Check if cursor moved
        if cursor_moved_from_position(state.context_position) then
          M.clear_suggestion()
          return
        end

        if not state.current_suggestion then
          state.current_suggestion = chunk
        else
          state.current_suggestion = state.current_suggestion .. chunk
        end
        M.update_ghost_text(state.current_suggestion, context)
      end)
    end,
    -- on_complete
    function(full_text)
      vim.schedule(function()
        -- Check if this request is still valid
        if this_request_id ~= state.current_request_id then
          state.is_requesting = false
          return -- Outdated request
        end

        state.is_requesting = false

        -- Check if cursor moved
        if cursor_moved_from_position(state.context_position) then
          M.clear_suggestion()
          return
        end

        -- Clean up the completion text (remove markdown, extra whitespace)
        local cleaned = M.clean_completion(full_text)

        state.current_suggestion = cleaned
        M.show_suggestion(cleaned, context)

        -- Cache the result
        save_to_cache(context, cleaned)

        -- Cleanup old cache entries
        cleanup_cache()
      end)
    end,
    -- on_error
    function(error)
      vim.schedule(function()
        if this_request_id == state.current_request_id then
          state.is_requesting = false
        end
        -- Silently fail - don't spam user with errors
        -- vim.notify("Copilot error: " .. tostring(error), vim.log.levels.WARN)
      end)
    end
  )
end

-- Clean completion text (remove markdown formatting, etc.)
function M.clean_completion(text)
  if not text then
    return ""
  end

  -- Remove markdown code blocks
  text = text:gsub("```%w*\n", ""):gsub("```", "")

  -- Remove leading/trailing whitespace
  text = text:gsub("^%s+", ""):gsub("%s+$", "")

  -- If there are multiple lines and first line looks like a language tag, remove it
  local lines = {}
  for line in text:gmatch("[^\n]+") do
    table.insert(lines, line)
  end

  if #lines > 0 and lines[1]:match("^%w+$") and #lines[1] < 20 then
    table.remove(lines, 1)
  end

  return table.concat(lines, "\n")
end

-- Show suggestion as ghost text
function M.show_suggestion(text, context)
  if not text or text == "" then
    return
  end

  state.current_suggestion = text
  M.update_ghost_text(text, context)
end

-- Update ghost text display
function M.update_ghost_text(text, context)
  if not text or text == "" then
    return
  end

  local bufnr = vim.api.nvim_get_current_buf()

  -- Always clear before updating to prevent stale extmarks
  vim.api.nvim_buf_clear_namespace(bufnr, state.namespace_id, 0, -1)
  state.extmark_ids = {}

  -- Validate cursor hasn't moved from context position
  if cursor_moved_from_position(state.context_position) then
    return
  end

  -- Split suggestion into lines
  local suggestion_lines = {}
  for line in (text .. "\n"):gmatch("([^\n]*)\n") do
    table.insert(suggestion_lines, line)
  end

  if #suggestion_lines == 0 then
    return
  end

  -- Use the saved context position, not current cursor
  local row = state.context_position.row
  local col = state.context_position.col

  -- Create virtual text for first line (inline with cursor)
  local virt_text = {{ suggestion_lines[1], "Comment" }}

  -- Set extmark with virtual text
  local ok, extmark_id = pcall(vim.api.nvim_buf_set_extmark, bufnr, state.namespace_id, row, col, {
    virt_text = virt_text,
    virt_text_pos = "overlay",
    hl_mode = "combine",
  })

  if ok then
    table.insert(state.extmark_ids, extmark_id)
  end

  -- If there are multiple lines, add them as virtual lines below
  if #suggestion_lines > 1 then
    for i = 2, #suggestion_lines do
      local virt_lines = {{ suggestion_lines[i], "Comment" }}
      local ok2, extmark_id2 = pcall(vim.api.nvim_buf_set_extmark, bufnr, state.namespace_id, row, 0, {
        virt_lines = { virt_lines },
        virt_lines_above = false,
      })
      if ok2 then
        table.insert(state.extmark_ids, extmark_id2)
      end
    end
  end
end

-- Accept current suggestion
function M.accept_suggestion()
  if not state.current_suggestion or not state.context_position then
    return
  end

  local suggestion = state.current_suggestion
  local bufnr = vim.api.nvim_get_current_buf()

  -- Use the saved context position where the suggestion was generated
  local row = state.context_position.row + 1 -- Convert to 1-indexed
  local col = state.context_position.col

  -- Clear suggestion first
  M.clear_suggestion()

  -- Schedule the actual insertion to avoid "not allowed to change" errors
  vim.schedule(function()
    -- Double-check buffer is still valid
    if not vim.api.nvim_buf_is_valid(bufnr) then
      return
    end

    -- Insert the suggestion at cursor
    local lines = {}
    for line in (suggestion .. "\n"):gmatch("([^\n]*)\n") do
      table.insert(lines, line)
    end

    -- Get current line
    local current_line = vim.api.nvim_buf_get_lines(bufnr, row - 1, row, false)[1]
    if not current_line then
      return
    end

    if #lines == 1 then
      -- Single line: insert at saved cursor position
      local new_line = current_line:sub(1, col) .. lines[1] .. current_line:sub(col + 1)
      vim.api.nvim_buf_set_lines(bufnr, row - 1, row, false, { new_line })

      -- Move cursor to end of insertion
      vim.api.nvim_win_set_cursor(0, { row, col + #lines[1] })
    else
      -- Multi-line: more complex insertion
      local first_line = current_line:sub(1, col) .. lines[1]
      local last_line = lines[#lines] .. current_line:sub(col + 1)

      local new_lines = { first_line }
      for i = 2, #lines - 1 do
        table.insert(new_lines, lines[i])
      end
      table.insert(new_lines, last_line)

      vim.api.nvim_buf_set_lines(bufnr, row - 1, row, false, new_lines)

      -- Move cursor to end of insertion
      vim.api.nvim_win_set_cursor(0, { row + #lines - 1, #lines[#lines] })
    end
  end)
end

-- Clear current suggestion
function M.clear_suggestion()
  state.current_suggestion = nil
  state.context_position = nil

  -- Clear in all buffers to ensure nothing is left behind
  for _, bufnr in ipairs(vim.api.nvim_list_bufs()) do
    if vim.api.nvim_buf_is_valid(bufnr) and state.namespace_id then
      pcall(vim.api.nvim_buf_clear_namespace, bufnr, state.namespace_id, 0, -1)
    end
  end

  state.extmark_ids = {}
end

-- Clear cache
function M.clear_cache()
  state.cache = {}
  vim.notify("Copilot cache cleared", vim.log.levels.INFO)
end

-- Get status
function M.status()
  local status_lines = {
    "LLM Copilot Status:",
    "  Enabled: " .. tostring(config.enabled),
    "  Auto-trigger: " .. tostring(config.auto_trigger),
    "  Trigger key: " .. config.trigger_key,
    "  Accept key: " .. config.accept_key,
    "  Is requesting: " .. tostring(state.is_requesting),
    "  Has suggestion: " .. tostring(state.current_suggestion ~= nil),
    "  Cache entries: " .. vim.tbl_count(state.cache),
  }

  for _, line in ipairs(status_lines) do
    print(line)
  end
end

return M
