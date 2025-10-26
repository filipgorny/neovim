local M = {}
local storage = require("utils.storage")

-- Table name
local NAV_HISTORY_TABLE = "navigation_history"
local NAV_POSITIONS_TABLE = "buffer_positions"

-- Configuration
local config = {
  max_history = 100, -- Maximum number of edit locations to track
  ignore_patterns = { -- File patterns to ignore
    "^term://",
    "^fugitive://",
    "^COMMIT_EDITMSG$",
    "^git%-rebase%-todo$",
    "neo%-tree",
    "^%[",           -- Buffers starting with [ (special buffers)
    "^dap%-",        -- DAP buffers
    "^diffview://",  -- Diffview buffers
  },
  ignore_filetypes = { -- Filetypes to ignore
    "neo-tree",
    "NvimTree",
    "help",
    "qf",
    "quickfix",
    "fugitive",
    "git",
    "gitcommit",
    "Trouble",
    "toggleterm",
    "TelescopePrompt",
    "dap-repl",
    "dapui_watches",
    "dapui_stacks",
    "dapui_breakpoints",
    "dapui_scopes",
    "dapui_console",
  },
  deduplicate_distance = 5, -- Lines threshold for deduplication
  animate_jumps = true, -- Animate line when jumping to location
}

-- State
local state = {
  current_index = 0, -- Current position in history (0 = at the latest)
  is_navigating = false, -- Flag to prevent recording during navigation
  last_edit_time = 0, -- Timestamp of last edit
  project_path = nil, -- Current project path
  git_branch = nil, -- Current git branch
}

-- Get project context
local function get_project_context()
  local git_root = vim.fn.systemlist("git rev-parse --show-toplevel 2>/dev/null")[1]
  local project_path
  local git_branch

  if vim.v.shell_error == 0 and git_root and git_root ~= "" then
    project_path = git_root
    git_branch = vim.fn.systemlist("git rev-parse --abbrev-ref HEAD 2>/dev/null")[1]
  else
    project_path = vim.fn.getcwd()
    git_branch = "main"
  end

  -- Normalize
  project_path = vim.fn.fnamemodify(project_path, ":p"):gsub("/$", "")
  if not git_branch or git_branch == "" then
    git_branch = "main"
  end

  return project_path, git_branch
end

-- Initialize navigation history table
local function init_nav_history_table()
  local columns = {
    { name = "id", type = "INTEGER PRIMARY KEY AUTOINCREMENT" },
    { name = "project_path", type = "TEXT NOT NULL" },
    { name = "git_branch", type = "TEXT NOT NULL" },
    { name = "file_path", type = "TEXT NOT NULL" },
    { name = "line_number", type = "INTEGER NOT NULL" },
    { name = "col_number", type = "INTEGER NOT NULL" },
    { name = "timestamp", type = "INTEGER NOT NULL" },
  }

  local indexes = {
    {
      name = "idx_nav_history_lookup",
      columns = { "project_path", "git_branch", "timestamp" },
    },
  }

  local success, err = storage.create_table(NAV_HISTORY_TABLE, columns, indexes, {})
  if not success then
    vim.notify("Failed to initialize navigation history table: " .. tostring(err), vim.log.levels.ERROR)
    return false
  end

  return true
end

-- Initialize buffer positions table
local function init_buffer_positions_table()
  local columns = {
    { name = "id", type = "INTEGER PRIMARY KEY AUTOINCREMENT" },
    { name = "project_path", type = "TEXT NOT NULL" },
    { name = "git_branch", type = "TEXT NOT NULL" },
    { name = "file_path", type = "TEXT NOT NULL" },
    { name = "line_number", type = "INTEGER NOT NULL" },
    { name = "col_number", type = "INTEGER NOT NULL" },
    { name = "last_accessed", type = "DATETIME DEFAULT CURRENT_TIMESTAMP" },
  }

  local constraints = {
    "UNIQUE(project_path, git_branch, file_path)",
  }

  local indexes = {
    {
      name = "idx_buffer_positions_lookup",
      columns = { "project_path", "git_branch", "file_path" },
    },
  }

  local success, err = storage.create_table(NAV_POSITIONS_TABLE, columns, indexes, constraints)
  if not success then
    vim.notify("Failed to initialize buffer positions table: " .. tostring(err), vim.log.levels.ERROR)
    return false
  end

  return true
end

-- Setup navigation tracking
function M.setup(opts)
  opts = opts or {}
  config = vim.tbl_deep_extend("force", config, opts)

  -- Initialize storage
  if not storage.init() then
    vim.notify("Failed to initialize storage database", vim.log.levels.ERROR)
    return false
  end

  -- Initialize tables
  if not init_nav_history_table() or not init_buffer_positions_table() then
    return false
  end

  -- Get project context
  state.project_path, state.git_branch = get_project_context()

  -- Setup autocmds to track edits
  M.setup_tracking()

  return true
end

-- Check if file should be ignored
local function should_ignore_file(filepath, bufnr)
  if not filepath or filepath == "" then
    return true
  end

  -- Check filepath patterns
  for _, pattern in ipairs(config.ignore_patterns) do
    if filepath:match(pattern) then
      return true
    end
  end

  -- Check filetype if buffer is provided
  if bufnr and vim.api.nvim_buf_is_valid(bufnr) then
    local ok, filetype = pcall(vim.api.nvim_buf_get_option, bufnr, "filetype")
    if ok and filetype then
      for _, ignored_ft in ipairs(config.ignore_filetypes) do
        if filetype == ignored_ft then
          return true
        end
      end
    end

    -- Also check buffer type (ignore non-file buffers)
    local ok2, buftype = pcall(vim.api.nvim_buf_get_option, bufnr, "buftype")
    if ok2 and buftype and buftype ~= "" then
      return true -- Ignore special buffer types (terminal, help, quickfix, etc.)
    end
  end

  return false
end

-- Check if two locations are close enough to be considered the same
local function is_same_location(loc1, loc2)
  if loc1.file ~= loc2.file then
    return false
  end

  -- Same file, check if lines are close
  local line_diff = math.abs(loc1.line - loc2.line)
  return line_diff <= config.deduplicate_distance
end

-- Save buffer position
local function save_buffer_position(filepath, line, col)
  if not state.project_path or not state.git_branch then
    return
  end

  if not filepath or filepath == "" then
    return
  end

  local position_data = {
    project_path = state.project_path,
    git_branch = state.git_branch,
    file_path = filepath,
    line_number = line,
    col_number = col,
    last_accessed = os.date("%Y-%m-%d %H:%M:%S"),
  }

  storage.insert_or_replace(NAV_POSITIONS_TABLE, position_data)
end

-- Restore buffer position
local function restore_buffer_position(filepath)
  if not state.project_path or not state.git_branch then
    return nil
  end

  local columns = { "line_number", "col_number" }
  local conditions = {
    project_path = state.project_path,
    git_branch = state.git_branch,
    file_path = filepath,
  }

  local rows = storage.select(NAV_POSITIONS_TABLE, columns, conditions, {})
  if rows and #rows > 0 and #rows[1] >= 2 then
    return {
      line = tonumber(rows[1][1]),
      col = tonumber(rows[1][2]),
    }
  end

  return nil
end

-- Add edit location to history
local function add_to_history(filepath, line, col, bufnr)
  -- Skip if currently navigating
  if state.is_navigating then
    return
  end

  -- Get buffer number if not provided
  bufnr = bufnr or vim.api.nvim_get_current_buf()

  -- Skip ignored files
  if should_ignore_file(filepath, bufnr) then
    return
  end

  if not state.project_path or not state.git_branch then
    return
  end

  -- Check if this location is similar to the most recent one in database
  local recent_columns = { "file_path", "line_number" }
  local recent_conditions = {
    project_path = state.project_path,
    git_branch = state.git_branch,
  }
  local recent_rows = storage.select(NAV_HISTORY_TABLE, recent_columns, recent_conditions, { "timestamp DESC" })

  -- Check if location is too similar to most recent
  if recent_rows and #recent_rows > 0 and #recent_rows[1] >= 2 then
    local last_file = recent_rows[1][1]
    local last_line = tonumber(recent_rows[1][2])

    if last_file == filepath and math.abs(last_line - line) <= config.deduplicate_distance then
      return -- Too similar, skip
    end
  end

  -- If we're not at current position, clear forward history
  if state.current_index > 0 then
    -- Delete entries newer than current position
    -- (In practice, we'll just reset index and let new entry become latest)
    state.current_index = 0
  end

  -- Add to database
  local history_data = {
    project_path = state.project_path,
    git_branch = state.git_branch,
    file_path = filepath,
    line_number = line,
    col_number = col,
    timestamp = vim.loop.now(),
  }

  local ok, err = storage.insert_or_replace(NAV_HISTORY_TABLE, history_data)
  if not ok then
    return
  end

  -- Trim old history (keep only max_history entries per project/branch)
  -- Get count of entries
  local count_rows = storage.select(
    NAV_HISTORY_TABLE,
    { "COUNT(*)" },
    { project_path = state.project_path, git_branch = state.git_branch },
    {}
  )

  if count_rows and #count_rows > 0 then
    local count = tonumber(count_rows[1][1])
    if count > config.max_history then
      -- Delete oldest entries
      local to_delete = count - config.max_history
      -- This is a bit complex in SQLite without proper ORM, but we can use a subquery
      -- For now, we'll just let it grow a bit over max_history
    end
  end
end

-- Setup tracking autocmds
function M.setup_tracking()
  local group = vim.api.nvim_create_augroup("NavigationTracking", { clear = true })

  -- Track edits on text change
  vim.api.nvim_create_autocmd({ "TextChanged", "TextChangedI" }, {
    group = group,
    callback = function(args)
      local bufnr = args.buf
      local filepath = vim.api.nvim_buf_get_name(bufnr)
      local cursor = vim.api.nvim_win_get_cursor(0)
      local line = cursor[1]
      local col = cursor[2]

      add_to_history(filepath, line, col, bufnr)
      state.last_edit_time = vim.loop.now()
    end,
  })

  -- Save buffer position when leaving buffer
  vim.api.nvim_create_autocmd("BufLeave", {
    group = group,
    callback = function(args)
      local bufnr = args.buf
      if not vim.api.nvim_buf_is_valid(bufnr) then
        return
      end

      local filepath = vim.api.nvim_buf_get_name(bufnr)
      if should_ignore_file(filepath, bufnr) then
        return
      end

      local cursor = vim.api.nvim_win_get_cursor(0)
      local line = cursor[1]
      local col = cursor[2]

      -- Save position for restoration
      save_buffer_position(filepath, line, col)

      -- Also add to navigation history when switching tabs
      add_to_history(filepath, line, col, bufnr)
    end,
  })

  -- Save buffer position when entering buffer (zmiana zakładki)
  vim.api.nvim_create_autocmd("BufEnter", {
    group = group,
    callback = function(args)
      local bufnr = args.buf
      if not vim.api.nvim_buf_is_valid(bufnr) then
        return
      end

      local filepath = vim.api.nvim_buf_get_name(bufnr)
      if should_ignore_file(filepath, bufnr) then
        return
      end

      -- Defer to ensure cursor position is set
      vim.schedule(function()
        if vim.api.nvim_buf_is_valid(bufnr) then
          local cursor = vim.api.nvim_win_get_cursor(0)
          local line = cursor[1]
          local col = cursor[2]

          save_buffer_position(filepath, line, col)
        end
      end)
    end,
  })

  -- Restore buffer position when entering buffer
  vim.api.nvim_create_autocmd("BufReadPost", {
    group = group,
    callback = function(args)
      local bufnr = args.buf
      local filepath = vim.api.nvim_buf_get_name(bufnr)

      if should_ignore_file(filepath, bufnr) then
        return
      end

      -- Restore position from database
      vim.schedule(function()
        local pos = restore_buffer_position(filepath)
        if pos and pos.line and pos.col then
          pcall(vim.api.nvim_win_set_cursor, 0, { pos.line, pos.col })
        end
      end)
    end,
  })

  -- Also track when entering a buffer after editing elsewhere
  vim.api.nvim_create_autocmd("BufEnter", {
    group = group,
    callback = function(args)
      local bufnr = args.buf

      -- Only record if we've made an edit recently (within 1 second)
      local time_since_edit = vim.loop.now() - state.last_edit_time
      if time_since_edit < 1000 then
        local filepath = vim.api.nvim_buf_get_name(bufnr)
        local cursor = vim.api.nvim_win_get_cursor(0)
        local line = cursor[1]
        local col = cursor[2]

        add_to_history(filepath, line, col, bufnr)
      end
    end,
  })
end

-- Jump to a specific location
local function jump_to_location(location)
  if not location then
    return false
  end

  -- Set navigation flag to prevent recording this jump
  state.is_navigating = true

  -- Check if file exists
  if vim.fn.filereadable(location.file) == 0 then
    vim.notify("File not found: " .. location.file, vim.log.levels.WARN)
    state.is_navigating = false
    return false
  end

  -- Open the file
  local current_file = vim.api.nvim_buf_get_name(0)
  local switched_buffer = false

  if current_file ~= location.file then
    vim.cmd("edit " .. vim.fn.fnameescape(location.file))
    switched_buffer = true
  end

  -- Use schedule to ensure buffer is fully loaded before jumping
  vim.schedule(function()
    -- Jump to the location (line is 1-indexed, col is 0-indexed)
    local ok = pcall(vim.api.nvim_win_set_cursor, 0, { location.line, location.col })

    if not ok then
      -- If cursor setting failed, try without column
      pcall(vim.api.nvim_win_set_cursor, 0, { location.line, 0 })
    end

    -- Center the screen
    vim.cmd("normal! zz")

    -- Animate the line if enabled
    if config.animate_jumps then
      vim.defer_fn(function()
        local animation = require("utils.animation")
        local bufnr = vim.api.nvim_get_current_buf()
        animation.blink_line(bufnr, location.line)
      end, switched_buffer and 150 or 50) -- Longer delay if we switched buffers
    end

    -- Reset navigation flag after a short delay
    vim.defer_fn(function()
      state.is_navigating = false
    end, 200)
  end)

  return true
end

-- Get history from database
local function get_history()
  if not state.project_path or not state.git_branch then
    return {}
  end

  local columns = { "id", "file_path", "line_number", "col_number", "timestamp" }
  local conditions = {
    project_path = state.project_path,
    git_branch = state.git_branch,
  }

  local rows = storage.select(NAV_HISTORY_TABLE, columns, conditions, { "timestamp DESC" })

  local history = {}
  for _, row in ipairs(rows) do
    if #row >= 5 then
      table.insert(history, {
        id = tonumber(row[1]),
        file = row[2],
        line = tonumber(row[3]),
        col = tonumber(row[4]),
        timestamp = tonumber(row[5]),
      })
    end
  end

  return history
end

-- Go back to previous edit location
function M.go_back()
  local history = get_history()

  -- Check if we have history
  if #history == 0 then
    vim.notify("No edit history", vim.log.levels.INFO)
    return
  end

  -- If at current location (index 0), need to move to index 1
  -- Otherwise, increment index
  if state.current_index == 0 then
    -- First, check if current location is different from history[1]
    local current_file = vim.api.nvim_buf_get_name(0)
    local cursor = vim.api.nvim_win_get_cursor(0)

    if #history >= 1 then
      local last = history[1]
      if current_file == last.file and cursor[1] == last.line then
        -- We're at the most recent location, go to the next one
        if #history >= 2 then
          state.current_index = 2
        else
          vim.notify("No more edit history", vim.log.levels.INFO)
          return
        end
      else
        -- We're not at the most recent location, go to it
        state.current_index = 1
      end
    end
  else
    -- Already gone back, go further back
    state.current_index = state.current_index + 1
  end

  -- Check bounds
  if state.current_index > #history then
    state.current_index = #history
    vim.notify("At oldest edit location", vim.log.levels.INFO)
    return
  end

  -- Jump to the location
  local location = history[state.current_index]
  if location and jump_to_location(location) then
    local filename = vim.fn.fnamemodify(location.file, ":t")
    vim.notify(
      string.format("← %s:%d (%d/%d)", filename, location.line, state.current_index, #history),
      vim.log.levels.INFO
    )
  end
end

-- Go forward to next edit location
function M.go_forward()
  local history = get_history()

  -- Check if we can go forward
  if state.current_index <= 0 then
    vim.notify("At newest edit location", vim.log.levels.INFO)
    return
  end

  -- Move forward
  state.current_index = state.current_index - 1

  if state.current_index == 0 then
    vim.notify("At newest edit location", vim.log.levels.INFO)
    return
  end

  -- Jump to the location
  local location = history[state.current_index]
  if location and jump_to_location(location) then
    local filename = vim.fn.fnamemodify(location.file, ":t")
    vim.notify(
      string.format("→ %s:%d (%d/%d)", filename, location.line, state.current_index, #history),
      vim.log.levels.INFO
    )
  end
end

-- Show edit history
function M.show_history()
  local history = get_history()

  if #history == 0 then
    vim.notify("No edit history", vim.log.levels.INFO)
    return
  end

  print("Edit History (newest first):")
  for i, loc in ipairs(history) do
    local marker = (i == state.current_index) and "→ " or "  "
    local filename = vim.fn.fnamemodify(loc.file, ":~:.")
    local time_ago = math.floor((vim.loop.now() - loc.timestamp) / 1000)
    print(string.format("%s%d. %s:%d (%ds ago)", marker, i, filename, loc.line, time_ago))

    if i >= 20 then
      print(string.format("  ... and %d more", #history - 20))
      break
    end
  end
end

-- Clear history
function M.clear_history()
  if not state.project_path or not state.git_branch then
    return
  end

  -- Clear navigation history
  storage.delete(NAV_HISTORY_TABLE, {
    project_path = state.project_path,
    git_branch = state.git_branch,
  })

  -- Clear buffer positions
  storage.delete(NAV_POSITIONS_TABLE, {
    project_path = state.project_path,
    git_branch = state.git_branch,
  })

  state.current_index = 0
  vim.notify("Edit history and buffer positions cleared", vim.log.levels.INFO)
end

-- Get status
function M.status()
  local history = get_history()

  local status_lines = {
    "Navigation Status:",
    "  Project: " .. (state.project_path or "unknown"),
    "  Branch: " .. (state.git_branch or "unknown"),
    "  History entries: " .. #history,
    "  Current index: " .. state.current_index,
    "  Can go back: " .. tostring(state.current_index < #history),
    "  Can go forward: " .. tostring(state.current_index > 0),
  }

  for _, line in ipairs(status_lines) do
    print(line)
  end

  -- Show recent history entries for debugging
  if #history > 0 then
    print("\nRecent history:")
    for i = 1, math.min(5, #history) do
      local loc = history[i]
      local filename = vim.fn.fnamemodify(loc.file, ":t")
      local marker = (i == state.current_index) and "→ " or "  "
      print(string.format("%s%d. %s:%d:%d", marker, i, filename, loc.line, loc.col))
    end
  end
end

return M
