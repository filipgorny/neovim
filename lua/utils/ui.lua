local M = {}

-- Create a Telescope-like window with prompt
local function create_telescope_window(width, height, title, content_lines, prompt)
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

  -- Apply highlighting similar to Telescope
  vim.api.nvim_win_set_option(content_win, "winhl", "Normal:TelescopeNormal,FloatBorder:TelescopeBorder")
  vim.api.nvim_win_set_option(input_win, "winhl", "Normal:TelescopePromptNormal,FloatBorder:TelescopePromptBorder")

  -- Start in insert mode
  vim.cmd("startinsert")

  return content_buf, content_win, input_buf, input_win
end

-- Input dialog with Telescope-like appearance
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
    create_telescope_window(70, 15, title, content_lines, "> ")

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

-- List builder with Telescope-like appearance
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
      create_telescope_window(width, height, title, content_lines, "> ")

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

-- Confirmation dialog with Telescope-like appearance
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
    create_telescope_window(70, 15, title, content_lines, "> ")

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

return M
