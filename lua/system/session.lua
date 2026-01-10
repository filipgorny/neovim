local M = {}

local storage = require("utils.storage")

-- Table names
local SESSIONS_TABLE = "sessions"
local SESSION_BUFFERS_TABLE = "session_buffers"

local function get_git_root()
  local git_root = vim.fn.systemlist("git rev-parse --show-toplevel 2>/dev/null")[1]
  if vim.v.shell_error == 0 and git_root and git_root ~= "" then
    return git_root
  end
  return nil
end

local function get_git_branch()
  local branch = vim.fn.systemlist("git rev-parse --abbrev-ref HEAD 2>/dev/null")[1]
  if vim.v.shell_error == 0 and branch and branch ~= "" then
    return branch
  end
  return nil
end

-- Get current project context (path and git branch)
local function get_project_context()
  local project_path = get_git_root()
  local git_branch = nil

  if not project_path then
    project_path = vim.fn.getcwd()
  else
    git_branch = get_git_branch()
  end

  -- Normalize path
  project_path = vim.fn.fnamemodify(project_path, ":p")
  project_path = project_path:gsub("/$", "")

  -- Default branch if not in git repo
  if not git_branch or git_branch == "" then
    git_branch = "main"
  end

  return project_path, git_branch
end

-- Initialize sessions table
local function init_sessions_table()
  local columns = {
    { name = "id", type = "INTEGER PRIMARY KEY AUTOINCREMENT" },
    { name = "project_path", type = "TEXT NOT NULL" },
    { name = "git_branch", type = "TEXT NOT NULL" },
    { name = "cwd", type = "TEXT NOT NULL" },
    { name = "updated_at", type = "DATETIME DEFAULT CURRENT_TIMESTAMP" },
  }

  local constraints = {
    "UNIQUE(project_path, git_branch)",
  }

  local indexes = {
    {
      name = "idx_sessions_lookup",
      columns = { "project_path", "git_branch" },
    },
  }

  local success, err = storage.create_table(SESSIONS_TABLE, columns, indexes, constraints)
  if not success then
    vim.notify("Failed to initialize sessions table: " .. tostring(err), vim.log.levels.ERROR)
    return false
  end

  return true
end

-- Initialize session_buffers table
local function init_session_buffers_table()
  local columns = {
    { name = "id", type = "INTEGER PRIMARY KEY AUTOINCREMENT" },
    { name = "project_path", type = "TEXT NOT NULL" },
    { name = "git_branch", type = "TEXT NOT NULL" },
    { name = "file_path", type = "TEXT NOT NULL" },
    { name = "last_accessed", type = "DATETIME DEFAULT CURRENT_TIMESTAMP" },
  }

  local constraints = {
    "UNIQUE(project_path, git_branch, file_path)",
  }

  local indexes = {
    {
      name = "idx_session_buffers_lookup",
      columns = { "project_path", "git_branch" },
    },
  }

  local success, err = storage.create_table(SESSION_BUFFERS_TABLE, columns, indexes, constraints)
  if not success then
    vim.notify("Failed to initialize session_buffers table: " .. tostring(err), vim.log.levels.ERROR)
    return false
  end

  return true
end

-- Add buffer to session when opened
local function add_buffer_to_session(bufnr)
  bufnr = bufnr or vim.api.nvim_get_current_buf()

  -- Only track real files
  if not vim.api.nvim_buf_is_valid(bufnr) then
    return
  end

  local bufname = vim.api.nvim_buf_get_name(bufnr)
  if not bufname or bufname == "" or bufname:match("^term://") then
    return
  end

  -- Skip special buffers
  local buftype = vim.bo[bufnr].buftype
  if buftype ~= "" then
    return
  end

  local project_path, git_branch = get_project_context()

  local buffer_data = {
    project_path = project_path,
    git_branch = git_branch,
    file_path = bufname,
    last_accessed = os.date("%Y-%m-%d %H:%M:%S"),
  }

  local ok, err = storage.insert_or_replace(SESSION_BUFFERS_TABLE, buffer_data)
  if not ok then
    -- Silently fail - don't spam user with errors
    return
  end
end

-- Remove buffer from session when closed
local function remove_buffer_from_session(bufnr)
  bufnr = bufnr or vim.api.nvim_get_current_buf()

  if not vim.api.nvim_buf_is_valid(bufnr) then
    return
  end

  local bufname = vim.api.nvim_buf_get_name(bufnr)
  if not bufname or bufname == "" then
    return
  end

  local project_path, git_branch = get_project_context()

  local conditions = {
    project_path = project_path,
    git_branch = git_branch,
    file_path = bufname,
  }

  storage.delete(SESSION_BUFFERS_TABLE, conditions)
end

local function save_breakpoints()
  local ok, dap = pcall(require, "dap")
  if not ok or not dap.breakpoints then
    return -- DAP not loaded or breakpoints module not available
  end

  local debugging_ok, debugging = pcall(require, "system.debugging")
  if not debugging_ok then
    vim.notify("Failed to load debugging module", vim.log.levels.ERROR)
    return
  end

  local breakpoints = dap.breakpoints.get()

  if not breakpoints or vim.tbl_isempty(breakpoints) then
    return -- No breakpoints to save
  end

  -- Clear existing breakpoints for this project
  debugging.clear_breakpoints()

  -- Save each breakpoint to database
  local count = 0
  for buf, buf_bps in pairs(breakpoints) do
    local bufnr = tonumber(buf)
    if bufnr and vim.api.nvim_buf_is_valid(bufnr) then
      local filepath = vim.api.nvim_buf_get_name(bufnr)
      if filepath and filepath ~= "" then
        for _, bp in ipairs(buf_bps) do
          debugging.save_breakpoint(
            filepath,
            bp.line,
            bp.condition,
            bp.hitCondition,
            bp.logMessage
          )
          count = count + 1
        end
      end
    end
  end
end

local function load_breakpoints()
  local ok, dap = pcall(require, "dap")
  if not ok then
    return -- DAP not loaded yet
  end

  local debugging_ok, debugging = pcall(require, "system.debugging")
  if not debugging_ok then
    vim.notify("Failed to load debugging module", vim.log.levels.ERROR)
    return
  end

  -- Load breakpoints from database
  local file_breakpoints = debugging.load_breakpoints()

  if not file_breakpoints or vim.tbl_isempty(file_breakpoints) then
    return -- No breakpoints to load
  end

  -- Defer breakpoint restoration to ensure buffers are fully loaded
  vim.schedule(function()
    -- Restore breakpoints for each file
    for filepath, bps in pairs(file_breakpoints) do
      -- Find or create buffer for this file
      local bufnr = vim.fn.bufnr(filepath)

      -- If buffer doesn't exist, create it
      if bufnr == -1 then
        bufnr = vim.fn.bufadd(filepath)
        -- Load the buffer to ensure it's valid
        vim.fn.bufload(bufnr)
      end

      -- Set breakpoints for this buffer
      if bufnr and bufnr ~= -1 then
        for _, bp in ipairs(bps) do
          -- Create opts table from breakpoint data
          local opts = {
            condition = bp.condition,
            hitCondition = bp.hitCondition,
            logMessage = bp.logMessage,
          }
          -- Call dap.breakpoints.set with correct signature: (opts, bufnr, lnum)
          pcall(dap.breakpoints.set, opts, bufnr, bp.line)
        end
      end
    end
  end)
end

-- Sync all currently open buffers to session (mainly for manual save)
local function save_session()
  local project_path, git_branch = get_project_context()
  local cwd = vim.fn.getcwd()

  -- Update session metadata
  local session_data = {
    project_path = project_path,
    git_branch = git_branch,
    cwd = cwd,
    updated_at = os.date("%Y-%m-%d %H:%M:%S"),
  }

  storage.insert_or_replace(SESSIONS_TABLE, session_data)

  -- Sync all currently open buffers
  local buf_count = 0
  for _, buf in ipairs(vim.api.nvim_list_bufs()) do
    if vim.api.nvim_buf_is_loaded(buf) and vim.api.nvim_buf_get_option(buf, "buflisted") then
      local bufname = vim.api.nvim_buf_get_name(buf)
      if bufname and bufname ~= "" and not bufname:match("^term://") then
        add_buffer_to_session(buf)
        buf_count = buf_count + 1
      end
    end
  end

  vim.notify(
    string.format("Session synced: %d buffers (%s/%s)", buf_count, project_path, git_branch),
    vim.log.levels.INFO
  )

  -- Save breakpoints
  save_breakpoints()
end

-- Export save_session
M.save_session = save_session

vim.keymap.set("n", "<leader>S", save_session);

local function load_session()
  if vim.fn.argc() == 0 then
    local project_path, git_branch = get_project_context()

    -- Query buffers from database, ordered by last accessed
    local columns = { "file_path", "last_accessed" }
    local conditions = {
      project_path = project_path,
      git_branch = git_branch,
    }
    local order_by = { "last_accessed DESC" }

    local rows = storage.select(SESSION_BUFFERS_TABLE, columns, conditions, order_by)

    if not rows or #rows == 0 then
      return false
    end

    -- Load session metadata to restore cwd
    local session_meta = storage.select(SESSIONS_TABLE, { "cwd" }, conditions, {})
    if session_meta and #session_meta > 0 and session_meta[1][1] then
      local cwd = session_meta[1][1]
      vim.cmd("cd " .. vim.fn.fnameescape(cwd))
    end

    -- Defer buffer loading to ensure everything is initialized
    vim.schedule(function()
      -- Load all buffers (most recently accessed first)
      for _, row in ipairs(rows) do
        if #row >= 1 then
          local file_path = row[1]

          -- Open buffer if file exists
          if vim.fn.filereadable(file_path) == 1 then
            vim.cmd("badd " .. vim.fn.fnameescape(file_path))
          end
        end
      end

      -- Open the most recently accessed file
      -- Store initial buffer to potentially delete later
      local initial_buf = vim.api.nvim_get_current_buf()
      local initial_buf_name = vim.api.nvim_buf_get_name(initial_buf)
      local initial_buf_lines = vim.api.nvim_buf_get_lines(initial_buf, 0, -1, false)
      local is_empty = initial_buf_name == "" and #initial_buf_lines == 1 and initial_buf_lines[1] == ""
      if #rows > 0 and rows[1][1] then
        local first_file = rows[1][1]
        if vim.fn.filereadable(first_file) == 1 then
          vim.cmd("edit " .. vim.fn.fnameescape(first_file))
          
          -- Delete the initial empty buffer if it still exists and is empty
          if is_empty and vim.api.nvim_buf_is_valid(initial_buf) then
            vim.schedule(function()
              pcall(vim.cmd, "bdelete! " .. initial_buf)
            end)
          end
        end
      end

      -- Trigger LSP and treesitter for all buffers
      for _, buf in ipairs(vim.api.nvim_list_bufs()) do
        if vim.api.nvim_buf_is_loaded(buf) and vim.api.nvim_buf_get_option(buf, "buflisted") then
          local bufname = vim.api.nvim_buf_get_name(buf)
          if bufname and bufname ~= "" then
            vim.api.nvim_exec_autocmds("BufRead", { buffer = buf })
            vim.api.nvim_exec_autocmds("BufEnter", { buffer = buf })
          end
        end
      end

      -- Notify about loaded session
      vim.notify(
        string.format("Session loaded: %d buffers (%s/%s)", #rows, project_path, git_branch),
        vim.log.levels.INFO
      )

      -- Load breakpoints after buffers are loaded
      load_breakpoints()
    end)

    return true
  end
  return false
end

-- Export load_session with option to force load even with args
M.load_session = function(force)
  if force or vim.fn.argc() == 0 then
    local project_path, git_branch = get_project_context()

    -- Query buffers from database, ordered by last accessed
    local columns = { "file_path", "last_accessed" }
    local conditions = {
      project_path = project_path,
      git_branch = git_branch,
    }
    local order_by = { "last_accessed DESC" }

    local rows = storage.select(SESSION_BUFFERS_TABLE, columns, conditions, order_by)

    if not rows or #rows == 0 then
      vim.notify("No session found for this project", vim.log.levels.WARN)
      return false
    end

    -- Load session metadata to restore cwd
    local session_meta = storage.select(SESSIONS_TABLE, { "cwd" }, conditions, {})
    if session_meta and #session_meta > 0 and session_meta[1][1] then
      local cwd = session_meta[1][1]
      vim.cmd("cd " .. vim.fn.fnameescape(cwd))
    end

    -- Defer buffer loading to ensure everything is initialized
    vim.schedule(function()
      -- Load all buffers (most recently accessed first)
      for _, row in ipairs(rows) do
        if #row >= 1 then
          local file_path = row[1]

          -- Open buffer if file exists
          if vim.fn.filereadable(file_path) == 1 then
            vim.cmd("badd " .. vim.fn.fnameescape(file_path))
          end
        end
      end

      -- Open the most recently accessed file
      if #rows > 0 and rows[1][1] then
        local first_file = rows[1][1]
        if vim.fn.filereadable(first_file) == 1 then
          vim.cmd("edit " .. vim.fn.fnameescape(first_file))
        end
      end

      -- Trigger LSP and treesitter for all buffers
      for _, buf in ipairs(vim.api.nvim_list_bufs()) do
        if vim.api.nvim_buf_is_loaded(buf) and vim.api.nvim_buf_get_option(buf, "buflisted") then
          local bufname = vim.api.nvim_buf_get_name(buf)
          if bufname and bufname ~= "" then
            vim.api.nvim_exec_autocmds("BufRead", { buffer = buf })
            vim.api.nvim_exec_autocmds("BufEnter", { buffer = buf })
          end
        end
      end

      -- Notify about loaded session
      vim.notify(
        string.format("Session loaded: %d buffers (%s/%s)", #rows, project_path, git_branch),
        vim.log.levels.INFO
      )

      -- Load breakpoints after buffers are loaded
      load_breakpoints()
    end)

    return true
  end
  return false
end

-- Check if session exists
M.session_exists = function()
  local project_path, git_branch = get_project_context()
  local rows = storage.select(SESSIONS_TABLE, { "id" }, {
    project_path = project_path,
    git_branch = git_branch,
  }, {})
  return rows and #rows > 0
end

-- Show session info
M.session_info = function()
  local project_path, git_branch = get_project_context()

  print("Session Information:")
  print("  Project path: " .. project_path)
  print("  Git branch: " .. git_branch)

  -- Check if session exists
  local session_meta = storage.select(SESSIONS_TABLE, { "cwd", "updated_at" }, {
    project_path = project_path,
    git_branch = git_branch,
  }, {})

  if session_meta and #session_meta > 0 then
    print("  Session exists: yes")
    print("  Working directory: " .. (session_meta[1][1] or "unknown"))
    print("  Last updated: " .. (session_meta[1][2] or "unknown"))

    -- Count saved buffers
    local saved_buffers = storage.select(SESSION_BUFFERS_TABLE, { "file_path" }, {
      project_path = project_path,
      git_branch = git_branch,
    }, { "buffer_order" })

    print("  Saved buffers: " .. #saved_buffers)
    for i, row in ipairs(saved_buffers) do
      local short_name = vim.fn.fnamemodify(row[1], ":~:.")
      print("    " .. i .. ". " .. short_name)
    end
  else
    print("  Session exists: no")
  end

  print("\nCurrent buffers:")
  local buf_count = 0
  for _, buf in ipairs(vim.api.nvim_list_bufs()) do
    if vim.api.nvim_buf_is_loaded(buf) and vim.api.nvim_buf_get_option(buf, "buflisted") then
      local bufname = vim.api.nvim_buf_get_name(buf)
      if bufname and bufname ~= "" and not bufname:match("^term://") then
        buf_count = buf_count + 1
        local short_name = vim.fn.fnamemodify(bufname, ":~:.")
        print("    " .. buf_count .. ". " .. short_name)
      end
    end
  end

  if buf_count == 0 then
    print("    (no buffers)")
  end
end

M.setup = function()
  -- Initialize storage database
  if not storage.init() then
    vim.notify("Failed to initialize storage database", vim.log.levels.ERROR)
    return false
  end

  -- Initialize sessions tables
  if not init_sessions_table() then
    vim.notify("Failed to initialize sessions table", vim.log.levels.ERROR)
    return false
  end

  if not init_session_buffers_table() then
    vim.notify("Failed to initialize session_buffers table", vim.log.levels.ERROR)
    return false
  end

  -- Create user commands
  vim.api.nvim_create_user_command("SessionInfo", M.session_info, {})
  vim.api.nvim_create_user_command("SessionLoad", function()
    M.load_session(true)
  end, {})
  vim.api.nvim_create_user_command("SessionSave", save_session, {})

  -- Real-time session tracking
  local augroup = vim.api.nvim_create_augroup("SessionManager", { clear = true })

  -- Track buffer opens
  vim.api.nvim_create_autocmd({ "BufReadPost", "BufNewFile" }, {
    group = augroup,
    callback = function(args)
      -- Defer to avoid issues during startup
      vim.schedule(function()
        add_buffer_to_session(args.buf)
      end)
    end,
  })

  -- Track buffer closes
  vim.api.nvim_create_autocmd({ "BufDelete", "BufWipeout" }, {
    group = augroup,
    callback = function(args)
      remove_buffer_from_session(args.buf)
    end,
  })

  -- Update last_accessed timestamp when switching buffers (with debounce)
  local bufenter_timer = nil
  vim.api.nvim_create_autocmd({ "BufEnter" }, {
    group = augroup,
    callback = function(args)
      -- Debounce to prevent excessive DB writes during rapid buffer switches
      if bufenter_timer then
        vim.fn.timer_stop(bufenter_timer)
      end
      bufenter_timer = vim.fn.timer_start(500, function()
        vim.schedule(function()
          add_buffer_to_session(args.buf)
        end)
      end)
    end,
  })

  -- ładowanie sesji przy starcie, jeśli nie podano plików w argumencie
  -- sprawdź czy VimEnter już się wykonał
  if vim.v.vim_did_enter == 1 then
    -- VimEnter już był, załaduj sesję teraz
    load_session()
  else
    -- VimEnter jeszcze nie był, ustaw autocmd
    vim.api.nvim_create_autocmd("VimEnter", {
      callback = load_session,
    })
  end
end

return M
