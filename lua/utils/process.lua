local M = {}

local storage = require("utils.storage")

local TABLE_NAME = "restart_state"

-- Create restart_state table if it doesn't exist
local function init_table()
  storage.create_table(TABLE_NAME, {
    { name = "file_path", type = "TEXT PRIMARY KEY" },
    { name = "cursor_line", type = "INTEGER DEFAULT 1" },
    { name = "cursor_col", type = "INTEGER DEFAULT 0" },
    { name = "is_active", type = "INTEGER DEFAULT 0" },
    { name = "unsaved_content", type = "TEXT" },
  })
end

-- Save state of all open buffers to SQLite
local function save_state()
  -- Clear old entries
  storage.delete_all(TABLE_NAME)

  local current_buf = vim.api.nvim_get_current_buf()

  for _, buf in ipairs(vim.api.nvim_list_bufs()) do
    if vim.api.nvim_buf_is_loaded(buf) and vim.bo[buf].buflisted then
      local name = vim.api.nvim_buf_get_name(buf)

      -- Only track real files (not terminals, special buffers, unnamed)
      if name ~= "" and not name:match("^term://") and vim.bo[buf].buftype == "" then
        -- Find cursor position from any window displaying this buffer
        local cursor_line = 1
        local cursor_col = 0
        for _, win in ipairs(vim.api.nvim_list_wins()) do
          if vim.api.nvim_win_get_buf(win) == buf then
            local pos = vim.api.nvim_win_get_cursor(win)
            cursor_line = pos[1]
            cursor_col = pos[2]
            break
          end
        end

        -- Capture unsaved content if buffer is modified
        local unsaved = nil
        if vim.bo[buf].modified then
          local lines = vim.api.nvim_buf_get_lines(buf, 0, -1, false)
          unsaved = table.concat(lines, "\n")
        end

        storage.insert_or_replace(TABLE_NAME, {
          file_path = name,
          cursor_line = cursor_line,
          cursor_col = cursor_col,
          is_active = (buf == current_buf) and 1 or 0,
          unsaved_content = unsaved,
        })
      end
    end
  end
end

-- Restore state from SQLite after restart
local function restore_state()
  local rows = storage.select(
    TABLE_NAME,
    { "file_path", "cursor_line", "cursor_col", "is_active", "unsaved_content" },
    {},
    { "is_active DESC" }
  )

  if not rows or #rows == 0 then
    return false
  end

  local active_file = nil

  for _, row in ipairs(rows) do
    local file_path = row[1]
    local cursor_line = tonumber(row[2]) or 1
    local cursor_col = tonumber(row[3]) or 0
    local is_active = tonumber(row[4]) or 0
    local unsaved = row[5]

    -- Skip files that don't exist and have no unsaved content
    if vim.fn.filereadable(file_path) == 1 or (unsaved and unsaved ~= "") then
      -- Add buffer without switching to it
      vim.cmd("badd " .. vim.fn.fnameescape(file_path))
      local bufnr = vim.fn.bufnr(file_path)
      vim.fn.bufload(bufnr)

      -- Restore unsaved content
      if unsaved and unsaved ~= "" then
        local lines = vim.split(unsaved, "\n", { plain = true })
        vim.api.nvim_buf_set_lines(bufnr, 0, -1, false, lines)
        vim.bo[bufnr].modified = true
      end

      -- Remember active file and its cursor position
      if is_active == 1 then
        active_file = { path = file_path, line = cursor_line, col = cursor_col }
      end
    end
  end

  -- Switch to the active file and restore cursor
  if active_file then
    vim.cmd("edit " .. vim.fn.fnameescape(active_file.path))
    pcall(vim.api.nvim_win_set_cursor, 0, { active_file.line, active_file.col })
  end

  -- Clear the table after successful restore
  storage.delete_all(TABLE_NAME)

  return true
end

-- Hook: after saving a file, remove its unsaved entry from restart_state
local function setup_write_hook()
  local group = vim.api.nvim_create_augroup("RestartStateCleanup", { clear = true })
  vim.api.nvim_create_autocmd("BufWritePost", {
    group = group,
    callback = function()
      local file = vim.api.nvim_buf_get_name(0)
      if file ~= "" then
        pcall(storage.delete, TABLE_NAME, { file_path = file })
      end
    end,
  })
end

-- Restart Neovim: save state, clear module cache, re-source config, restore state
M.restart_nvim = function()
  init_table()
  save_state()

  -- Clear ungrouped Lua autocmds (these would duplicate on reload)
  -- Grouped autocmds are safe: our modules use clear=true, plugin groups stay intact
  local all_autocmds = vim.api.nvim_get_autocmds({})
  for _, ac in ipairs(all_autocmds) do
    if ac.callback and not ac.group then
      pcall(vim.api.nvim_del_autocmd, ac.id)
    end
  end

  -- Clear our augroups (they'll be recreated with clear=true on re-require)
  local our_augroups = {
    "SessionManager",
    "NavigationTracking",
    "RestartStateCleanup",
    "ListOverviewEditKeys",
  }
  for _, name in ipairs(our_augroups) do
    pcall(vim.api.nvim_del_augroup_by_name, name)
  end

  -- Clear our module cache (lazy.nvim has its own guard, plugins stay intact)
  for name, _ in pairs(package.loaded) do
    if name:match("^utils%.") or name:match("^config%.") or name:match("^system%.") then
      package.loaded[name] = nil
    end
  end

  -- Re-source entire config (lazy.lua has a guard to skip re-setup)
  vim.cmd("source " .. vim.fn.stdpath("config") .. "/init.lua")

  -- Restore state from storage
  vim.schedule(function()
    restore_state()
    vim.notify("Neovim reloaded!", vim.log.levels.INFO)
  end)
end

-- Setup: called from init.lua, restores state if available
M.setup = function()
  init_table()

  -- Defer restore to after everything else has initialized
  vim.schedule(function()
    restore_state()
  end)

  setup_write_hook()
end

return M
