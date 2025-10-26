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

    -- Scroll to top
    if vim.api.nvim_win_is_valid(content_win) then
      pcall(vim.api.nvim_win_set_cursor, content_win, {1, 0})
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

return M
