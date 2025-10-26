local M = {}

local storage = require("utils.storage")

-- Table name
local TABLE_NAME = "breakpoints"

-- Get current project path and git branch
local function get_project_context()
  local cwd = vim.fn.getcwd()

  -- Try to get git root
  local git_root = vim.fn.systemlist("git rev-parse --show-toplevel 2>/dev/null")[1]
  if vim.v.shell_error == 0 and git_root and git_root ~= "" then
    cwd = git_root
  end

  -- Get git branch
  local git_branch = vim.fn.systemlist("git rev-parse --abbrev-ref HEAD 2>/dev/null")[1]
  if vim.v.shell_error ~= 0 or not git_branch or git_branch == "" then
    git_branch = "main" -- default branch
  end

  return cwd, git_branch
end

-- Initialize breakpoints table schema
local function init_breakpoints_table()
  local columns = {
    { name = "id", type = "INTEGER PRIMARY KEY AUTOINCREMENT" },
    { name = "project_path", type = "TEXT NOT NULL" },
    { name = "git_branch", type = "TEXT" },
    { name = "file_path", type = "TEXT NOT NULL" },
    { name = "line_number", type = "INTEGER NOT NULL" },
    { name = "condition", type = "TEXT" },
    { name = "hit_condition", type = "TEXT" },
    { name = "log_message", type = "TEXT" },
    { name = "created_at", type = "DATETIME DEFAULT CURRENT_TIMESTAMP" },
  }

  local constraints = {
    "UNIQUE(project_path, git_branch, file_path, line_number)"
  }

  local indexes = {
    {
      name = "idx_breakpoints_lookup",
      columns = { "project_path", "git_branch", "file_path" },
    },
  }

  local success, err = storage.create_table(TABLE_NAME, columns, indexes, constraints)
  if not success then
    vim.notify("Failed to initialize breakpoints table: " .. tostring(err), vim.log.levels.ERROR)
    return false
  end

  return true
end

-- Save a breakpoint
function M.save_breakpoint(file_path, line_number, condition, hit_condition, log_message)
  local project_path, git_branch = get_project_context()

  local data = {
    project_path = project_path,
    git_branch = git_branch,
    file_path = file_path,
    line_number = line_number,
    condition = condition or "",
    hit_condition = hit_condition or "",
    log_message = log_message or "",
  }

  local success, err = storage.insert_or_replace(TABLE_NAME, data)
  if not success then
    vim.notify("Failed to save breakpoint: " .. tostring(err), vim.log.levels.ERROR)
    return false
  end

  return true
end

-- Delete a breakpoint
function M.delete_breakpoint(file_path, line_number)
  local project_path, git_branch = get_project_context()

  local conditions = {
    project_path = project_path,
    git_branch = git_branch,
    file_path = file_path,
    line_number = line_number,
  }

  local success, err = storage.delete(TABLE_NAME, conditions)
  if not success then
    vim.notify("Failed to delete breakpoint: " .. tostring(err), vim.log.levels.ERROR)
    return false
  end

  return true
end

-- Clear all breakpoints for current project
function M.clear_breakpoints()
  local project_path, git_branch = get_project_context()

  local conditions = {
    project_path = project_path,
    git_branch = git_branch,
  }

  local success, err = storage.delete(TABLE_NAME, conditions)
  if not success then
    vim.notify("Failed to clear breakpoints: " .. tostring(err), vim.log.levels.ERROR)
    return false
  end

  return true
end

-- Load all breakpoints for current project
function M.load_breakpoints()
  local project_path, git_branch = get_project_context()

  local columns = { "file_path", "line_number", "condition", "hit_condition", "log_message" }
  local conditions = {
    project_path = project_path,
    git_branch = git_branch,
  }
  local order_by = { "file_path", "line_number" }

  local rows = storage.select(TABLE_NAME, columns, conditions, order_by)

  -- Parse results into breakpoints structure
  local breakpoints = {}
  for _, row in ipairs(rows) do
    if #row >= 2 then
      local file_path = row[1]
      local line_number = tonumber(row[2])
      local condition = row[3] or ""
      local hit_condition = row[4] or ""
      local log_message = row[5] or ""

      if not breakpoints[file_path] then
        breakpoints[file_path] = {}
      end

      table.insert(breakpoints[file_path], {
        line = line_number,
        condition = condition ~= "" and condition or nil,
        hitCondition = hit_condition ~= "" and hit_condition or nil,
        logMessage = log_message ~= "" and log_message or nil,
      })
    end
  end

  return breakpoints
end

-- Setup function to initialize the module
function M.setup()
  -- Initialize storage database
  if not storage.init() then
    vim.notify("Failed to initialize storage database", vim.log.levels.ERROR)
    return false
  end

  -- Initialize breakpoints table
  if not init_breakpoints_table() then
    vim.notify("Failed to setup debugging session storage", vim.log.levels.ERROR)
    return false
  end

  return true
end

return M
