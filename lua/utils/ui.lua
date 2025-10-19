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

-- Input dialog
M.input_window = function(title, prompt_text, callback, default_value)
  local content_lines = {
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

return M
