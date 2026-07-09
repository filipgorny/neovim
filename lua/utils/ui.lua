local M = {}

-- Create a select window with prompt
local function create_select_window(width, height, title, content_lines, prompt)
  local ui = vim.api.nvim_list_uis()[1]
  local win_width = ui.width
  local win_height = ui.height

  local row = math.floor((win_height - height) / 2)
  local col = math.floor((win_width - width) / 2)

  -- Create main buffer for results/content
  local content_buf = vim.api.nvim_create_buf(false, true)
  vim.api.nvim_buf_set_option(content_buf, "buftype", "nofile")
  vim.api.nvim_buf_set_option(content_buf, "bufhidden", "wipe")
  vim.api.nvim_buf_set_option(content_buf, "modifiable", false)

  -- Create input buffer for prompt
  local input_buf = vim.api.nvim_create_buf(false, true)
  vim.api.nvim_buf_set_option(input_buf, "buftype", "prompt")
  vim.api.nvim_buf_set_option(input_buf, "bufhidden", "wipe")

  -- Set prompt
  vim.fn.prompt_setprompt(input_buf, prompt or "> ")

  -- Calculate window positions
  local results_height = height - 3 -- Leave room for prompt and borders
  local prompt_row = row + height - 3

  -- Create results window (top)
  local content_win = vim.api.nvim_open_win(content_buf, false, {
    relative = "editor",
    width = width,
    height = results_height,
    row = row,
    col = col,
    style = "minimal",
    border = {"┌", "─", "┐", "│", "┤", "─", "├", "│"},
    title = title or "",
    title_pos = "center",
  })

  -- Set content
  if content_lines then
    vim.api.nvim_buf_set_option(content_buf, "modifiable", true)
    vim.api.nvim_buf_set_lines(content_buf, 0, -1, false, content_lines)
    vim.api.nvim_buf_set_option(content_buf, "modifiable", false)
  end

  -- Create prompt window (bottom) - no border, seamlessly connected
  local input_win = vim.api.nvim_open_win(input_buf, true, {
    relative = "editor",
    width = width,
    height = 1,
    row = prompt_row,
    col = col,
    style = "minimal",
    border = {"├", "─", "┤", "│", "┘", "─", "└", "│"},
  })

  -- Apply highlighting
  vim.api.nvim_win_set_option(content_win, "winhl", "Normal:Normal,FloatBorder:FloatBorder")
  vim.api.nvim_win_set_option(input_win, "winhl", "Normal:Normal,FloatBorder:FloatBorder")

  -- Start in insert mode
  vim.cmd("startinsert")

  return content_buf, content_win, input_buf, input_win
end

-- Generic selection window with custom content
-- @param title string: Window title
-- @param content_lines table: Array of strings to display in content area
-- @param prompt_text string: Prompt text for input (e.g., "> ")
-- @param callback function(input): Called when user submits input
-- @param default_value string: Optional default value for input
-- @param width number: Optional window width (default 70)
-- @param height number: Optional window height (default 15)
M.selection_window = function(title, content_lines, prompt_text, callback, default_value, width, height)
  width = width or 70
  height = height or 15
  prompt_text = prompt_text or "> "

  local content_buf, content_win, input_buf, input_win =
    create_select_window(width, height, title, content_lines, prompt_text)

  -- Set default value if provided
  if default_value then
    vim.api.nvim_buf_set_lines(input_buf, 0, -1, false, {default_value})
  end

  local cancelled = false
  local submitted = false

  -- Handle submission
  local function submit()
    if submitted then return end
    submitted = true

    -- Get the input (remove prompt prefix)
    local lines = vim.api.nvim_buf_get_lines(input_buf, 0, -1, false)
    local input = lines[1] or ""

    -- Remove prompt from input
    local prompt = vim.fn.prompt_getprompt(input_buf)
    if input:sub(1, #prompt) == prompt then
      input = input:sub(#prompt + 1)
    end

    -- Close windows
    pcall(vim.api.nvim_win_close, input_win, true)
    pcall(vim.api.nvim_win_close, content_win, true)

    if not cancelled and callback then
      vim.schedule(function()
        callback(input)
      end)
    end
  end

  -- Keybindings
  vim.keymap.set({"i", "n"}, "<CR>", submit, { buffer = input_buf, noremap = true, silent = true })

  vim.keymap.set({"i", "n"}, "<Esc>", function()
    cancelled = true
    submitted = true
    pcall(vim.api.nvim_win_close, input_win, true)
    pcall(vim.api.nvim_win_close, content_win, true)
  end, { buffer = input_buf, noremap = true, silent = true })
end

-- Input dialog
M.input_window = function(title, prompt_text, callback, default_value, content_lines)
  -- Use provided content_lines or create default ones
  content_lines = content_lines or {
    "",
    "",
    "",
    "",
    "",
    "",
    "",
    "  <CR>  Confirm",
    "  <Esc> Cancel",
    "",
    "  ─────────────────────────────────────────────────────",
    "",
    "  " .. prompt_text,
  }

  local content_buf, content_win, input_buf, input_win =
    create_select_window(70, 15, title, content_lines, "> ")

  -- Set default value if provided
  if default_value then
    -- For prompt buffer, we need to set it after the prompt
    vim.api.nvim_buf_set_lines(input_buf, 0, -1, false, {default_value})
  end

  local cancelled = false
  local submitted = false

  -- Handle submission
  local function submit()
    if submitted then return end
    submitted = true

    -- Get the input (remove prompt prefix)
    local lines = vim.api.nvim_buf_get_lines(input_buf, 0, -1, false)
    local input = lines[1] or ""

    -- Remove prompt from input
    local prompt_text = vim.fn.prompt_getprompt(input_buf)
    if input:sub(1, #prompt_text) == prompt_text then
      input = input:sub(#prompt_text + 1)
    end

    -- Close windows
    pcall(vim.api.nvim_win_close, input_win, true)
    pcall(vim.api.nvim_win_close, content_win, true)

    if not cancelled then
      vim.schedule(function()
        callback(input)
      end)
    end
  end

  -- Keybindings
  vim.keymap.set({"i", "n"}, "<CR>", submit, { buffer = input_buf, noremap = true, silent = true })

  vim.keymap.set({"i", "n"}, "<Esc>", function()
    cancelled = true
    submitted = true
    pcall(vim.api.nvim_win_close, input_win, true)
    pcall(vim.api.nvim_win_close, content_win, true)
  end, { buffer = input_buf, noremap = true, silent = true })
end

-- List builder window
M.list_builder_window = function(title, prompt_text, callback)
  local items = {}
  local width = 70
  local height = 25

  local function update_and_show()
    -- Build content lines
    local content_lines = {
      "",
      "  Current items:",
      "",
    }

    if #items == 0 then
      table.insert(content_lines, "    (no items yet)")
    else
      for i, item in ipairs(items) do
        table.insert(content_lines, string.format("    %d. %s", i, item))
      end
    end

    -- Add padding
    for i = 1, 5 do
      table.insert(content_lines, "")
    end

    table.insert(content_lines, "  <CR>  Add item / Finish (empty to finish)")
    table.insert(content_lines, "  <Esc> Cancel")
    table.insert(content_lines, "")
    table.insert(content_lines, "  ─────────────────────────────────────────────────────")
    table.insert(content_lines, "")
    table.insert(content_lines, "  " .. prompt_text)

    -- Create window
    local content_buf, content_win, input_buf, input_win =
      create_select_window(width, height, title, content_lines, "> ")

    local cancelled = false
    local submitted = false

    -- Handle submission
    local function submit()
      if submitted then return end
      submitted = true

      -- Get the input (remove prompt prefix)
      local lines = vim.api.nvim_buf_get_lines(input_buf, 0, -1, false)
      local input = lines[1] or ""

      -- Remove prompt from input
      local prompt_text = vim.fn.prompt_getprompt(input_buf)
      if input:sub(1, #prompt_text) == prompt_text then
        input = input:sub(#prompt_text + 1)
      end

      -- Close windows
      pcall(vim.api.nvim_win_close, input_win, true)
      pcall(vim.api.nvim_win_close, content_win, true)

      if cancelled then
        return
      end

      if input == "" then
        -- Empty input - finish
        vim.schedule(function()
          callback(items)
        end)
      else
        -- Add item and continue
        table.insert(items, input)
        vim.schedule(function()
          update_and_show()
        end)
      end
    end

    -- Keybindings
    vim.keymap.set({"i", "n"}, "<CR>", submit, { buffer = input_buf, noremap = true, silent = true })

    vim.keymap.set({"i", "n"}, "<Esc>", function()
      cancelled = true
      submitted = true
      pcall(vim.api.nvim_win_close, input_win, true)
      pcall(vim.api.nvim_win_close, content_win, true)
    end, { buffer = input_buf, noremap = true, silent = true })
  end

  -- Start the process
  update_and_show()
end

-- Confirmation dialog
M.confirm_window = function(title, message, callback)
  local content_lines = {
    "",
    "  " .. message,
    "",
    "  ─────────────────────────────────────────────────────",
    "",
    "  Type 'yes' or 'no' and press <Enter>",
    "",
    "  <CR>  Confirm",
    "  <Esc> Cancel",
  }

  local content_buf, content_win, input_buf, input_win =
    create_select_window(70, 15, title, content_lines, "> ")

  local cancelled = false
  local submitted = false

  local function submit()
    if submitted then return end
    submitted = true

    -- Get the input (remove prompt prefix)
    local lines = vim.api.nvim_buf_get_lines(input_buf, 0, -1, false)
    local input = lines[1] or ""

    -- Remove prompt from input
    local prompt_text = vim.fn.prompt_getprompt(input_buf)
    if input:sub(1, #prompt_text) == prompt_text then
      input = input:sub(#prompt_text + 1)
    end

    input = input:lower()

    -- Close windows
    pcall(vim.api.nvim_win_close, input_win, true)
    pcall(vim.api.nvim_win_close, content_win, true)

    if not cancelled then
      vim.schedule(function()
        if input == "yes" or input == "y" then
          callback(true)
        else
          callback(false)
        end
      end)
    else
      vim.schedule(function()
        callback(false)
      end)
    end
  end

  -- Keybindings
  vim.keymap.set({"i", "n"}, "<CR>", submit, { buffer = input_buf, noremap = true, silent = true })

  vim.keymap.set({"i", "n"}, "<Esc>", function()
    cancelled = true
    submitted = true
    pcall(vim.api.nvim_win_close, input_win, true)
    pcall(vim.api.nvim_win_close, content_win, true)
  end, { buffer = input_buf, noremap = true, silent = true })
end

-- Helper to get theme-aware message background colors
local function get_message_colors()
  -- Get current background color
  local bg_color = vim.fn.synIDattr(vim.fn.hlID("Normal"), "bg")

  -- Validate and sanitize background color
  if bg_color == "" or bg_color == "NONE" or not bg_color then
    bg_color = "#1e1e1e" -- Default dark background
  end

  -- Ensure it's a valid hex color
  if not bg_color:match("^#%x%x%x%x%x%x$") then
    bg_color = "#1e1e1e" -- Fallback to default
  end

  -- Convert hex to RGB
  local function hex_to_rgb(hex)
    hex = hex:gsub("#", "")
    -- Ensure hex is 6 characters
    if #hex ~= 6 then
      return 30, 30, 30 -- Default dark RGB
    end
    local r = tonumber(hex:sub(1,2), 16)
    local g = tonumber(hex:sub(3,4), 16)
    local b = tonumber(hex:sub(5,6), 16)
    -- Validate conversion
    if not r or not g or not b then
      return 30, 30, 30 -- Default dark RGB
    end
    return r, g, b
  end

  -- Convert RGB to hex
  local function rgb_to_hex(r, g, b)
    return string.format("#%02x%02x%02x", r, g, b)
  end

  -- Lighten color
  local function lighten(hex, amount)
    local r, g, b = hex_to_rgb(hex)
    r = math.min(255, r + amount)
    g = math.min(255, g + amount)
    b = math.min(255, b + amount)
    return rgb_to_hex(r, g, b)
  end

  -- Darken color
  local function darken(hex, amount)
    local r, g, b = hex_to_rgb(hex)
    r = math.max(0, r - amount)
    g = math.max(0, g - amount)
    b = math.max(0, b - amount)
    return rgb_to_hex(r, g, b)
  end

  -- Add yellow tint to color
  local function add_yellow_tint(hex, amount)
    local r, g, b = hex_to_rgb(hex)
    r = math.min(255, r + amount)       -- Add red
    g = math.min(255, g + amount)       -- Add green (red + green = yellow)
    b = math.max(0, b - amount / 2)     -- Reduce blue slightly
    return rgb_to_hex(r, g, b)
  end

  return {
    user_bg = lighten(bg_color, 25),                -- Darker for user messages
    assistant_bg = add_yellow_tint(bg_color, 15),   -- Yellowish for assistant
    user_header_bg = lighten(bg_color, 40),         -- Lighter for user message headers
    assistant_header_bg = add_yellow_tint(bg_color, 25) -- Yellowish and lighter for assistant headers
  }
end

-- Format a chat message with timestamp and sender name
-- @param message string: The message content
-- @param sender_name string: Name of the sender
-- @param is_user boolean: Whether this is a user message (affects highlight group)
-- @param width number: Optional width for the message box (defaults to 120)
-- @return table: { lines = {...}, highlight_groups = {...} }
M.format_chat_message = function(message, sender_name, is_user, width)
  width = width or 120

  -- Get current timestamp
  local timestamp = os.date("[%H:%M:%S %d.%m.%Y]")

  -- Create header line with padding to full width
  local header_text = string.format("%s %s", timestamp, sender_name)

  -- Pad header to full width (no side padding, fill entire width)
  local header = " " .. header_text .. string.rep(" ", width - 1 - #header_text)

  -- Split message into lines and add padding
  local message_lines = {}

  for line in message:gmatch("[^\r\n]+") do
    -- Wrap long lines if needed
    if #line > width - 2 then
      -- Simple wrapping: split at width
      local pos = 1
      while pos <= #line do
        local chunk = line:sub(pos, pos + width - 3)
        table.insert(message_lines, " " .. chunk .. string.rep(" ", width - 1 - #chunk))
        pos = pos + width - 2
      end
    else
      -- Pad line to full width
      table.insert(message_lines, " " .. line .. string.rep(" ", width - 1 - #line))
    end
  end

  -- Build final lines array with highlight group info
  local formatted_lines = {}
  local highlight_groups = {}

  -- Add header at the top (line 0)
  table.insert(formatted_lines, header)
  table.insert(highlight_groups, is_user and "ChatUserMessageHeader" or "ChatAssistantMessageHeader")

  -- Add blank separator line (line 1)
  table.insert(formatted_lines, string.rep(" ", width))
  table.insert(highlight_groups, is_user and "ChatUserMessage" or "ChatAssistantMessage")

  -- Add message content
  for _, line in ipairs(message_lines) do
    table.insert(formatted_lines, line)
    table.insert(highlight_groups, is_user and "ChatUserMessage" or "ChatAssistantMessage")
  end

  -- Add bottom padding line (full width)
  table.insert(formatted_lines, string.rep(" ", width))
  table.insert(highlight_groups, is_user and "ChatUserMessage" or "ChatAssistantMessage")

  -- Add blank line after message box for spacing (no highlight)
  table.insert(formatted_lines, "")
  table.insert(highlight_groups, nil) -- No highlight for spacing

  return {
    lines = formatted_lines,
    highlight_groups = highlight_groups
  }
end

-- Create initial message structure for streaming (header + separator)
-- @param sender_name string: Name of the sender
-- @param is_user boolean: Whether this is a user message
-- @param width number: Width for the message box
-- @return table: { lines = {...}, highlight_groups = {...} }
M.create_streaming_message_header = function(sender_name, is_user, width)
  width = width or 120

  -- Get current timestamp
  local timestamp = os.date("[%H:%M:%S %d.%m.%Y]")
  local header_text = string.format("%s %s", timestamp, sender_name)

  -- Pad header to full width
  local header = " " .. header_text .. string.rep(" ", width - 1 - #header_text)

  return {
    lines = {
      header,                     -- Header at the top
      string.rep(" ", width)      -- Blank separator line
    },
    highlight_groups = {
      is_user and "ChatUserMessageHeader" or "ChatAssistantMessageHeader",  -- Header highlight
      is_user and "ChatUserMessage" or "ChatAssistantMessage"               -- Separator highlight
    }
  }
end

-- Format streaming content lines (updates as text arrives)
-- @param text string: The accumulated text so far
-- @param width number: Width for the message box
-- @return table: Array of formatted content lines with padding
M.format_streaming_content = function(text, width)
  width = width or 120
  local content_lines = {}

  for line in text:gmatch("[^\r\n]+") do
    -- Wrap long lines if needed
    if #line > width - 2 then
      -- Simple wrapping: split at width
      local pos = 1
      while pos <= #line do
        local chunk = line:sub(pos, pos + width - 3)
        table.insert(content_lines, " " .. chunk .. string.rep(" ", width - 1 - #chunk))
        pos = pos + width - 2
      end
    else
      -- Pad line to full width
      table.insert(content_lines, " " .. line .. string.rep(" ", width - 1 - #line))
    end
  end

  return content_lines
end

-- Finalize streaming message (add bottom padding)
-- @param width number: Width for the message box
-- @return table: { lines = {...} }
M.finalize_streaming_message = function(width)
  width = width or 120

  return {
    lines = {
      string.rep(" ", width), -- Bottom padding (full width)
      ""                      -- Blank line for spacing
    }
  }
end

-- Create chat window (dual window for chat + input)
-- @param title string: Window title
-- @param initial_message table: Initial lines to display in chat
-- @param user_name string: Name for user messages
-- @param assistant_name string: Name for assistant messages
-- @param options table: Optional configuration
--   - on_send: function(text) - Called when user submits a message
--   - on_close: function() - Called when windows are closed
M.create_chat_window = function(title, initial_message, user_name, assistant_name, options)
  user_name = user_name or "User"
  assistant_name = assistant_name or "Assistant"
  options = options or {}

  -- Calculate dimensions
  local width = math.min(120, math.floor(vim.o.columns * 0.8))
  local height = math.floor(vim.o.lines * 0.8)
  local chat_height = height - 3 -- Leave room for input box
  local input_height = 1

  local row = math.floor((vim.o.lines - height) / 2)
  local col = math.floor((vim.o.columns - width) / 2)

  -- Get theme-aware colors
  local colors = get_message_colors()

  -- Create highlight groups for messages
  vim.api.nvim_set_hl(0, "ChatUserMessage", { bg = colors.user_bg })
  vim.api.nvim_set_hl(0, "ChatAssistantMessage", { bg = colors.assistant_bg })

  -- Create highlight groups for message headers (lighter background)
  vim.api.nvim_set_hl(0, "ChatUserMessageHeader", { bg = colors.user_header_bg })
  vim.api.nvim_set_hl(0, "ChatAssistantMessageHeader", { bg = colors.assistant_header_bg })

  -- Create chat display buffer
  local chat_bufnr = vim.api.nvim_create_buf(false, true)
  vim.api.nvim_buf_set_option(chat_bufnr, "buftype", "nofile")
  vim.api.nvim_buf_set_option(chat_bufnr, "bufhidden", "hide")
  vim.api.nvim_buf_set_option(chat_bufnr, "swapfile", false)
  vim.api.nvim_buf_set_option(chat_bufnr, "modifiable", false)
  vim.api.nvim_buf_set_option(chat_bufnr, "filetype", "markdown")

  -- Create namespace for highlights
  local ns_id = vim.api.nvim_create_namespace("chat_highlights")

  -- Set initial message
  if initial_message then
    vim.api.nvim_buf_set_option(chat_bufnr, "modifiable", true)
    vim.api.nvim_buf_set_lines(chat_bufnr, 0, -1, false, initial_message)
    vim.api.nvim_buf_set_option(chat_bufnr, "modifiable", false)
  end

  -- Create chat window
  local chat_win = vim.api.nvim_open_win(chat_bufnr, false, {
    relative = "editor",
    width = width,
    height = chat_height,
    row = row,
    col = col,
    style = "minimal",
    border = "rounded",
    title = title or " Chat ",
    title_pos = "center",
  })

  vim.api.nvim_win_set_option(chat_win, "wrap", true)
  vim.api.nvim_win_set_option(chat_win, "linebreak", true)

  -- Create input buffer (without prompt)
  local input_bufnr = vim.api.nvim_create_buf(false, true)
  vim.api.nvim_buf_set_option(input_bufnr, "buftype", "nofile")
  vim.api.nvim_buf_set_option(input_bufnr, "bufhidden", "hide")
  vim.api.nvim_buf_set_option(input_bufnr, "swapfile", false)

  -- Create input window (below chat window)
  local input_win = vim.api.nvim_open_win(input_bufnr, true, {
    relative = "editor",
    width = width,
    height = input_height,
    row = row + chat_height + 1,
    col = col,
    style = "minimal",
    border = "rounded",
    title = " Your Message (Enter to send, Esc to close) ",
    title_pos = "center",
  })

  -- Handle input submission
  local function handle_submit()
    -- Get input text
    local lines = vim.api.nvim_buf_get_lines(input_bufnr, 0, -1, false)
    local input_text = table.concat(lines, "\n"):gsub("^%s*(.-)%s*$", "%1") -- trim

    if input_text == "" then
      return
    end

    -- Clear input buffer
    vim.api.nvim_buf_set_lines(input_bufnr, 0, -1, false, {""})

    -- Return to insert mode
    vim.schedule(function()
      if input_win and vim.api.nvim_win_is_valid(input_win) then
        vim.api.nvim_set_current_win(input_win)
        vim.cmd("startinsert")
      end
    end)

    -- Call on_send callback if provided
    if options.on_send then
      options.on_send(input_text)
    end
  end

  -- Bind Enter key to submit
  vim.keymap.set({"i", "n"}, "<CR>", handle_submit, { buffer = input_bufnr, silent = true })

  -- Start in insert mode
  vim.cmd("startinsert")

  return {
    chat_bufnr = chat_bufnr,
    chat_win = chat_win,
    input_bufnr = input_bufnr,
    input_win = input_win,
  }
end

-- Display a complete message in a buffer
-- @param bufnr number: Buffer to display in
-- @param content string: Message content
-- @param sender_name string: Name of the sender
-- @param is_user boolean: Whether this is a user message
-- @param width number: Width for formatting
M.display_chat_message = function(bufnr, content, sender_name, is_user, width)
  if not bufnr or not vim.api.nvim_buf_is_valid(bufnr) then
    return
  end

  width = width or 120

  -- Make buffer modifiable
  vim.api.nvim_buf_set_option(bufnr, "modifiable", true)

  -- Format the message
  local formatted = M.format_chat_message(content, sender_name, is_user, width)

  -- Get current line count (where to start)
  local start_line = vim.api.nvim_buf_line_count(bufnr)

  -- Append formatted lines
  vim.api.nvim_buf_set_lines(bufnr, -1, -1, false, formatted.lines)

  -- Apply highlights
  local ns_id = vim.api.nvim_create_namespace("chat_highlights")
  for i, highlight_group in ipairs(formatted.highlight_groups) do
    if highlight_group then
      vim.api.nvim_buf_add_highlight(
        bufnr,
        ns_id,
        highlight_group,
        start_line + i - 1,
        0,
        -1
      )
    end
  end

  -- Make buffer read-only again
  vim.api.nvim_buf_set_option(bufnr, "modifiable", false)
end

-- Create a streaming message display handler
-- @param bufnr number: Buffer to display in
-- @param sender_name string: Name of the sender
-- @param is_user boolean: Whether this is a user message
-- @param width number: Width for formatting
-- @return table: Handler with update() and finalize() methods
M.create_streaming_display = function(bufnr, sender_name, is_user, width)
  width = width or 120

  local message_start_line = nil
  local header_line_count = 2 -- header + separator

  return {
    -- Initialize the message (called on first chunk)
    init = function()
      if message_start_line then
        return -- Already initialized
      end

      if not bufnr or not vim.api.nvim_buf_is_valid(bufnr) then
        return
      end

      vim.api.nvim_buf_set_option(bufnr, "modifiable", true)

      -- Create header
      local header_data = M.create_streaming_message_header(sender_name, is_user, width)

      message_start_line = vim.api.nvim_buf_line_count(bufnr)

      -- Add header lines
      vim.api.nvim_buf_set_lines(bufnr, -1, -1, false, header_data.lines)

      -- Highlight header lines
      local ns_id = vim.api.nvim_create_namespace("chat_highlights")
      for i, highlight_group in ipairs(header_data.highlight_groups) do
        vim.api.nvim_buf_add_highlight(
          bufnr,
          ns_id,
          highlight_group,
          message_start_line + i - 1,
          0,
          -1
        )
      end

      vim.api.nvim_buf_set_option(bufnr, "modifiable", false)
    end,

    -- Update the message content (called on each chunk)
    update = function(accumulated_text)
      if not message_start_line then
        return
      end

      if not bufnr or not vim.api.nvim_buf_is_valid(bufnr) then
        return
      end

      vim.api.nvim_buf_set_option(bufnr, "modifiable", true)

      -- Format content
      local content_lines = M.format_streaming_content(accumulated_text, width)

      -- Calculate where content starts
      local content_start = message_start_line + header_line_count

      -- Replace content lines
      vim.api.nvim_buf_set_lines(bufnr, content_start, -1, false, content_lines)

      -- Apply highlighting to content lines
      local ns_id = vim.api.nvim_create_namespace("chat_highlights")
      local highlight_group = is_user and "ChatUserMessage" or "ChatAssistantMessage"
      for i = 0, #content_lines - 1 do
        vim.api.nvim_buf_add_highlight(
          bufnr,
          ns_id,
          highlight_group,
          content_start + i,
          0,
          -1
        )
      end

      vim.api.nvim_buf_set_option(bufnr, "modifiable", false)
    end,

    -- Finalize the message (add bottom padding)
    finalize = function()
      if not message_start_line then
        return
      end

      if not bufnr or not vim.api.nvim_buf_is_valid(bufnr) then
        return
      end

      vim.api.nvim_buf_set_option(bufnr, "modifiable", true)

      local finalize_data = M.finalize_streaming_message(width)

      -- Add bottom padding and blank line
      vim.api.nvim_buf_set_lines(bufnr, -1, -1, false, finalize_data.lines)

      -- Highlight bottom padding (but not the blank spacing line)
      local ns_id = vim.api.nvim_create_namespace("chat_highlights")
      local line_count = vim.api.nvim_buf_line_count(bufnr)
      local highlight_group = is_user and "ChatUserMessage" or "ChatAssistantMessage"
      vim.api.nvim_buf_add_highlight(
        bufnr,
        ns_id,
        highlight_group,
        line_count - 2, -- Bottom padding line (before blank line)
        0,
        -1
      )

      vim.api.nvim_buf_set_option(bufnr, "modifiable", false)
    end
  }
end

-- Scroll buffer to bottom in a window
-- @param bufnr number: Buffer number
-- @param win number: Window handle (optional, will find window for buffer)
M.scroll_to_bottom = function(bufnr, win)
  if not win or not vim.api.nvim_win_is_valid(win) then
    -- Find window displaying this buffer
    for _, w in ipairs(vim.api.nvim_list_wins()) do
      if vim.api.nvim_win_get_buf(w) == bufnr then
        win = w
        break
      end
    end
  end

  if win and vim.api.nvim_win_is_valid(win) then
    local line_count = vim.api.nvim_buf_line_count(bufnr)
    vim.api.nvim_win_set_cursor(win, {line_count, 0})
  end
end

-- Setup close keybindings for chat window
-- @param chat_win number: Chat window handle
-- @param input_win number: Input window handle
-- @param chat_bufnr number: Chat buffer handle
-- @param input_bufnr number: Input buffer handle
-- @param additional_keys table: Optional additional keybindings (e.g., {"q"})
-- @param on_close function: Optional callback when windows are closed
M.setup_chat_close_keys = function(chat_win, input_win, chat_bufnr, input_bufnr, additional_keys, on_close)
  additional_keys = additional_keys or {}

  -- Function to close both windows
  local close_windows = function()
    if chat_win and vim.api.nvim_win_is_valid(chat_win) then
      vim.api.nvim_win_close(chat_win, true)
    end
    if input_win and vim.api.nvim_win_is_valid(input_win) then
      vim.api.nvim_win_close(input_win, true)
    end

    -- Call on_close callback if provided
    if on_close then
      vim.schedule(on_close)
    end
  end

  -- Bind Esc in input buffer (both insert and normal mode)
  vim.keymap.set({"i", "n"}, "<Esc>", close_windows, { buffer = input_bufnr, silent = true })

  -- Bind Esc in chat buffer (normal mode)
  vim.keymap.set("n", "<Esc>", close_windows, { buffer = chat_bufnr, silent = true })

  -- Bind additional keys (e.g., 'q') in chat buffer
  for _, key in ipairs(additional_keys) do
    vim.keymap.set("n", key, close_windows, { buffer = chat_bufnr, silent = true })
  end

  -- Auto-close chat window when input window is closed
  vim.api.nvim_create_autocmd("WinClosed", {
    buffer = input_bufnr,
    callback = function()
      if chat_win and vim.api.nvim_win_is_valid(chat_win) then
        vim.api.nvim_win_close(chat_win, true)
      end

      -- Call on_close callback if provided
      if on_close then
        vim.schedule(on_close)
      end
    end,
    once = true,
  })
end

-- Create a floating window
-- @param content string|table: Content to display (string or table of lines)
-- @param opts table: Optional configuration
--   - width: number (default 40)
--   - height: number (default 10)
--   - title: string (default "")
--   - position: string ("center" or "bottom-right", default "center")
--   - on_close: function
-- @return table: { bufnr, win }
M.create_floating_window = function(content, opts)
  opts = opts or {}
  local width = opts.width or 40
  local height = opts.height or 10
  local title = opts.title or ""
  local position = opts.position or "center"

  -- Convert content to lines
  local lines = {}
  if type(content) == "string" then
    for line in content:gmatch("[^\n]+") do
      table.insert(lines, line)
    end
  else
    lines = content
  end

  -- Create buffer
  local bufnr = vim.api.nvim_create_buf(false, true)
  vim.api.nvim_buf_set_option(bufnr, "buftype", "nofile")
  vim.api.nvim_buf_set_option(bufnr, "bufhidden", "wipe")
  vim.api.nvim_buf_set_option(bufnr, "swapfile", false)
  vim.api.nvim_buf_set_option(bufnr, "modifiable", true)
  vim.api.nvim_buf_set_option(bufnr, "filetype", "markdown")
  vim.api.nvim_buf_set_lines(bufnr, 0, -1, false, lines)
  vim.api.nvim_buf_set_option(bufnr, "modifiable", false)

  -- Calculate position based on option
  local row, col
  if position == "center" then
    -- Center of screen
    row = math.floor((vim.o.lines - height) / 2)
    col = math.floor((vim.o.columns - width) / 2)
  else
    -- Bottom right corner
    row = vim.o.lines - height - 3 -- 3 for cmdline and status
    col = vim.o.columns - width - 2
  end

  -- Create window
  local win = vim.api.nvim_open_win(bufnr, false, {
    relative = "editor",
    width = width,
    height = height,
    row = row,
    col = col,
    style = "minimal",
    border = "rounded",
    title = title ~= "" and (" " .. title .. " ") or nil,
    title_pos = "center",
    focusable = true,
  })

  -- Set window options
  vim.api.nvim_win_set_option(win, "wrap", true)
  vim.api.nvim_win_set_option(win, "linebreak", true)

  -- Setup close keybindings
  vim.keymap.set("n", "q", function()
    if vim.api.nvim_win_is_valid(win) then
      vim.api.nvim_win_close(win, true)
    end
    if opts.on_close then
      opts.on_close()
    end
  end, { buffer = bufnr, silent = true })

  vim.keymap.set("n", "<Esc>", function()
    if vim.api.nvim_win_is_valid(win) then
      vim.api.nvim_win_close(win, true)
    end
    if opts.on_close then
      opts.on_close()
    end
  end, { buffer = bufnr, silent = true })

  return {
    bufnr = bufnr,
    win = win,
  }
end

-- Create a loading popup with animation
-- Shows a loading spinner and message, and listens for completion events
-- @param message string: Loading message to display
-- @param event_name string: Event name to listen for completion
-- @param opts table: Optional configuration
--   - on_complete: function(data) - Called when event is received
-- @return table: { bufnr, win, close = function }
M.create_loading_popup = function(message, event_name, opts)
  opts = opts or {}

  -- Spinner frames (walking lines using Braille characters)
  local spinner_frames = { "⠋", "⠙", "⠹", "⠸", "⠼", "⠴", "⠦", "⠧", "⠇", "⠏" }
  local current_frame = 1

  -- Calculate window size (just enough for one line)
  local width = math.max(35, #message + 6)
  local height = 1

  -- Calculate bottom-right position (higher up to avoid status line)
  local row = vim.o.lines - height - 5 -- 5 to avoid covering status line
  local col = vim.o.columns - width - 2

  -- Create buffer
  local bufnr = vim.api.nvim_create_buf(false, true)
  vim.api.nvim_buf_set_option(bufnr, "buftype", "nofile")
  vim.api.nvim_buf_set_option(bufnr, "bufhidden", "wipe")
  vim.api.nvim_buf_set_option(bufnr, "swapfile", false)
  vim.api.nvim_buf_set_option(bufnr, "modifiable", false)

  -- Create window
  local win = vim.api.nvim_open_win(bufnr, false, {
    relative = "editor",
    width = width,
    height = height,
    row = row,
    col = col,
    style = "minimal",
    border = "rounded",
    title = " Loading ",
    title_pos = "center",
    focusable = false,
  })

  local timer = nil
  local is_closed = false

  -- Function to update the spinner
  local function update_spinner()
    if is_closed or not vim.api.nvim_buf_is_valid(bufnr) or not vim.api.nvim_win_is_valid(win) then
      if timer then
        timer:stop()
        timer:close()
      end
      return
    end

    vim.schedule(function()
      if is_closed or not vim.api.nvim_buf_is_valid(bufnr) then
        return
      end

      local spinner = spinner_frames[current_frame]
      local display_lines = {
        string.format(" %s  %s", spinner, message),
      }

      vim.api.nvim_buf_set_option(bufnr, "modifiable", true)
      vim.api.nvim_buf_set_lines(bufnr, 0, -1, false, display_lines)
      vim.api.nvim_buf_set_option(bufnr, "modifiable", false)

      current_frame = (current_frame % #spinner_frames) + 1
    end)
  end

  -- Start animation timer
  timer = vim.loop.new_timer()
  timer:start(0, 100, vim.schedule_wrap(update_spinner))

  -- Close function
  local function close()
    is_closed = true

    if timer then
      timer:stop()
      timer:close()
      timer = nil
    end

    if vim.api.nvim_win_is_valid(win) then
      vim.api.nvim_win_close(win, true)
    end
  end

  -- Listen for completion event
  local events = require("system.events")
  local listener_id = events.once(event_name, function(data)
    close()

    if opts.on_complete then
      vim.schedule(function()
        opts.on_complete(data)
      end)
    end
  end)

  return {
    bufnr = bufnr,
    win = win,
    close = close,
    listener_id = listener_id,
  }
end

-- Create a split-view code review modal window
-- @param review_data table: Array of file reviews with structure:
--   { filename, summary, issues = { {line, description} } }
-- @return table: { file_list_buf, file_list_win, content_buf, content_win, close }
M.create_review_window = function(review_data)
  if not review_data or #review_data == 0 then
    vim.notify("No review data to display", vim.log.levels.WARN)
    return nil
  end

  -- Window dimensions
  local width = math.floor(vim.o.columns * 0.9)
  local height = math.floor(vim.o.lines * 0.9)
  local row = math.floor((vim.o.lines - height) / 2) - 1  -- One line higher
  local col = math.floor((vim.o.columns - width) / 2)

  -- Get normal buffer background color
  local normal_bg = vim.api.nvim_get_hl(0, { name = "Normal" }).bg
  local bg_color = normal_bg and string.format("#%06x", normal_bg) or nil

  -- Calculate split widths (account for gap between windows)
  local file_list_width = math.floor(width * 0.25)
  local gap = 2  -- Gap between windows to ensure borders are visible
  local content_width = width - file_list_width - gap

  -- Create file list buffer
  local file_list_buf = vim.api.nvim_create_buf(false, true)
  vim.api.nvim_buf_set_option(file_list_buf, "buftype", "nofile")
  vim.api.nvim_buf_set_option(file_list_buf, "bufhidden", "wipe")
  vim.api.nvim_buf_set_option(file_list_buf, "swapfile", false)

  -- Create content buffer
  local content_buf = vim.api.nvim_create_buf(false, true)
  vim.api.nvim_buf_set_option(content_buf, "buftype", "nofile")
  vim.api.nvim_buf_set_option(content_buf, "bufhidden", "wipe")
  vim.api.nvim_buf_set_option(content_buf, "swapfile", false)
  -- Don't set filetype to avoid unwanted syntax highlighting (e.g., markdown highlighting underscores)

  -- Create file list window (left side)
  local file_list_win = vim.api.nvim_open_win(file_list_buf, false, {
    relative = "editor",
    width = file_list_width,
    height = height,
    row = row,
    col = col,
    style = "minimal",
    border = "rounded",
    title = " Files ",
    title_pos = "center",
    focusable = true,
  })

  -- Create content window (right side)
  local content_win = vim.api.nvim_open_win(content_buf, true, {
    relative = "editor",
    width = content_width,
    height = height,
    row = row,
    col = col + file_list_width + gap,
    style = "minimal",
    border = "rounded",
    title = " Review ",
    title_pos = "center",
    focusable = true,
  })

  -- Set window options
  vim.api.nvim_win_set_option(content_win, "wrap", true)
  vim.api.nvim_win_set_option(content_win, "linebreak", true)
  vim.api.nvim_win_set_option(file_list_win, "cursorline", true)

  -- Match window backgrounds to normal buffer background
  if bg_color then
    vim.api.nvim_win_set_option(content_win, "winhl", "Normal:Normal,FloatBorder:FloatBorder")
    vim.api.nvim_win_set_option(file_list_win, "winhl", "Normal:Normal,FloatBorder:FloatBorder")
  end

  -- Create custom highlight groups
  vim.api.nvim_set_hl(0, "ReviewIssueLine", { bg = "#3a3a00", fg = "#ffffff" })
  vim.api.nvim_set_hl(0, "ReviewBugComment", { fg = "#ff4444", bold = true })  -- Red for bugs
  vim.api.nvim_set_hl(0, "ReviewHintComment", { fg = "#ffaa00", bold = true }) -- Yellow for hints

  -- Track current file selection
  local current_file_idx = 1

  -- Helper function to wrap text to fit within a given width
  local function wrap_text(text, max_width, prefix)
    local lines = {}
    local current_line = ""

    for word in text:gmatch("%S+") do
      local test_line = current_line == "" and word or (current_line .. " " .. word)
      if #test_line > max_width then
        if current_line ~= "" then
          table.insert(lines, current_line)
          current_line = word
        else
          -- Single word is too long, just add it
          table.insert(lines, word)
          current_line = ""
        end
      else
        current_line = test_line
      end
    end

    if current_line ~= "" then
      table.insert(lines, current_line)
    end

    -- Add prefix to all lines (if prefix is provided)
    if prefix and prefix ~= "" then
      for i, line in ipairs(lines) do
        lines[i] = prefix .. line
      end
    end

    return lines
  end

  -- Function to render file list
  local function render_file_list()
    local lines = {}
    local line_highlights = {}

    for i, file_data in ipairs(review_data) do
      local filename = vim.fn.fnamemodify(file_data.filename, ":t")
      local issue_count = #file_data.issues
      local marker = (i == current_file_idx) and "▶ " or "  "
      local line = string.format("%s%s (%d)", marker, filename, issue_count)
      table.insert(lines, line)

      -- Determine severity color
      local has_bug = false
      local has_hint = false
      for _, issue in ipairs(file_data.issues) do
        if issue.severity == "bug" then
          has_bug = true
          break
        elseif issue.severity == "hint" then
          has_hint = true
        end
      end

      -- Store highlight info
      if has_bug then
        table.insert(line_highlights, { line = i, hl_group = "ReviewBugComment" })
      elseif has_hint then
        table.insert(line_highlights, { line = i, hl_group = "ReviewHintComment" })
      end
    end

    vim.api.nvim_buf_set_option(file_list_buf, "modifiable", true)
    vim.api.nvim_buf_set_lines(file_list_buf, 0, -1, false, lines)
    vim.api.nvim_buf_set_option(file_list_buf, "modifiable", false)

    -- Apply highlights to filenames
    local ns_id = vim.api.nvim_create_namespace("file_list_highlights")
    vim.api.nvim_buf_clear_namespace(file_list_buf, ns_id, 0, -1)
    for _, hl in ipairs(line_highlights) do
      vim.api.nvim_buf_add_highlight(
        file_list_buf,
        ns_id,
        hl.hl_group,
        hl.line - 1,
        0,
        -1
      )
    end

    -- Set cursor position
    if vim.api.nvim_win_is_valid(file_list_win) then
      pcall(vim.api.nvim_win_set_cursor, file_list_win, {current_file_idx, 0})
    end
  end

  -- Function to render file content with issues
  local function render_file_content()
    local file_data = review_data[current_file_idx]
    if not file_data then return end

    local lines = {}
    local highlights = {}
    local first_issue_line = nil  -- Track the first line with an issue comment

    -- Add summary section only if meaningful
    local has_summary = file_data.summary and file_data.summary ~= ""
    local header_line_count = 0

    if has_summary then
      table.insert(lines, file_data.summary)
      table.insert(lines, string.rep("─", content_width))
      header_line_count = #lines
    end

    -- Read actual file content
    local file_path = file_data.filename
    local file_lines = {}

    if vim.fn.filereadable(file_path) == 1 then
      file_lines = vim.fn.readfile(file_path)
    else
      file_lines = {"(File not found or not readable)"}
    end

    -- Create a map of line numbers to issues (with severity)
    local issue_map = {}
    for _, issue in ipairs(file_data.issues) do
      if not issue_map[issue.line] then
        issue_map[issue.line] = {}
      end
      table.insert(issue_map[issue.line], {
        description = issue.description,
        severity = issue.severity or "hint"
      })
    end

    -- Display file content with highlights
    local current_display_line = header_line_count
    for line_num, line_content in ipairs(file_lines) do
      current_display_line = current_display_line + 1

      -- Add the code line
      table.insert(lines, string.format("%4d │ %s", line_num, line_content))

      -- If this line has issues, highlight it and add comments
      if issue_map[line_num] then
        table.insert(highlights, {
          line = current_display_line,
          hl_group = "ReviewIssueLine"
        })

        -- Add all comments for this line
        for _, issue in ipairs(issue_map[line_num]) do
          local icon = issue.severity == "bug" and "🐛" or "💡"

          -- Split description into words for manual wrapping
          local words = {}
          for word in issue.description:gmatch("%S+") do
            table.insert(words, word)
          end

          -- Build wrapped lines manually
          local wrapped_lines = {}
          local current_line = ""
          local max_width = content_width - 15  -- Account for prefix and spacing

          for _, word in ipairs(words) do
            local test_line = current_line == "" and word or (current_line .. " " .. word)
            if #test_line > max_width then
              if current_line ~= "" then
                table.insert(wrapped_lines, current_line)
                current_line = word
              else
                table.insert(wrapped_lines, word)
                current_line = ""
              end
            else
              current_line = test_line
            end
          end

          if current_line ~= "" then
            table.insert(wrapped_lines, current_line)
          end

          -- Add wrapped lines with proper formatting
          for i, text_line in ipairs(wrapped_lines) do
            current_display_line = current_display_line + 1

            if i == 1 then
              -- First line with icon
              table.insert(lines, string.format("     │ %s %s", icon, text_line))

              -- Track first issue comment line for auto-scrolling
              if not first_issue_line then
                first_issue_line = current_display_line
              end
            else
              -- Continuation lines without icon, aligned
              table.insert(lines, string.format("     │    %s", text_line))
            end

            -- Add highlight for the comment line
            table.insert(highlights, {
              line = current_display_line,
              hl_group = issue.severity == "bug" and "ReviewBugComment" or "ReviewHintComment"
            })
          end
        end
      end
    end

    -- Set content
    vim.api.nvim_buf_set_option(content_buf, "modifiable", true)
    vim.api.nvim_buf_set_lines(content_buf, 0, -1, false, lines)
    vim.api.nvim_buf_set_option(content_buf, "modifiable", false)

    -- Apply highlights
    local ns_id = vim.api.nvim_create_namespace("review_highlights")
    vim.api.nvim_buf_clear_namespace(content_buf, ns_id, 0, -1)

    for _, hl in ipairs(highlights) do
      vim.api.nvim_buf_add_highlight(
        content_buf,
        ns_id,
        hl.hl_group,
        hl.line - 1,
        0,
        -1
      )
    end

    -- Scroll to first issue comment if one exists, otherwise go to top
    if vim.api.nvim_win_is_valid(content_win) then
      local target_line = first_issue_line or 1
      pcall(vim.api.nvim_win_set_cursor, content_win, {target_line, 0})

      -- Center the line on screen for better visibility
      if first_issue_line then
        vim.api.nvim_win_call(content_win, function()
          vim.cmd("normal! zz")  -- Center line on screen
        end)
      end
    end
  end

  -- Function to navigate files
  local function select_file(idx)
    if idx < 1 or idx > #review_data then return end
    current_file_idx = idx
    render_file_list()
    render_file_content()
  end

  -- Initial render
  render_file_list()
  render_file_content()

  -- Close function
  local function close()
    if vim.api.nvim_win_is_valid(file_list_win) then
      vim.api.nvim_win_close(file_list_win, true)
    end
    if vim.api.nvim_win_is_valid(content_win) then
      vim.api.nvim_win_close(content_win, true)
    end
  end

  -- Keybindings for both buffers
  local function setup_keys(bufnr)
    -- Close window
    vim.keymap.set("n", "q", close, { buffer = bufnr, silent = true })
    vim.keymap.set("n", "<Esc>", close, { buffer = bufnr, silent = true })

    -- Navigate files
    vim.keymap.set("n", "j", function() select_file(current_file_idx + 1) end, { buffer = bufnr, silent = true })
    vim.keymap.set("n", "k", function() select_file(current_file_idx - 1) end, { buffer = bufnr, silent = true })
    vim.keymap.set("n", "<Down>", function() select_file(current_file_idx + 1) end, { buffer = bufnr, silent = true })
    vim.keymap.set("n", "<Up>", function() select_file(current_file_idx - 1) end, { buffer = bufnr, silent = true })
  end

  setup_keys(file_list_buf)
  setup_keys(content_buf)

  -- Enable mouse support for file list
  vim.api.nvim_buf_set_option(file_list_buf, "mouse", "a")
  vim.api.nvim_win_set_option(file_list_win, "mouse", "a")

  -- Handle mouse clicks on file list
  vim.keymap.set("n", "<LeftMouse>", function()
    -- Get mouse position
    local mouse_pos = vim.fn.getmousepos()

    -- Check if click was in file list window
    if mouse_pos.winid == file_list_win then
      -- Get the line number clicked
      local line = mouse_pos.line
      if line >= 1 and line <= #review_data then
        select_file(line)
      end
    end
  end, { buffer = file_list_buf, silent = true })

  return {
    file_list_buf = file_list_buf,
    file_list_win = file_list_win,
    content_buf = content_buf,
    content_win = content_win,
    close = close,
  }
end

-- Create a progressive review window with live updates
-- @param file_paths: Array of file paths to review
-- @param on_review_file: Callback function(file_path, file_index) - called when a file needs to be reviewed
-- @param diff_changes: Optional table with diff line changes { [file_path] = { added = {}, modified = {}, deleted = {} } }
-- @return table: { update_file_status, close }
M.create_progressive_review_window = function(file_paths, on_review_file, diff_changes)
  if not file_paths or #file_paths == 0 then
    vim.notify("No files to review", vim.log.levels.WARN)
    return nil
  end

  -- Store diff changes for later use
  diff_changes = diff_changes or {}

  -- Animation frames for loading indicator
  local animation_frames = { "⠋", "⠙", "⠹", "⠸", "⠼", "⠴", "⠦", "⠧", "⠇", "⠏" }
  local animation_index = 1
  local animation_timer = nil

  -- File statuses: "pending", "reviewing", "completed"
  local file_statuses = {}
  for i, file_path in ipairs(file_paths) do
    file_statuses[i] = {
      path = file_path,
      status = "pending",
      data = nil -- Will hold { filename, summary, issues[] } when completed
    }
  end

  local selected_file_index = 1

  -- Window dimensions
  local width = math.floor(vim.o.columns * 0.9)
  local height = math.floor(vim.o.lines * 0.9)
  local row = math.floor((vim.o.lines - height) / 2) - 1
  local col = math.floor((vim.o.columns - width) / 2)

  -- Calculate split widths
  local file_list_width = math.floor(width * 0.25)
  local gap = 2
  local content_width = width - file_list_width - gap

  -- Create buffers
  local file_list_buf = vim.api.nvim_create_buf(false, true)
  vim.api.nvim_buf_set_option(file_list_buf, "buftype", "nofile")
  vim.api.nvim_buf_set_option(file_list_buf, "bufhidden", "wipe")
  vim.api.nvim_buf_set_option(file_list_buf, "swapfile", false)

  local content_buf = vim.api.nvim_create_buf(false, true)
  vim.api.nvim_buf_set_option(content_buf, "buftype", "nofile")
  vim.api.nvim_buf_set_option(content_buf, "bufhidden", "wipe")
  vim.api.nvim_buf_set_option(content_buf, "swapfile", false)

  -- Create windows
  local file_list_win = vim.api.nvim_open_win(file_list_buf, false, {
    relative = "editor",
    width = file_list_width,
    height = height,
    row = row,
    col = col,
    style = "minimal",
    border = "rounded",
    title = " Files ",
    title_pos = "center",
    focusable = true,
  })

  local content_win = vim.api.nvim_open_win(content_buf, true, {
    relative = "editor",
    width = content_width,
    height = height,
    row = row,
    col = col + file_list_width + gap,
    style = "minimal",
    border = "rounded",
    title = " Review ",
    title_pos = "center",
    focusable = true,
  })

  vim.api.nvim_win_set_option(content_win, "wrap", true)
  vim.api.nvim_win_set_option(content_win, "linebreak", true)
  vim.api.nvim_win_set_option(file_list_win, "cursorline", true)

  -- Prevent scrolling beyond end of content
  vim.api.nvim_win_set_option(content_win, "scrolloff", 0)
  vim.api.nvim_win_set_option(file_list_win, "scrolloff", 0)

  -- Disable scrolling past the end
  vim.api.nvim_win_call(content_win, function()
    vim.cmd("setlocal scrolloff=0")
    vim.cmd("setlocal nocursorline")
  end)
  vim.api.nvim_win_call(file_list_win, function()
    vim.cmd("setlocal scrolloff=0")
  end)

  -- Custom highlight groups
  -- Only set background for issue lines to preserve syntax highlighting
  vim.api.nvim_set_hl(0, "ReviewIssueLine", { bg = "#3a3a00" })
  vim.api.nvim_set_hl(0, "ReviewBugComment", { fg = "#ff0000", bold = true })  -- Pure red for bugs
  vim.api.nvim_set_hl(0, "ReviewHintComment", { fg = "#ffff00", bold = true }) -- Pure yellow for hints

  -- Diff highlight groups (background colors for line numbers)
  vim.api.nvim_set_hl(0, "DiffAddedLine", { bg = "#1a4d1a" })     -- Dark green for added lines
  vim.api.nvim_set_hl(0, "DiffModifiedLine", { bg = "#4d4d1a" })  -- Dark yellow for modified lines
  vim.api.nvim_set_hl(0, "DiffDeletedLine", { bg = "#4d1a1a" })   -- Dark red for deleted lines

  -- Function to render file list
  local function render_file_list()
    local lines = {}
    local highlights = {}

    for i, file_status in ipairs(file_statuses) do
      local filename = vim.fn.fnamemodify(file_status.path, ":t")
      local marker = (i == selected_file_index) and "▶ " or "  "
      local prefix = ""
      local suffix = ""

      if file_status.status == "completed" then
        local issue_count = file_status.data and #file_status.data.issues or 0
        prefix = "✓ "
        suffix = string.format(" (%d)", issue_count)

        if file_status.data then
          local has_bug = false
          local has_hint = false
          for _, issue in ipairs(file_status.data.issues) do
            if issue.severity == "bug" then
              has_bug = true
              break
            elseif issue.severity == "hint" then
              has_hint = true
            end
          end

          if has_bug then
            table.insert(highlights, { line = i, hl_group = "ReviewBugComment" })
          elseif has_hint then
            table.insert(highlights, { line = i, hl_group = "ReviewHintComment" })
          end
        end
      elseif file_status.status == "reviewing" then
        prefix = animation_frames[animation_index] .. " "
        suffix = " (reviewing...)"
        table.insert(highlights, { line = i, hl_group = "Comment" })
      else -- pending
        prefix = "○ "
        suffix = ""
        table.insert(highlights, { line = i, hl_group = "Comment" })
      end

      table.insert(lines, marker .. prefix .. filename .. suffix)
    end

    vim.schedule(function()
      if vim.api.nvim_buf_is_valid(file_list_buf) then
        vim.api.nvim_buf_set_option(file_list_buf, "modifiable", true)
        vim.api.nvim_buf_set_lines(file_list_buf, 0, -1, false, lines)
        vim.api.nvim_buf_set_option(file_list_buf, "modifiable", false)

        local ns_id = vim.api.nvim_create_namespace("progressive_file_list")
        vim.api.nvim_buf_clear_namespace(file_list_buf, ns_id, 0, -1)
        for _, hl in ipairs(highlights) do
          vim.api.nvim_buf_add_highlight(file_list_buf, ns_id, hl.hl_group, hl.line - 1, 0, -1)
        end

        if vim.api.nvim_win_is_valid(file_list_win) then
          pcall(vim.api.nvim_win_set_cursor, file_list_win, {selected_file_index, 0})
        end
      end
    end)
  end

  -- Function to render content based on selected file
  local function render_content()
    vim.schedule(function()
      if not vim.api.nvim_buf_is_valid(content_buf) then
        return
      end

      local file_status = file_statuses[selected_file_index]
      if not file_status then
        return
      end

      local lines = {}
      local highlights = {}
      local first_issue_line = nil  -- Track the first line with an issue comment

      if file_status.status == "pending" then
        local filename = vim.fn.fnamemodify(file_status.path, ":.")
        lines = {
          string.format("File: %s", filename),
          "",
          string.rep("─", 50),
          "",
          "⏳ Waiting to be reviewed...",
          "",
          "This file is in the queue and will be reviewed soon.",
          "",
          "Files are reviewed one at a time to ensure thorough analysis."
        }
      elseif file_status.status == "reviewing" then
        local filename = vim.fn.fnamemodify(file_status.path, ":.")
        lines = {
          string.format("Reviewing: %s", filename),
          "",
          string.rep("─", 50),
          "",
          animation_frames[animation_index] .. " Analyzing changes...",
          "",
          "The AI is currently reviewing this file for:",
          "  • Potential bugs and errors",
          "  • Security vulnerabilities",
          "  • Code quality issues",
          "  • Best practice violations",
          "",
          "This may take a few seconds depending on file size."
        }
      elseif file_status.status == "completed" and file_status.data then
        local file_data = file_status.data

        if file_data.summary and file_data.summary ~= "" then
          table.insert(lines, file_data.summary)
          table.insert(lines, string.rep("─", content_width))
        end

        -- Read file content
        local file_path = file_data.filename
        local file_lines = {}

        if vim.fn.filereadable(file_path) == 1 then
          file_lines = vim.fn.readfile(file_path)
        else
          file_lines = {"(File not found or not readable)"}
        end

        -- Map line numbers to issues
        local issue_map = {}
        for _, issue in ipairs(file_data.issues) do
          if not issue_map[issue.line] then
            issue_map[issue.line] = {}
          end
          table.insert(issue_map[issue.line], {
            description = issue.description,
            severity = issue.severity or "hint"
          })
        end

        -- Get diff changes for this file
        local file_diff_changes = diff_changes[file_path] or { added = {}, modified = {}, deleted = {} }

        -- Create lookup tables for faster checking
        local added_lines = {}
        local modified_lines = {}
        for _, line_num in ipairs(file_diff_changes.added) do
          added_lines[line_num] = true
        end
        for _, line_num in ipairs(file_diff_changes.modified) do
          modified_lines[line_num] = true
        end

        -- Display file content with inline comments
        local current_display_line = #lines
        for line_num, line_content in ipairs(file_lines) do
          current_display_line = current_display_line + 1

          -- Wrap long lines to prevent overlap with line numbers
          local max_code_width = content_width - 8  -- Account for "1234 │ " prefix
          if #line_content > max_code_width then
            -- Wrap the line
            local wrapped_code_lines = {}
            local remaining = line_content
            while #remaining > 0 do
              if #remaining <= max_code_width then
                table.insert(wrapped_code_lines, remaining)
                break
              else
                table.insert(wrapped_code_lines, remaining:sub(1, max_code_width))
                remaining = remaining:sub(max_code_width + 1)
              end
            end

            -- Add first line with line number
            table.insert(lines, string.format("%4d │ %s", line_num, wrapped_code_lines[1]))

            -- Add continuation lines
            for i = 2, #wrapped_code_lines do
              current_display_line = current_display_line + 1
              table.insert(lines, string.format("     │ %s", wrapped_code_lines[i]))
            end
          else
            -- Line fits, add normally
            table.insert(lines, string.format("%4d │ %s", line_num, line_content))
          end

          -- Apply diff highlighting (will be layered under issue highlighting)
          if added_lines[line_num] then
            table.insert(highlights, {
              line = current_display_line,
              hl_group = "DiffAddedLine"
            })
          elseif modified_lines[line_num] then
            table.insert(highlights, {
              line = current_display_line,
              hl_group = "DiffModifiedLine"
            })
          end

          if issue_map[line_num] then
            table.insert(highlights, {
              line = current_display_line,
              hl_group = "ReviewIssueLine"
            })

            for _, issue in ipairs(issue_map[line_num]) do
              -- Use emojis for visual indicators
              local icon = ""
              if issue.severity == "bug" then
                icon = "🐛 "
              else
                icon = "💡 "
              end

              local words = {}
              for word in issue.description:gmatch("%S+") do
                table.insert(words, word)
              end

              local wrapped_lines = {}
              local current_line = ""
              local max_width = content_width - 15

              for _, word in ipairs(words) do
                local test_line = current_line == "" and word or (current_line .. " " .. word)
                if #test_line > max_width then
                  if current_line ~= "" then
                    table.insert(wrapped_lines, current_line)
                    current_line = word
                  else
                    table.insert(wrapped_lines, word)
                    current_line = ""
                  end
                else
                  current_line = test_line
                end
              end

              if current_line ~= "" then
                table.insert(wrapped_lines, current_line)
              end

              for i, text_line in ipairs(wrapped_lines) do
                current_display_line = current_display_line + 1
                if i == 1 then
                  -- First line with icon and text
                  table.insert(lines, "     │  " .. icon .. text_line)

                  -- Track first issue comment line for auto-scrolling
                  if not first_issue_line then
                    first_issue_line = current_display_line
                  end
                else
                  -- Continuation lines indented
                  table.insert(lines, "     │    " .. text_line)
                end

                table.insert(highlights, {
                  line = current_display_line,
                  hl_group = issue.severity == "bug" and "ReviewBugComment" or "ReviewHintComment"
                })
              end
            end
          end
        end
      end

      vim.api.nvim_buf_set_option(content_buf, "modifiable", true)
      vim.api.nvim_buf_set_lines(content_buf, 0, -1, false, lines)

      -- Set filetype for syntax highlighting FIRST (before setting modifiable to false)
      if file_status.status == "completed" and file_status.data then
        local file_path = file_status.data.filename
        local filetype = vim.filetype.match({ filename = file_path })
        if filetype then
          vim.api.nvim_buf_set_option(content_buf, "filetype", filetype)
        end
      end

      vim.api.nvim_buf_set_option(content_buf, "modifiable", false)

      -- Apply our custom highlights AFTER syntax highlighting
      -- Use higher priority namespace so we can layer on top without overriding
      if #highlights > 0 then
        local ns_id = vim.api.nvim_create_namespace("progressive_content")
        vim.api.nvim_buf_clear_namespace(content_buf, ns_id, 0, -1)

        -- Apply highlights after a small delay to ensure syntax is loaded
        vim.defer_fn(function()
          for _, hl in ipairs(highlights) do
            -- Only highlight specific lines, let syntax highlighting show through on code lines
            if hl.hl_group == "ReviewIssueLine" then
              -- For issue lines, only set background (syntax colors remain)
              pcall(vim.api.nvim_buf_add_highlight, content_buf, ns_id, hl.hl_group, hl.line - 1, 0, -1)
            else
              -- For comment lines (bug/hint), set full line color
              pcall(vim.api.nvim_buf_add_highlight, content_buf, ns_id, hl.hl_group, hl.line - 1, 0, -1)
            end
          end
        end, 10)
      end

      if vim.api.nvim_win_is_valid(content_win) then
        -- Scroll to first issue comment if one exists, otherwise go to top
        local target_line = first_issue_line or 1

        -- Set cursor to target line
        pcall(vim.api.nvim_win_set_cursor, content_win, {target_line, 0})

        -- Center the line on screen for better visibility
        if first_issue_line then
          vim.api.nvim_win_call(content_win, function()
            vim.cmd("normal! zz")  -- Center line on screen
          end)
        else
          -- Ensure window height is appropriate and no scrolling past content
          local line_count = vim.api.nvim_buf_line_count(content_buf)
          if line_count > 0 then
            -- Update window to prevent scrolling beyond content
            vim.api.nvim_win_call(content_win, function()
              vim.cmd("normal! gg")  -- Go to top
            end)
          end
        end
      end
    end)
  end

  -- Update animation
  local function update_animation()
    animation_index = (animation_index % #animation_frames) + 1
    render_file_list()
    -- Only update content if current file is reviewing
    if file_statuses[selected_file_index] and file_statuses[selected_file_index].status == "reviewing" then
      render_content()
    end
  end

  -- Start animation
  local function start_animation()
    if animation_timer then
      vim.fn.timer_stop(animation_timer)
    end
    animation_timer = vim.fn.timer_start(100, update_animation, { ["repeat"] = -1 })
  end

  -- Stop animation
  local function stop_animation()
    if animation_timer then
      vim.fn.timer_stop(animation_timer)
      animation_timer = nil
    end
  end

  -- File selection
  local function select_file(index)
    if index < 1 or index > #file_statuses then
      return
    end
    selected_file_index = index
    render_file_list()
    render_content()
  end

  -- Setup navigation for file list
  local function setup_file_list_navigation(bufnr)
    vim.keymap.set("n", "j", function() select_file(selected_file_index + 1) end, { buffer = bufnr, silent = true })
    vim.keymap.set("n", "k", function() select_file(selected_file_index - 1) end, { buffer = bufnr, silent = true })
    vim.keymap.set("n", "<Down>", function() select_file(selected_file_index + 1) end, { buffer = bufnr, silent = true })
    vim.keymap.set("n", "<Up>", function() select_file(selected_file_index - 1) end, { buffer = bufnr, silent = true })
  end

  -- Setup navigation for content window with scroll limiting
  local function setup_content_navigation(bufnr)
    -- Normal j/k with boundary checking
    vim.keymap.set("n", "j", function()
      local current_line = vim.fn.line(".")
      local last_line = vim.fn.line("$")
      if current_line < last_line then
        vim.cmd("normal! j")
      end
    end, { buffer = bufnr, silent = true })

    vim.keymap.set("n", "<Down>", function()
      local current_line = vim.fn.line(".")
      local last_line = vim.fn.line("$")
      if current_line < last_line then
        vim.cmd("normal! j")
      end
    end, { buffer = bufnr, silent = true })

    vim.keymap.set("n", "k", function()
      vim.cmd("normal! k")
    end, { buffer = bufnr, silent = true })

    vim.keymap.set("n", "<Up>", function()
      vim.cmd("normal! k")
    end, { buffer = bufnr, silent = true })

    -- Ctrl+D / Ctrl+U with boundary checking
    vim.keymap.set("n", "<C-d>", function()
      local current_line = vim.fn.line(".")
      local last_line = vim.fn.line("$")
      local win_height = vim.api.nvim_win_get_height(0)
      local half_page = math.floor(win_height / 2)

      if current_line + half_page <= last_line then
        vim.cmd("normal! \x04")  -- Ctrl+D
      else
        vim.cmd("normal! G")  -- Go to last line
      end
    end, { buffer = bufnr, silent = true })

    vim.keymap.set("n", "<C-u>", function()
      vim.cmd("normal! \x15")  -- Ctrl+U
    end, { buffer = bufnr, silent = true })

    -- Ctrl+F / Ctrl+B with boundary checking
    vim.keymap.set("n", "<C-f>", function()
      local current_line = vim.fn.line(".")
      local last_line = vim.fn.line("$")
      local win_height = vim.api.nvim_win_get_height(0)

      if current_line + win_height <= last_line then
        vim.cmd("normal! \x06")  -- Ctrl+F
      else
        vim.cmd("normal! G")  -- Go to last line
      end
    end, { buffer = bufnr, silent = true })

    vim.keymap.set("n", "<C-b>", function()
      vim.cmd("normal! \x02")  -- Ctrl+B
    end, { buffer = bufnr, silent = true })

    -- G command to go to last line (keeping it at bottom of window)
    vim.keymap.set("n", "G", function()
      vim.cmd("normal! G")
      -- Adjust view so last line is at bottom of window
      local last_line = vim.fn.line("$")
      local win_height = vim.api.nvim_win_get_height(0)
      local topline = math.max(1, last_line - win_height + 1)
      vim.fn.winrestview({ topline = topline })
    end, { buffer = bufnr, silent = true })

    -- Mouse scroll with boundary checking
    vim.keymap.set("n", "<ScrollWheelDown>", function()
      local current_line = vim.fn.line(".")
      local last_line = vim.fn.line("$")
      local win_height = vim.api.nvim_win_get_height(0)
      local bottom_line = vim.fn.line("w$")

      -- Only scroll if we haven't reached the last line at the bottom of window
      if bottom_line < last_line then
        vim.cmd("normal! 3\x05")  -- Scroll down 3 lines (Ctrl+E x3)
      end
    end, { buffer = bufnr, silent = true })

    vim.keymap.set("n", "<ScrollWheelUp>", function()
      vim.cmd("normal! 3\x19")  -- Scroll up 3 lines (Ctrl+Y x3)
    end, { buffer = bufnr, silent = true })
  end

  local function setup_mouse_navigation()
    vim.keymap.set("n", "<LeftMouse>", function()
      local mouse_pos = vim.fn.getmousepos()
      if mouse_pos.winid == file_list_win then
        local line = mouse_pos.line
        if line >= 1 and line <= #file_statuses then
          select_file(line)
        end
      end
    end, { buffer = file_list_buf, silent = true })
  end

  setup_file_list_navigation(file_list_buf)
  setup_content_navigation(content_buf)
  setup_mouse_navigation()

  -- Close function
  local function close()
    stop_animation()
    if vim.api.nvim_win_is_valid(file_list_win) then
      vim.api.nvim_win_close(file_list_win, true)
    end
    if vim.api.nvim_win_is_valid(content_win) then
      vim.api.nvim_win_close(content_win, true)
    end
  end

  -- Setup close keybindings
  local function setup_close_keys(bufnr)
    vim.keymap.set("n", "q", close, { buffer = bufnr, silent = true })
    vim.keymap.set("n", "Q", close, { buffer = bufnr, silent = true })
    vim.keymap.set("n", "<Esc>", close, { buffer = bufnr, silent = true })
  end

  setup_close_keys(file_list_buf)
  setup_close_keys(content_buf)

  -- Public API to update file status from LLM module
  local function update_file_status(file_index, status, data)
    if file_index < 1 or file_index > #file_statuses then
      return
    end

    file_statuses[file_index].status = status
    if data then
      file_statuses[file_index].data = data
    end

    -- Don't auto-select - let user stay on current file
    -- Only select if we're still on the initial state
    if selected_file_index == 1 and file_index == 1 and status == "completed" then
      selected_file_index = file_index
    end

    render_file_list()
    -- Only re-render content if we're viewing the file that just changed
    if selected_file_index == file_index then
      render_content()
    end

    -- Stop animation if all completed
    local all_completed = true
    for _, fs in ipairs(file_statuses) do
      if fs.status ~= "completed" then
        all_completed = false
        break
      end
    end
    if all_completed then
      stop_animation()
    end
  end

  -- Initialize
  render_file_list()
  render_content()
  start_animation()

  -- Start reviewing files via callback
  if on_review_file then
    for i = 1, #file_paths do
      on_review_file(file_paths[i], i)
    end
  end

  return {
    update_file_status = update_file_status,
    close = close,
  }
end

-- Create a 3-column conflict resolution window
-- @param filepath string: Path to the conflicted file
-- @return table: { close = function }
M.open_conflict_resolver = function(filepath)
  local git = require("utils.git")

  -- Get the three versions
  local versions = git.get_conflict_versions(filepath)
  if not versions.ours and not versions.theirs and not versions.merged then
    vim.notify("Could not load conflict versions for: " .. filepath, vim.log.levels.ERROR)
    return nil
  end

  -- Get branch names
  local branches = git.get_merge_branch_names()
  local ours_label = branches.current or "HEAD"
  local theirs_label = branches.incoming or "INCOMING"

  -- Window dimensions
  local width = vim.o.columns - 4
  local height = vim.o.lines - 4
  local row = 1
  local col = 1

  -- Calculate column widths
  local col_width = math.floor(width / 3) - 1
  local gap = 1

  -- Helper to convert string to lines
  local function to_lines(str)
    if not str or str == "" then
      return { "(empty)" }
    end

    -- Split by newline character
    local lines = {}
    local start = 1
    while start <= #str do
      local newline_pos = str:find("\n", start, true)
      if newline_pos then
        table.insert(lines, str:sub(start, newline_pos - 1))
        start = newline_pos + 1
      else
        -- Last line without newline
        local last = str:sub(start)
        if last ~= "" then
          table.insert(lines, last)
        end
        break
      end
    end

    return lines
  end

  -- Create buffers for each column
  local ours_buf = vim.api.nvim_create_buf(false, true)
  local merged_buf = vim.api.nvim_create_buf(false, true)
  local theirs_buf = vim.api.nvim_create_buf(false, true)

  -- Set buffer options
  for _, buf in ipairs({ours_buf, merged_buf, theirs_buf}) do
    vim.api.nvim_buf_set_option(buf, "buftype", "nofile")
    vim.api.nvim_buf_set_option(buf, "bufhidden", "wipe")
    vim.api.nvim_buf_set_option(buf, "swapfile", false)
  end

  -- Set content
  local ours_lines = to_lines(versions.ours)
  local merged_lines = to_lines(versions.merged)
  local theirs_lines = to_lines(versions.theirs)

  vim.api.nvim_buf_set_lines(ours_buf, 0, -1, false, ours_lines)
  vim.api.nvim_buf_set_lines(merged_buf, 0, -1, false, merged_lines)
  vim.api.nvim_buf_set_lines(theirs_buf, 0, -1, false, theirs_lines)

  -- Detect filetype from original file
  local filetype = vim.filetype.match({ filename = filepath }) or "text"
  vim.api.nvim_buf_set_option(ours_buf, "filetype", filetype)
  vim.api.nvim_buf_set_option(merged_buf, "filetype", filetype)
  vim.api.nvim_buf_set_option(theirs_buf, "filetype", filetype)

  -- Make left and right buffers read-only
  vim.api.nvim_buf_set_option(ours_buf, "modifiable", false)
  vim.api.nvim_buf_set_option(theirs_buf, "modifiable", false)

  -- Create windows
  local ours_win = vim.api.nvim_open_win(ours_buf, false, {
    relative = "editor",
    width = col_width,
    height = height,
    row = row,
    col = col,
    style = "minimal",
    border = "rounded",
    title = " " .. ours_label .. " (HEAD) ",
    title_pos = "center",
    focusable = true,
  })

  local merged_win = vim.api.nvim_open_win(merged_buf, true, {
    relative = "editor",
    width = col_width,
    height = height,
    row = row,
    col = col + col_width + gap,
    style = "minimal",
    border = "rounded",
    title = " MERGED (editable) - " .. vim.fn.fnamemodify(filepath, ":t") .. " ",
    title_pos = "center",
    focusable = true,
  })

  local theirs_win = vim.api.nvim_open_win(theirs_buf, false, {
    relative = "editor",
    width = col_width,
    height = height,
    row = row,
    col = col + (col_width + gap) * 2,
    style = "minimal",
    border = "rounded",
    title = " " .. theirs_label .. " (INCOMING) ",
    title_pos = "center",
    focusable = true,
  })

  -- Set window options
  for _, win in ipairs({ours_win, merged_win, theirs_win}) do
    vim.api.nvim_win_set_option(win, "wrap", false)
    vim.api.nvim_win_set_option(win, "number", true)
    vim.api.nvim_win_set_option(win, "relativenumber", false)
    vim.api.nvim_win_set_option(win, "cursorline", true)
  end

  -- Create custom highlight groups for conflict backgrounds
  vim.api.nvim_set_hl(0, "ConflictOurs", { bg = "#3a0000" })      -- Dark red for HEAD
  vim.api.nvim_set_hl(0, "ConflictTheirs", { bg = "#003a00" })    -- Dark green for incoming
  vim.api.nvim_set_hl(0, "ConflictMarker", { fg = "#ffff00", bold = true })
  vim.api.nvim_set_hl(0, "ConflictOursDiff", { bg = "#ff0000", fg = "#ffffff", bold = true })  -- Bright red for char diffs
  vim.api.nvim_set_hl(0, "ConflictTheirsDiff", { bg = "#00ff00", fg = "#000000", bold = true }) -- Bright green for char diffs

  -- Parse conflict sections from merged version
  local conflict_sections = {}
  local current_section = nil

  for i, line in ipairs(merged_lines) do
    if line:match("^<<<<<<<") then
      current_section = {
        start = i,
        ours_start = i + 1,
        ours_lines = {},
        theirs_lines = {}
      }
    elseif line:match("^=======") and current_section then
      current_section.separator = i
      current_section.ours_end = i - 1
      current_section.theirs_start = i + 1
    elseif line:match("^>>>>>>>") and current_section then
      current_section.theirs_end = i - 1
      current_section.end_marker = i

      -- Extract actual lines for this conflict
      for j = current_section.ours_start, current_section.ours_end do
        table.insert(current_section.ours_lines, merged_lines[j])
      end
      for j = current_section.theirs_start, current_section.theirs_end do
        table.insert(current_section.theirs_lines, merged_lines[j])
      end

      table.insert(conflict_sections, current_section)
      current_section = nil
    end
  end

  -- Highlight conflict sections and corresponding lines in side columns
  local ns_id = vim.api.nvim_create_namespace("conflict_markers")
  local ours_ns = vim.api.nvim_create_namespace("conflict_ours")
  local theirs_ns = vim.api.nvim_create_namespace("conflict_theirs")

  -- Highlight markers in merged buffer
  for i, line in ipairs(merged_lines) do
    if line:match("^<<<<<<<") or line:match("^=======") or line:match("^>>>>>>>") then
      vim.api.nvim_buf_add_highlight(merged_buf, ns_id, "ConflictMarker", i - 1, 0, -1)
    end
  end

  -- Helper function to tokenize a line into words and positions
  local function tokenize_line(str)
    local tokens = {}
    local i = 1
    while i <= #str do
      -- Skip whitespace
      local ws_start = i
      while i <= #str and str:sub(i, i):match("%s") do
        i = i + 1
      end

      -- Capture word/symbol
      if i <= #str then
        local word_start = i
        local c = str:sub(i, i)

        if c:match("%w") then
          -- Word character
          while i <= #str and str:sub(i, i):match("%w") do
            i = i + 1
          end
        else
          -- Symbol
          i = i + 1
        end

        table.insert(tokens, {
          text = str:sub(word_start, i - 1),
          start_pos = word_start - 1,  -- 0-indexed
          end_pos = i - 1
        })
      end
    end
    return tokens
  end

  -- Helper function to find word and character-level differences
  local function find_diffs(str1, str2)
    local tokens1 = tokenize_line(str1)
    local tokens2 = tokenize_line(str2)

    local diffs1 = {}
    local diffs2 = {}

    -- Compare tokens at same positions
    local max_tokens = math.max(#tokens1, #tokens2)

    for i = 1, max_tokens do
      local t1 = tokens1[i]
      local t2 = tokens2[i]

      if t1 and t2 then
        if t1.text ~= t2.text then
          -- Words differ - highlight entire words
          table.insert(diffs1, {t1.start_pos, t1.end_pos})
          table.insert(diffs2, {t2.start_pos, t2.end_pos})
        end
      elseif t1 then
        -- Extra token in str1
        table.insert(diffs1, {t1.start_pos, t1.end_pos})
      elseif t2 then
        -- Extra token in str2
        table.insert(diffs2, {t2.start_pos, t2.end_pos})
      end
    end

    return diffs1, diffs2
  end

  -- Find and highlight matching contiguous sections in ours and theirs buffers
  for _, section in ipairs(conflict_sections) do
    -- Find matching section in ours buffer (dark red)
    section.ours_buf_start = nil
    if #section.ours_lines > 0 then
      local first_line = section.ours_lines[1]
      for i = 1, #ours_lines - #section.ours_lines + 1 do
        if ours_lines[i] == first_line then
          -- Check if all lines match
          local all_match = true
          for j = 1, #section.ours_lines do
            if ours_lines[i + j - 1] ~= section.ours_lines[j] then
              all_match = false
              break
            end
          end
          -- If all match, highlight the entire section
          if all_match then
            section.ours_buf_start = i
            for j = 0, #section.ours_lines - 1 do
              vim.api.nvim_buf_add_highlight(ours_buf, ours_ns, "ConflictOurs", i + j - 1, 0, -1)
            end
            break
          end
        end
      end
    end

    -- Find matching section in theirs buffer (dark green)
    section.theirs_buf_start = nil
    if #section.theirs_lines > 0 then
      local first_line = section.theirs_lines[1]
      for i = 1, #theirs_lines - #section.theirs_lines + 1 do
        if theirs_lines[i] == first_line then
          -- Check if all lines match
          local all_match = true
          for j = 1, #section.theirs_lines do
            if theirs_lines[i + j - 1] ~= section.theirs_lines[j] then
              all_match = false
              break
            end
          end
          -- If all match, highlight the entire section
          if all_match then
            section.theirs_buf_start = i
            for j = 0, #section.theirs_lines - 1 do
              vim.api.nvim_buf_add_highlight(theirs_buf, theirs_ns, "ConflictTheirs", i + j - 1, 0, -1)
            end
            break
          end
        end
      end
    end

    -- Now highlight word-level differences between corresponding lines
    if section.ours_buf_start and section.theirs_buf_start then
      local max_lines = math.max(#section.ours_lines, #section.theirs_lines)
      for i = 1, max_lines do
        local ours_line = section.ours_lines[i] or ""
        local theirs_line = section.theirs_lines[i] or ""

        if ours_line ~= theirs_line then
          local ours_diffs, theirs_diffs = find_diffs(ours_line, theirs_line)

          -- Highlight diffs in ours buffer
          for _, range in ipairs(ours_diffs) do
            local line_idx = section.ours_buf_start + i - 2  -- 0-indexed
            vim.api.nvim_buf_add_highlight(ours_buf, ours_ns, "ConflictOursDiff", line_idx, range[1], range[2])
          end

          -- Highlight diffs in theirs buffer
          for _, range in ipairs(theirs_diffs) do
            local line_idx = section.theirs_buf_start + i - 2  -- 0-indexed
            vim.api.nvim_buf_add_highlight(theirs_buf, theirs_ns, "ConflictTheirsDiff", line_idx, range[1], range[2])
          end
        end
      end
    end
  end

  -- Function to find which conflict section cursor is in
  local function get_current_conflict_section()
    local cursor_line = vim.api.nvim_win_get_cursor(merged_win)[1]
    for _, section in ipairs(conflict_sections) do
      if cursor_line >= section.start and cursor_line <= section.end_marker then
        return section
      end
    end
    return nil
  end

  -- Synchronize scrolling with smart conflict section awareness
  local function sync_scroll()
    local cursor_pos = vim.api.nvim_win_get_cursor(merged_win)
    local cursor_line = cursor_pos[1]

    -- Find if cursor is in a conflict section
    local in_section = nil
    local offset_in_section = nil
    local is_in_ours = false
    local is_in_theirs = false

    for _, section in ipairs(conflict_sections) do
      if cursor_line >= section.start and cursor_line <= section.end_marker then
        in_section = section

        if cursor_line >= section.ours_start and cursor_line <= section.ours_end then
          -- Cursor is in the "ours" part
          offset_in_section = cursor_line - section.ours_start + 1
          is_in_ours = true
        elseif cursor_line >= section.theirs_start and cursor_line <= section.theirs_end then
          -- Cursor is in the "theirs" part
          offset_in_section = cursor_line - section.theirs_start + 1
          is_in_theirs = true
        end
        break
      end
    end

    if in_section and offset_in_section then
      -- Map to corresponding lines in side buffers
      if is_in_ours then
        -- Cursor is in the "ours" part - map to ours buffer
        if in_section.ours_buf_start then
          local target_line = in_section.ours_buf_start + offset_in_section - 1
          if vim.api.nvim_win_is_valid(ours_win) then
            pcall(vim.api.nvim_win_set_cursor, ours_win, {math.min(target_line, #ours_lines), 0})
          end
        end
        -- For theirs, show corresponding line or first line of their section
        if in_section.theirs_buf_start and offset_in_section <= #in_section.theirs_lines then
          local target_line = in_section.theirs_buf_start + offset_in_section - 1
          if vim.api.nvim_win_is_valid(theirs_win) then
            pcall(vim.api.nvim_win_set_cursor, theirs_win, {math.min(target_line, #theirs_lines), 0})
          end
        elseif in_section.theirs_buf_start then
          if vim.api.nvim_win_is_valid(theirs_win) then
            pcall(vim.api.nvim_win_set_cursor, theirs_win, {in_section.theirs_buf_start, 0})
          end
        end
      elseif is_in_theirs then
        -- Cursor is in the "theirs" part - map to theirs buffer
        if in_section.theirs_buf_start then
          local target_line = in_section.theirs_buf_start + offset_in_section - 1
          if vim.api.nvim_win_is_valid(theirs_win) then
            pcall(vim.api.nvim_win_set_cursor, theirs_win, {math.min(target_line, #theirs_lines), 0})
          end
        end
        -- For ours, show corresponding line or first line of their section
        if in_section.ours_buf_start and offset_in_section <= #in_section.ours_lines then
          local target_line = in_section.ours_buf_start + offset_in_section - 1
          if vim.api.nvim_win_is_valid(ours_win) then
            pcall(vim.api.nvim_win_set_cursor, ours_win, {math.min(target_line, #ours_lines), 0})
          end
        elseif in_section.ours_buf_start then
          if vim.api.nvim_win_is_valid(ours_win) then
            pcall(vim.api.nvim_win_set_cursor, ours_win, {in_section.ours_buf_start, 0})
          end
        end
      end
    else
      -- Not in a conflict section, use simple line number sync
      if vim.api.nvim_win_is_valid(ours_win) then
        pcall(vim.api.nvim_win_set_cursor, ours_win, {math.min(cursor_line, #ours_lines), 0})
      end
      if vim.api.nvim_win_is_valid(theirs_win) then
        pcall(vim.api.nvim_win_set_cursor, theirs_win, {math.min(cursor_line, #theirs_lines), 0})
      end
    end
  end

  -- Setup autocmd for scroll sync
  vim.api.nvim_create_autocmd({"CursorMoved", "CursorMovedI"}, {
    buffer = merged_buf,
    callback = sync_scroll,
  })

  -- Close function
  local function close()
    if vim.api.nvim_win_is_valid(ours_win) then
      vim.api.nvim_win_close(ours_win, true)
    end
    if vim.api.nvim_win_is_valid(merged_win) then
      vim.api.nvim_win_close(merged_win, true)
    end
    if vim.api.nvim_win_is_valid(theirs_win) then
      vim.api.nvim_win_close(theirs_win, true)
    end
  end

  -- Save and mark as resolved
  local function save_and_resolve()
    -- Get the edited content from merged buffer
    local edited_lines = vim.api.nvim_buf_get_lines(merged_buf, 0, -1, false)

    -- Check if there are still conflict markers
    local has_markers = false
    for _, line in ipairs(edited_lines) do
      if line:match("^<<<<<<<") or line:match("^=======") or line:match("^>>>>>>>") then
        has_markers = true
        break
      end
    end

    if has_markers then
      vim.notify("Conflict markers still present! Please resolve all conflicts first.", vim.log.levels.WARN)
      return
    end

    -- Write to file
    local file = io.open(filepath, "w")
    if not file then
      vim.notify("Failed to write to file: " .. filepath, vim.log.levels.ERROR)
      return
    end

    file:write(table.concat(edited_lines, "\n"))
    file:close()

    -- Mark as resolved in git
    local success, err = git.mark_resolved(filepath)
    if not success then
      vim.notify("Failed to mark as resolved: " .. (err or "unknown error"), vim.log.levels.ERROR)
      return
    end

    vim.notify("Conflict resolved: " .. filepath, vim.log.levels.INFO)
    close()
  end

  -- Accept ours (left) - replaces current conflict section
  local function accept_ours()
    local section = get_current_conflict_section()
    if not section then
      -- If not in conflict, accept entire file
      if not versions.ours then
        vim.notify("No HEAD version available", vim.log.levels.WARN)
        return
      end
      vim.api.nvim_buf_set_option(merged_buf, "modifiable", true)
      vim.api.nvim_buf_set_lines(merged_buf, 0, -1, false, ours_lines)
      vim.notify("Accepted entire HEAD version", vim.log.levels.INFO)
      return
    end

    -- Get the ours section lines (without markers)
    local ours_section_lines = {}
    for i = section.ours_start, section.ours_end do
      table.insert(ours_section_lines, merged_lines[i])
    end

    -- Replace the entire conflict section (including markers) with ours version
    vim.api.nvim_buf_set_option(merged_buf, "modifiable", true)
    vim.api.nvim_buf_set_lines(merged_buf, section.start - 1, section.end_marker, false, ours_section_lines)
    vim.api.nvim_buf_set_option(merged_buf, "modifiable", true)

    -- Update merged_lines reference
    merged_lines = vim.api.nvim_buf_get_lines(merged_buf, 0, -1, false)

    vim.notify("Accepted HEAD version for this conflict", vim.log.levels.INFO)
  end

  -- Accept theirs (right) - replaces current conflict section
  local function accept_theirs()
    local section = get_current_conflict_section()
    if not section then
      -- If not in conflict, accept entire file
      if not versions.theirs then
        vim.notify("No incoming version available", vim.log.levels.WARN)
        return
      end
      vim.api.nvim_buf_set_option(merged_buf, "modifiable", true)
      vim.api.nvim_buf_set_lines(merged_buf, 0, -1, false, theirs_lines)
      vim.notify("Accepted entire incoming version", vim.log.levels.INFO)
      return
    end

    -- Get the theirs section lines (without markers)
    local theirs_section_lines = {}
    for i = section.theirs_start, section.theirs_end do
      table.insert(theirs_section_lines, merged_lines[i])
    end

    -- Replace the entire conflict section (including markers) with theirs version
    vim.api.nvim_buf_set_option(merged_buf, "modifiable", true)
    vim.api.nvim_buf_set_lines(merged_buf, section.start - 1, section.end_marker, false, theirs_section_lines)
    vim.api.nvim_buf_set_option(merged_buf, "modifiable", true)

    -- Update merged_lines reference
    merged_lines = vim.api.nvim_buf_get_lines(merged_buf, 0, -1, false)

    vim.notify("Accepted incoming version for this conflict", vim.log.levels.INFO)
  end

  -- Navigate to next conflict marker
  local function next_conflict()
    local cursor = vim.api.nvim_win_get_cursor(merged_win)
    local current_line = cursor[1]
    local lines = vim.api.nvim_buf_get_lines(merged_buf, 0, -1, false)

    for i = current_line + 1, #lines do
      if lines[i]:match("^<<<<<<<") then
        vim.api.nvim_win_set_cursor(merged_win, {i, 0})
        sync_scroll()
        return
      end
    end

    vim.notify("No more conflicts below", vim.log.levels.INFO)
  end

  -- Navigate to previous conflict marker
  local function prev_conflict()
    local cursor = vim.api.nvim_win_get_cursor(merged_win)
    local current_line = cursor[1]
    local lines = vim.api.nvim_buf_get_lines(merged_buf, 0, -1, false)

    for i = current_line - 1, 1, -1 do
      if lines[i]:match("^<<<<<<<") then
        vim.api.nvim_win_set_cursor(merged_win, {i, 0})
        sync_scroll()
        return
      end
    end

    vim.notify("No more conflicts above", vim.log.levels.INFO)
  end

  -- Setup keybindings for all buffers
  local function setup_keys(buf)
    vim.keymap.set("n", "q", close, { buffer = buf, silent = true })
    vim.keymap.set("n", "<Esc>", close, { buffer = buf, silent = true })
    vim.keymap.set("n", "<C-s>", save_and_resolve, { buffer = buf, silent = true, desc = "Save and resolve conflict" })
    vim.keymap.set("n", "<leader>h", accept_ours, { buffer = buf, silent = true, desc = "Accept HEAD (left)" })
    vim.keymap.set("n", "<leader>l", accept_theirs, { buffer = buf, silent = true, desc = "Accept incoming (right)" })
    vim.keymap.set("n", "]c", next_conflict, { buffer = buf, silent = true, desc = "Next conflict" })
    vim.keymap.set("n", "[c", prev_conflict, { buffer = buf, silent = true, desc = "Previous conflict" })
  end

  setup_keys(ours_buf)
  setup_keys(merged_buf)
  setup_keys(theirs_buf)

  -- Show welcome message
  vim.schedule(function()
    vim.notify(
      "Conflict Resolver: <leader>h = Accept HEAD | <leader>l = Accept INCOMING | [c/]c = Prev/Next | <C-s> = Save | q = Close",
      vim.log.levels.INFO
    )
  end)

  return {
    close = close,
    ours_win = ours_win,
    merged_win = merged_win,
    theirs_win = theirs_win,
  }
end

-- Create a tooltip window above the cursor position
-- @param content string|table: Content to display (string or table of lines)
-- @param opts table: Optional configuration
--   - max_width: number (default 60)
--   - max_height: number (default 10)
--   - title: string (optional)
--   - sticky: boolean (default false) - if true, don't auto-close on cursor move
--   - on_close: function (optional callback when closed)
-- @return table: { bufnr, win, close }
M.create_tooltip = function(content, opts)
  opts = opts or {}
  local max_width = opts.max_width or 60
  local max_height = opts.max_height or 10
  local title = opts.title or nil
  local sticky = opts.sticky or false

  -- Convert content to lines
  local lines = {}
  if type(content) == "string" then
    for line in content:gmatch("[^\r\n]+") do
      table.insert(lines, line)
    end
  else
    lines = content
  end

  -- Handle empty content
  if #lines == 0 then
    lines = { "(no content)" }
  end

  -- Word wrap lines to max_width
  local wrapped_lines = {}
  for _, line in ipairs(lines) do
    if #line <= max_width - 2 then
      table.insert(wrapped_lines, " " .. line .. " ")
    else
      -- Wrap long lines
      local pos = 1
      while pos <= #line do
        local chunk = line:sub(pos, pos + max_width - 3)
        table.insert(wrapped_lines, " " .. chunk .. " ")
        pos = pos + max_width - 2
      end
    end
  end

  -- Calculate actual dimensions
  local width = 0
  for _, line in ipairs(wrapped_lines) do
    width = math.max(width, #line)
  end
  width = math.min(width, max_width)
  width = math.max(width, 10) -- Minimum width

  local height = math.min(#wrapped_lines, max_height)

  -- Get cursor position (screen coordinates)
  local cursor_pos = vim.api.nvim_win_get_cursor(0)
  local cursor_row = cursor_pos[1]
  local cursor_col = cursor_pos[2]

  -- Convert to screen position
  local screen_pos = vim.fn.screenpos(0, cursor_row, cursor_col + 1)
  local screen_row = screen_pos.row
  local screen_col = screen_pos.col

  -- Position above cursor (if there's space), otherwise below
  local row, col
  if screen_row > height + 2 then
    -- Above cursor
    row = screen_row - height - 2
  else
    -- Below cursor
    row = screen_row
  end

  -- Adjust column to keep window on screen
  col = screen_col - 1
  if col + width > vim.o.columns then
    col = vim.o.columns - width - 1
  end
  if col < 0 then col = 0 end

  -- Create buffer
  local bufnr = vim.api.nvim_create_buf(false, true)
  vim.api.nvim_buf_set_option(bufnr, "buftype", "nofile")
  vim.api.nvim_buf_set_option(bufnr, "bufhidden", "wipe")
  vim.api.nvim_buf_set_option(bufnr, "swapfile", false)
  vim.api.nvim_buf_set_option(bufnr, "modifiable", true)
  vim.api.nvim_buf_set_lines(bufnr, 0, -1, false, wrapped_lines)
  vim.api.nvim_buf_set_option(bufnr, "modifiable", false)

  -- Create window
  local win_opts = {
    relative = "editor",
    width = width,
    height = height,
    row = row,
    col = col,
    style = "minimal",
    border = "rounded",
    focusable = true,
    zindex = 100,
  }

  if title then
    win_opts.title = " " .. title .. " "
    win_opts.title_pos = "center"
  end

  local win = vim.api.nvim_open_win(bufnr, true, win_opts)

  -- Set window options
  vim.api.nvim_win_set_option(win, "wrap", true)
  vim.api.nvim_win_set_option(win, "linebreak", true)

  -- Close function
  local is_closed = false
  local function close()
    if is_closed then return end
    is_closed = true

    if vim.api.nvim_win_is_valid(win) then
      vim.api.nvim_win_close(win, true)
    end

    if opts.on_close then
      vim.schedule(opts.on_close)
    end
  end

  -- Setup close keybindings
  vim.keymap.set("n", "q", close, { buffer = bufnr, silent = true })
  vim.keymap.set("n", "<Esc>", close, { buffer = bufnr, silent = true })

  -- Close on cursor move only if not sticky
  if not sticky then
    vim.api.nvim_create_autocmd({ "CursorMoved", "CursorMovedI", "BufLeave" }, {
      buffer = bufnr,
      callback = close,
      once = true,
    })
  end

  return {
    bufnr = bufnr,
    win = win,
    close = close,
  }
end

-- Create a loading tooltip (with spinner animation)
-- @param message string: Loading message to display
-- @param opts table: Optional configuration (same as create_tooltip)
-- @return table: { bufnr, win, close, update_message }
M.create_loading_tooltip = function(message, opts)
  opts = opts or {}

  local spinner_frames = { "⠋", "⠙", "⠹", "⠸", "⠼", "⠴", "⠦", "⠧", "⠇", "⠏" }
  local current_frame = 1
  local current_message = message or "Loading..."

  -- Get cursor position
  local cursor_pos = vim.api.nvim_win_get_cursor(0)
  local cursor_row = cursor_pos[1]
  local cursor_col = cursor_pos[2]

  local screen_pos = vim.fn.screenpos(0, cursor_row, cursor_col + 1)
  local screen_row = screen_pos.row
  local screen_col = screen_pos.col

  -- Calculate position (above cursor if space, else below)
  local width = math.max(#current_message + 6, 20)
  local height = 1
  local row = screen_row > 3 and (screen_row - 3) or screen_row
  local col = screen_col - 1
  if col + width > vim.o.columns then
    col = vim.o.columns - width - 1
  end
  if col < 0 then col = 0 end

  -- Create buffer
  local bufnr = vim.api.nvim_create_buf(false, true)
  vim.api.nvim_buf_set_option(bufnr, "buftype", "nofile")
  vim.api.nvim_buf_set_option(bufnr, "bufhidden", "wipe")
  vim.api.nvim_buf_set_option(bufnr, "swapfile", false)

  -- Create window
  local win = vim.api.nvim_open_win(bufnr, false, {
    relative = "editor",
    width = width,
    height = height,
    row = row,
    col = col,
    style = "minimal",
    border = "rounded",
    focusable = false,
    zindex = 100,
  })

  local timer = nil
  local is_closed = false

  -- Update spinner
  local function update_spinner()
    if is_closed or not vim.api.nvim_buf_is_valid(bufnr) then
      if timer then
        timer:stop()
        timer:close()
      end
      return
    end

    vim.schedule(function()
      if is_closed or not vim.api.nvim_buf_is_valid(bufnr) then
        return
      end

      local spinner = spinner_frames[current_frame]
      local display_line = string.format(" %s %s ", spinner, current_message)

      vim.api.nvim_buf_set_option(bufnr, "modifiable", true)
      vim.api.nvim_buf_set_lines(bufnr, 0, -1, false, { display_line })
      vim.api.nvim_buf_set_option(bufnr, "modifiable", false)

      current_frame = (current_frame % #spinner_frames) + 1
    end)
  end

  -- Start animation
  timer = vim.loop.new_timer()
  timer:start(0, 100, vim.schedule_wrap(update_spinner))

  -- Close function
  local function close()
    if is_closed then return end
    is_closed = true

    if timer then
      timer:stop()
      timer:close()
      timer = nil
    end

    if vim.api.nvim_win_is_valid(win) then
      vim.api.nvim_win_close(win, true)
    end

    if opts.on_close then
      vim.schedule(opts.on_close)
    end
  end

  -- Update message function
  local function update_message(new_message)
    current_message = new_message
  end

  return {
    bufnr = bufnr,
    win = win,
    close = close,
    update_message = update_message,
  }
end

-- Create a list overview with file list on the left (20%) and editable buffer on the right (80%)
-- Uses real vim splits for full editing/LSP/gitsigns support
-- @param opts table:
--   items: string[] - list of file paths
--   format_item: function(item, index, is_selected) -> string (optional)
--   highlight_item: function(item, index, is_selected) -> string|nil (optional, returns hl group name)
--   title_left: string (optional, default " Files ")
--   on_open: function(item) (optional, called when a file is opened in right buffer)
--   on_close: function() (optional, called when the view is closed)
-- @return table: { close, select_item, get_current_index }
M.create_list_overview = function(opts)
  opts = opts or {}
  local items = opts.items or {}
  if #items == 0 then
    vim.notify("No items to display", vim.log.levels.WARN)
    return nil
  end

  local format_item = opts.format_item
  local highlight_item = opts.highlight_item
  local title_left = opts.title_left or " Files "
  local on_open = opts.on_open
  local on_close = opts.on_close
  local on_refresh = opts.on_refresh -- fn() -> new_opts (returns fresh items/display_items/etc)
  local auto_refresh = opts.auto_refresh
  local on_refresh_dirs = opts.on_refresh_dirs -- fn(items) -> dir list (called after refresh to rebuild watchers)

  -- Grouped display support
  local display_items = opts.display_items       -- { is_header, dir, path }[]
  local format_display = opts.format_display     -- fn(display_item) -> string
  local highlight_display = opts.highlight_display -- fn(display_item, file_index_or_"selected") -> hl group
  local use_grouped = display_items and format_display and highlight_display

  -- Build mapping: display line index -> file index in items (nil for headers)
  local line_to_file_idx = {}  -- 1-indexed display line -> file index or nil
  local file_idx_to_line = {}  -- file index -> display line
  if use_grouped then
    local file_i = 0
    for line_i, di in ipairs(display_items) do
      if not di.is_header then
        file_i = file_i + 1
        line_to_file_idx[line_i] = file_i
        file_idx_to_line[file_i] = line_i
      end
    end
  end

  -- Save current state to restore on close
  local saved_buf = vim.api.nvim_get_current_buf()
  local saved_win = vim.api.nvim_get_current_win()

  -- Current selection
  local current_index = 1
  local is_closed = false

  -- Auto-refresh infrastructure (fs watchers + debounce + polling)
  local fs_watchers = {}
  local pending_timer = nil
  local poll_timer = nil
  local last_git_status = nil
  local refresh -- forward declare so schedule_refresh can reference it
  local start_watchers, stop_watchers -- forward declare

  local function schedule_refresh()
    if is_closed then return end
    if pending_timer then return end
    pending_timer = vim.defer_fn(function()
      pending_timer = nil
      if not is_closed then
        refresh()
        if auto_refresh and on_refresh_dirs then
          local new_dirs = on_refresh_dirs(items)
          if new_dirs then
            start_watchers(new_dirs)
          end
        end
      end
    end, 300)
  end

  stop_watchers = function()
    for _, w in ipairs(fs_watchers) do
      if not w:is_closing() then
        w:stop()
        w:close()
      end
    end
    fs_watchers = {}
  end

  start_watchers = function(dirs)
    stop_watchers()
    if not auto_refresh then return end

    -- Watch .git/index for staging changes
    local git_dir = vim.fn.systemlist("git rev-parse --git-dir")[1]
    if git_dir and git_dir ~= "" then
      local index_path = git_dir .. "/index"
      local w = vim.loop.new_fs_event()
      if w then
        w:start(index_path, {}, vim.schedule_wrap(function(err)
          if not err then schedule_refresh() end
        end))
        table.insert(fs_watchers, w)
      end
    end

    -- Watch directories containing diffed files
    local seen_dirs = {}
    for _, dir in ipairs(dirs) do
      if not seen_dirs[dir] and vim.fn.isdirectory(dir) == 1 then
        seen_dirs[dir] = true
        local w = vim.loop.new_fs_event()
        if w then
          w:start(dir, {}, vim.schedule_wrap(function(err)
            if not err then schedule_refresh() end
          end))
          table.insert(fs_watchers, w)
        end
      end
    end
  end

  -- Create the file list buffer (scratch, nofile, unlisted so bufferline/
  -- tab-pickers ignore it)
  local list_buf = vim.api.nvim_create_buf(false, true)
  vim.api.nvim_buf_set_option(list_buf, "buftype", "nofile")
  vim.api.nvim_buf_set_option(list_buf, "bufhidden", "wipe")
  vim.api.nvim_buf_set_option(list_buf, "buflisted", false)
  vim.api.nvim_buf_set_option(list_buf, "swapfile", false)
  vim.api.nvim_buf_set_option(list_buf, "filetype", "list_overview")

  -- Default highlight group for selected item (fallback if no highlight_item provided)
  vim.api.nvim_set_hl(0, "ListOverviewSelected", { bg = "#ffffff", fg = "#000000" })

  -- Create layout: left split for file list, right for editing
  -- Start by creating a vertical split
  vim.cmd("topleft vnew")
  local list_win = vim.api.nvim_get_current_win()
  vim.api.nvim_win_set_buf(list_win, list_buf)

  -- Width: percentage of available columns, so panel scales when terminal
  -- is resized / fullscreened. User can drag the split with the mouse —
  -- we capture the new ratio and re-apply it on VimResized.
  local function compute_available_width()
    return vim.o.columns
  end

  local width_ratio = opts.width_ratio or 0.33
  local available_width = compute_available_width()
  vim.api.nvim_win_set_width(list_win, math.floor(available_width * width_ratio))

  -- List window options. winfixwidth=false so mouse drag on the split
  -- divider resizes the panel naturally.
  vim.api.nvim_win_set_option(list_win, "number", false)
  vim.api.nvim_win_set_option(list_win, "relativenumber", false)
  vim.api.nvim_win_set_option(list_win, "signcolumn", "no")
  vim.api.nvim_win_set_option(list_win, "cursorline", false)  -- We handle highlighting ourselves
  vim.api.nvim_win_set_option(list_win, "winfixwidth", false)
  vim.api.nvim_win_set_option(list_win, "wrap", false)
  vim.api.nvim_win_set_option(list_win, "statusline", title_left)

  -- Track user resizes (mouse drag) to update the ratio
  local resize_augroup = vim.api.nvim_create_augroup(
    "ListOverviewResize_" .. list_buf, { clear = true }
  )
  vim.api.nvim_create_autocmd("WinResized", {
    group = resize_augroup,
    callback = function()
      if not vim.api.nvim_win_is_valid(list_win) then return end
      local new_w = vim.api.nvim_win_get_width(list_win)
      local avail = compute_available_width()
      if avail > 0 and new_w >= 10 then
        width_ratio = new_w / avail
      end
    end,
  })
  -- Re-apply percentage on terminal resize / fullscreen toggle
  vim.api.nvim_create_autocmd("VimResized", {
    group = resize_augroup,
    callback = function()
      if not vim.api.nvim_win_is_valid(list_win) then return end
      local avail = compute_available_width()
      vim.api.nvim_win_set_width(list_win, math.max(10, math.floor(avail * width_ratio)))
    end,
  })

  -- Force list buffer to always stay in normal mode
  -- Block keys that enter insert mode
  for _, key in ipairs({ "i", "I", "a", "A", "o", "O", "s", "S", "c", "C", "R", "gi" }) do
    vim.api.nvim_buf_set_keymap(list_buf, "n", key, "", { noremap = true, silent = true })
  end
  -- Block visual mode
  for _, key in ipairs({ "v", "V", "<C-v>" }) do
    vim.api.nvim_buf_set_keymap(list_buf, "n", key, "", { noremap = true, silent = true })
  end
  -- Escape from any non-normal mode back to normal
  for _, mode in ipairs({ "i", "v", "x", "s" }) do
    vim.api.nvim_buf_set_keymap(list_buf, mode, "<Esc>", "<Esc>", { noremap = true, silent = true })
  end
  -- Auto-exit non-normal modes when entering the list window
  vim.api.nvim_create_autocmd({ "BufEnter", "WinEnter" }, {
    buffer = list_buf,
    callback = function()
      vim.schedule(function()
        if not vim.api.nvim_buf_is_valid(list_buf) then return end
        local mode = vim.api.nvim_get_mode().mode
        if mode ~= "n" then
          vim.api.nvim_feedkeys(vim.api.nvim_replace_termcodes("<Esc>", true, false, true), "nx", false)
        end
      end)
    end,
  })

  -- The right window is whichever window remains (the original or next)
  -- Move to the right split
  vim.cmd("wincmd l")
  local edit_win = vim.api.nvim_get_current_win()

  -- Namespace for highlights
  local ns = vim.api.nvim_create_namespace("list_overview")

  -- Forward declarations
  local render_list, open_file, select_next, select_prev, close
  local open_from_cursor, setup_edit_buf_keymaps, cleanup_edit_buf_keymaps

  -- Augroup for edit buffer keymaps
  local augroup = vim.api.nvim_create_augroup("ListOverviewEditKeys", { clear = true })

  -- Track buffers where we set keymaps so we can clean up
  local mapped_bufs = {}

  setup_edit_buf_keymaps = function(buf)
    -- Only set if not already set and buffer is valid
    if not vim.api.nvim_buf_is_valid(buf) then return end
    if mapped_bufs[buf] then return end
    mapped_bufs[buf] = true

    local key_opts = { noremap = true, silent = true, buffer = buf }

    vim.keymap.set("n", "]", function()
      if not is_closed then select_next() end
    end, key_opts)

    vim.keymap.set("n", "[", function()
      if not is_closed then select_prev() end
    end, key_opts)

    vim.keymap.set("n", "<Esc><Esc>", function()
      if not is_closed then close() end
    end, key_opts)

    vim.keymap.set("n", "<M-r>", function()
      if not is_closed then refresh() end
    end, key_opts)

    vim.keymap.set("n", "<Tab>", function()
      if not is_closed and vim.api.nvim_win_is_valid(list_win) then
        vim.api.nvim_set_current_win(list_win)
      end
    end, key_opts)

    vim.keymap.set("n", "<C-h>", function()
      if not is_closed and vim.api.nvim_win_is_valid(list_win) then
        vim.api.nvim_set_current_win(list_win)
      end
    end, key_opts)

    vim.keymap.set({ "n", "i" }, "<C-Down>", function()
      if not is_closed then select_next() end
    end, key_opts)

    vim.keymap.set({ "n", "i" }, "<C-Up>", function()
      if not is_closed then select_prev() end
    end, key_opts)

    -- Handle mouse click on file list from the edit buffer (all modes)
    local function handle_list_click_from_edit()
      if is_closed then
        local keys = vim.api.nvim_replace_termcodes("<LeftMouse>", true, false, true)
        vim.api.nvim_feedkeys(keys, "ni", false)
        return
      end
      local mouse_pos = vim.fn.getmousepos()
      if mouse_pos.winid == list_win then
        vim.api.nvim_set_current_win(list_win)
        pcall(vim.api.nvim_win_set_cursor, list_win, { mouse_pos.line, 0 })
        open_from_cursor()
        return
      end
      -- Click on a different window: switch directly to avoid feedkeys races
      if mouse_pos.winid ~= 0 and vim.api.nvim_win_is_valid(mouse_pos.winid)
         and mouse_pos.winid ~= edit_win then
        vim.api.nvim_set_current_win(mouse_pos.winid)
        pcall(vim.api.nvim_win_set_cursor, mouse_pos.winid, { mouse_pos.line, mouse_pos.column })
        return
      end
      -- Default behavior: feed the key back for normal mouse handling
      local keys = vim.api.nvim_replace_termcodes("<LeftMouse>", true, false, true)
      vim.api.nvim_feedkeys(keys, "ni", false)
    end

    -- Normal mode: handle directly
    vim.keymap.set("n", "<LeftMouse>", handle_list_click_from_edit, key_opts)
    -- Non-normal modes: escape first, then handle on next loop
    for _, mode in ipairs({ "i", "v", "x", "s" }) do
      vim.keymap.set(mode, "<LeftMouse>", function()
        -- Force exit to normal mode
        vim.cmd("normal! \27")
        vim.schedule(handle_list_click_from_edit)
      end, key_opts)
    end
  end

  cleanup_edit_buf_keymaps = function()
    for buf, _ in pairs(mapped_bufs) do
      if vim.api.nvim_buf_is_valid(buf) then
        pcall(vim.keymap.del, "n", "]", { buffer = buf })
        pcall(vim.keymap.del, "n", "[", { buffer = buf })
        pcall(vim.keymap.del, "n", "<Esc><Esc>", { buffer = buf })
        pcall(vim.keymap.del, "n", "<M-r>", { buffer = buf })
        pcall(vim.keymap.del, "n", "<Tab>", { buffer = buf })
        pcall(vim.keymap.del, "n", "<C-h>", { buffer = buf })
        for _, mode in ipairs({ "n", "i", "v", "x", "s" }) do
          pcall(vim.keymap.del, mode, "<C-Down>", { buffer = buf })
          pcall(vim.keymap.del, mode, "<C-Up>", { buffer = buf })
          pcall(vim.keymap.del, mode, "<LeftMouse>", { buffer = buf })
        end
      end
    end
    mapped_bufs = {}
  end

  -- Render the file list
  render_list = function()
    if not vim.api.nvim_buf_is_valid(list_buf) then return end

    local lines = {}
    local line_highlights = {}

    if use_grouped then
      -- Grouped mode: render headers + files
      for line_i, di in ipairs(display_items) do
        table.insert(lines, format_display(di))
        local file_idx = line_to_file_idx[line_i]
        if di.is_header then
          table.insert(line_highlights, highlight_display(di, nil))
        elseif file_idx == current_index then
          table.insert(line_highlights, "ListOverviewSelected")
        else
          table.insert(line_highlights, highlight_display(di, file_idx))
        end
      end
    else
      -- Simple mode: flat list
      for i, item in ipairs(items) do
        local display
        if format_item then
          display = format_item(item, i, i == current_index)
        else
          display = " " .. vim.fn.fnamemodify(item, ":t")
        end
        table.insert(lines, display)
        if i == current_index then
          table.insert(line_highlights, "ListOverviewSelected")
        elseif highlight_item then
          table.insert(line_highlights, highlight_item(items[i], i, false))
        else
          table.insert(line_highlights, nil)
        end
      end
    end

    vim.api.nvim_buf_set_option(list_buf, "modifiable", true)
    vim.api.nvim_buf_set_lines(list_buf, 0, -1, false, lines)
    vim.api.nvim_buf_set_option(list_buf, "modifiable", false)

    -- Apply highlights
    vim.api.nvim_buf_clear_namespace(list_buf, ns, 0, -1)
    for i, hl in ipairs(line_highlights) do
      if hl then
        if type(hl) == "string" then
          vim.api.nvim_buf_add_highlight(list_buf, ns, hl, i - 1, 0, -1)
        elseif type(hl) == "table" then
          for _, seg in ipairs(hl) do
            vim.api.nvim_buf_add_highlight(list_buf, ns, seg[1], i - 1, seg[2], seg[3])
          end
        end
      end
    end
  end

  -- Open a file in the right buffer
  open_file = function(index)
    if index < 1 or index > #items then return end
    current_index = index

    local filepath = items[index]

    -- If the edit window is gone, create a new split to the right of the list
    if not vim.api.nvim_win_is_valid(edit_win) then
      if not vim.api.nvim_win_is_valid(list_win) then return end
      vim.api.nvim_set_current_win(list_win)
      vim.cmd("wincmd l")
      local new_win = vim.api.nvim_get_current_win()
      if new_win == list_win then
        -- No window to the right, create one
        vim.cmd("belowright vnew")
        new_win = vim.api.nvim_get_current_win()
      end
      edit_win = new_win
    end

    -- Open the file in the edit window (reuse existing buffer to avoid swap prompts)
    vim.api.nvim_set_current_win(edit_win)
    -- Temporarily disable winfixbuf so we can switch buffers
    local had_fixbuf = vim.wo[edit_win].winfixbuf
    if had_fixbuf then vim.wo[edit_win].winfixbuf = false end
    local existing_buf = vim.fn.bufnr(filepath)
    if existing_buf ~= -1 then
      vim.api.nvim_win_set_buf(edit_win, existing_buf)
      -- nvim_win_set_buf doesn't trigger BufEnter, so set keymaps manually
      setup_edit_buf_keymaps(existing_buf)
      -- Trigger BufEnter so gitsigns and other plugins attach properly
      vim.api.nvim_exec_autocmds("BufEnter", { buffer = existing_buf })
    else
      vim.cmd("edit " .. vim.fn.fnameescape(filepath))
    end
    if had_fixbuf then vim.wo[edit_win].winfixbuf = true end

    -- Ensure edit window has line numbers and signcolumn for git indicators
    vim.wo[edit_win].number = true
    vim.wo[edit_win].signcolumn = "yes"

    -- Update the list highlighting
    render_list()

    -- Move cursor in file list to match
    if vim.api.nvim_win_is_valid(list_win) and vim.api.nvim_buf_is_valid(list_buf) then
      local cursor_line = current_index
      if use_grouped and file_idx_to_line[current_index] then
        cursor_line = file_idx_to_line[current_index]
      end
      vim.api.nvim_win_set_cursor(list_win, { cursor_line, 0 })
    end

    if on_open then
      on_open(filepath)
    end
  end

  -- Navigate to next/previous item
  select_next = function()
    if current_index < #items then
      open_file(current_index + 1)
    end
  end

  select_prev = function()
    if current_index > 1 then
      open_file(current_index - 1)
    end
  end

  -- Close the overview
  close = function()
    if is_closed then return end
    is_closed = true

    -- Stop auto-refresh watchers and pending timer
    stop_watchers()
    if pending_timer then
      if not pending_timer:is_closing() then
        pending_timer:stop()
        pending_timer:close()
      end
      pending_timer = nil
    end

    -- Clean up keymaps from edit buffers
    cleanup_edit_buf_keymaps()

    -- Clean up augroups
    pcall(vim.api.nvim_del_augroup_by_id, augroup)
    pcall(vim.api.nvim_del_augroup_by_id, resize_augroup)

    -- Clean up list buffer/window
    if vim.api.nvim_win_is_valid(list_win) then
      vim.api.nvim_win_close(list_win, true)
    end

    -- Restore original buffer in edit window
    if vim.api.nvim_win_is_valid(edit_win) and vim.api.nvim_buf_is_valid(saved_buf) then
      vim.api.nvim_set_current_win(edit_win)
      vim.api.nvim_win_set_buf(edit_win, saved_buf)
    end

    if on_close then
      on_close()
    end
  end

  -- Total display lines (grouped mode has headers + files, simple mode just files)
  local total_display_lines = use_grouped and #display_items or #items

  -- Refresh the list in-place (re-fetch data without closing windows)
  refresh = function()
    if is_closed or not on_refresh then return end

    -- Save current file path before refresh
    local prev_file = items[current_index]

    local new_opts = on_refresh()
    if not new_opts then return end

    -- Update items and grouped data
    items = new_opts.items or items
    display_items = new_opts.display_items
    format_display = new_opts.format_display
    highlight_display = new_opts.highlight_display
    format_item = new_opts.format_item or format_item
    highlight_item = new_opts.highlight_item or highlight_item
    use_grouped = display_items and format_display and highlight_display

    -- Rebuild line mappings
    line_to_file_idx = {}
    file_idx_to_line = {}
    if use_grouped then
      local file_i = 0
      for line_i, di in ipairs(display_items) do
        if not di.is_header then
          file_i = file_i + 1
          line_to_file_idx[line_i] = file_i
          file_idx_to_line[file_i] = line_i
        end
      end
    end

    total_display_lines = use_grouped and #display_items or #items

    -- Restore cursor to the same file if it still exists
    local restored = false
    if prev_file then
      for i, fp in ipairs(items) do
        if fp == prev_file then
          current_index = i
          restored = true
          break
        end
      end
    end
    if not restored then
      if current_index > #items then
        current_index = math.max(1, #items)
      end
    end

    render_list()
  end

  -- Open file from list cursor position (handles grouped mode)
  open_from_cursor = function()
    local cursor = vim.api.nvim_win_get_cursor(list_win)
    local line = cursor[1]
    if use_grouped then
      local file_idx = line_to_file_idx[line]
      if file_idx then
        open_file(file_idx)
      end
    else
      open_file(line)
    end
  end

  -- Set up keymaps for the list buffer
  local list_keymaps = {
    -- Navigation in file list
    { "n", "j", function()
      local cursor = vim.api.nvim_win_get_cursor(list_win)
      if cursor[1] < total_display_lines then
        vim.api.nvim_win_set_cursor(list_win, { cursor[1] + 1, 0 })
      end
    end },
    { "n", "k", function()
      local cursor = vim.api.nvim_win_get_cursor(list_win)
      if cursor[1] > 1 then
        vim.api.nvim_win_set_cursor(list_win, { cursor[1] - 1, 0 })
      end
    end },
    -- Enter opens the file under cursor
    { "n", "<CR>", open_from_cursor },
    -- Mouse click: position cursor then open (normal mode)
    { "n", "<LeftMouse>", function()
      local keys = vim.api.nvim_replace_termcodes("<LeftMouse>", true, false, true)
      vim.api.nvim_feedkeys(keys, "xn", false)
      vim.schedule(function()
        if not is_closed then
          open_from_cursor()
        end
      end)
    end },
    { "n", "<LeftRelease>", open_from_cursor },
    -- ] and [ navigate and open
    { "n", "]", select_next },
    { "n", "[", select_prev },
    -- Close
    { "n", "q", close },
    { "n", "<Esc>", close },
    { "n", "<Esc><Esc>", close },
    -- Refresh
    { "n", "<M-r>", refresh },
    -- Switch to edit window
    { "n", "<Tab>", function()
      if vim.api.nvim_win_is_valid(edit_win) then
        vim.api.nvim_set_current_win(edit_win)
      end
    end },
    { "n", "<C-l>", function()
      if vim.api.nvim_win_is_valid(edit_win) then
        vim.api.nvim_set_current_win(edit_win)
      end
    end },
    { "n", "<C-Down>", select_next },
    { "n", "<C-Up>", select_prev },
  }

  for _, km in ipairs(list_keymaps) do
    vim.api.nvim_buf_set_keymap(list_buf, km[1], km[2], "", {
      noremap = true, silent = true, callback = km[3],
    })
  end

  -- Mouse click on list buffer from any non-normal mode: escape to normal, then handle click
  for _, mode in ipairs({ "v", "x", "s", "i" }) do
    vim.keymap.set(mode, "<LeftMouse>", function()
      -- Exit to normal mode first
      vim.api.nvim_feedkeys(vim.api.nvim_replace_termcodes("<Esc>", true, false, true), "nx", false)
      vim.schedule(function()
        if is_closed then return end
        local mouse_pos = vim.fn.getmousepos()
        if mouse_pos.winid == list_win then
          vim.api.nvim_set_current_win(list_win)
          pcall(vim.api.nvim_win_set_cursor, list_win, { mouse_pos.line, 0 })
          open_from_cursor()
        else
          -- Default mouse behavior
          local keys = vim.api.nvim_replace_termcodes("<LeftMouse>", true, false, true)
          vim.api.nvim_feedkeys(keys, "ni", false)
        end
      end)
    end, { buffer = list_buf, noremap = true, silent = true })
  end

  -- When a new buffer is loaded in the edit window, set up keymaps
  vim.api.nvim_create_autocmd("BufEnter", {
    group = augroup,
    callback = function(ev)
      if is_closed then return end
      -- Check if we're in the edit window
      local current_win = vim.api.nvim_get_current_win()
      if current_win == edit_win then
        setup_edit_buf_keymaps(ev.buf)
      end
    end,
  })

  -- Clean up when list window is closed
  vim.api.nvim_create_autocmd("WinClosed", {
    group = augroup,
    pattern = tostring(list_win),
    callback = function()
      if not is_closed then
        is_closed = true
        stop_watchers()
        if pending_timer then
          if not pending_timer:is_closing() then
            pending_timer:stop()
            pending_timer:close()
          end
          pending_timer = nil
        end
        if poll_timer then
          if not poll_timer:is_closing() then
            poll_timer:stop()
            poll_timer:close()
          end
          poll_timer = nil
        end
        vim.api.nvim_del_augroup_by_id(augroup)
        if on_close then on_close() end
      end
    end,
  })

  -- Auto-refresh: BufWritePost and FocusGained trigger refresh
  if auto_refresh then
    vim.api.nvim_create_autocmd({ "BufWritePost", "FocusGained" }, {
      group = augroup,
      callback = function()
        if is_closed then return end
        schedule_refresh()
      end,
    })

    -- Periodic git status polling to detect external changes from outside nvim
    local h = io.popen("git status --porcelain 2>/dev/null")
    if h then
      last_git_status = h:read("*a")
      h:close()
    end
    poll_timer = vim.loop.new_timer()
    if poll_timer then
      poll_timer:start(2000, 2000, vim.schedule_wrap(function()
        if is_closed then
          if poll_timer and not poll_timer:is_closing() then
            poll_timer:stop()
            poll_timer:close()
          end
          return
        end
        local h2 = io.popen("git status --porcelain 2>/dev/null")
        if h2 then
          local current_status = h2:read("*a")
          h2:close()
          if current_status ~= last_git_status then
            last_git_status = current_status
            schedule_refresh()
          end
        end
      end))
    end
  end

  -- Initial render and open first file
  render_list()
  open_file(1)

  -- Start file watchers for auto-refresh
  if auto_refresh and opts.watch_dirs then
    start_watchers(opts.watch_dirs)
  end

  -- Focus the edit window
  if vim.api.nvim_win_is_valid(edit_win) then
    vim.api.nvim_set_current_win(edit_win)
  end

  return {
    close = close,
    refresh = refresh,
    select_item = open_file,
    select_next = select_next,
    select_prev = select_prev,
    get_current_index = function() return current_index end,
  }
end

return M
