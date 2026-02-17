-- Custom Telescope picker for buffers sorted by edit time
local M = {}

local pickers = require("telescope.pickers")
local finders = require("telescope.finders")
local conf = require("telescope.config").values
local actions = require("telescope.actions")
local action_state = require("telescope.actions.state")
local entry_display = require("telescope.pickers.entry_display")

-- Show buffers sorted by last edit time
function M.buffers_by_edit_time(opts)
  opts = opts or {}
  
  local navigation = require("utils.navigation")
  local buffers = navigation.get_buffers_by_edit_time()
  
  -- Also add currently open buffers that weren't edited (at the end)
  local edited_files = {}
  for _, buf in ipairs(buffers) do
    edited_files[buf.file] = true
  end
  
  -- Get all loaded buffers
  local all_buffers = vim.api.nvim_list_bufs()
  for _, bufnr in ipairs(all_buffers) do
    if vim.api.nvim_buf_is_loaded(bufnr) then
      local buftype = vim.api.nvim_buf_get_option(bufnr, 'buftype')
      if buftype == '' then -- Only normal file buffers
        local filepath = vim.api.nvim_buf_get_name(bufnr)
        if filepath ~= '' and not edited_files[filepath] then
          -- Add unedited but open buffer to the end
          table.insert(buffers, {
            file = filepath,
            bufnr = bufnr,
            line = 1,
            col = 0,
            timestamp = 0, -- No edit timestamp
          })
        end
      end
    end
  end
  
  if #buffers == 0 then
    vim.notify("No open buffers", vim.log.levels.INFO)
    return
  end
  
  -- Create displayer for nice formatting
  local displayer = entry_display.create({
    separator = " ",
    items = {
      { width = 3 },  -- buffer number
      { width = 30 }, -- filename
      { width = 10 }, -- time ago
      { remaining = true }, -- full path
    },
  })
  
  local make_display = function(entry)
    local filename = vim.fn.fnamemodify(entry.value.file, ":t")
    local dir = vim.fn.fnamemodify(entry.value.file, ":h:t")
    local time_ago = ""
    
    if entry.value.timestamp > 0 then
      local seconds_ago = math.floor((vim.loop.now() - entry.value.timestamp) / 1000)
      if seconds_ago < 60 then
        time_ago = seconds_ago .. "s ago"
      elseif seconds_ago < 3600 then
        time_ago = math.floor(seconds_ago / 60) .. "m ago"
      elseif seconds_ago < 86400 then
        time_ago = math.floor(seconds_ago / 3600) .. "h ago"
      else
        time_ago = math.floor(seconds_ago / 86400) .. "d ago"
      end
    else
      time_ago = "not edited"
    end
    
    return displayer({
      { tostring(entry.value.bufnr), "TelescopeResultsNumber" },
      { filename, "TelescopeResultsIdentifier" },
      { time_ago, "TelescopeResultsComment" },
      { dir, "TelescopeResultsComment" },
    })
  end
  
  pickers.new(opts, {
    prompt_title = "Buffers (by edit time)",
    finder = finders.new_table({
      results = buffers,
      entry_maker = function(entry)
        return {
          value = entry,
          display = make_display,
          ordinal = entry.file,
          filename = entry.file,
          lnum = entry.line,
          col = entry.col,
        }
      end,
    }),
    sorter = conf.generic_sorter(opts),
    attach_mappings = function(prompt_bufnr, map)
      actions.select_default:replace(function()
        actions.close(prompt_bufnr)
        local selection = action_state.get_selected_entry()
        if selection then
          -- Switch to buffer
          vim.api.nvim_set_current_buf(selection.value.bufnr)
          -- Jump to last edit position
          if selection.value.line and selection.value.col then
            pcall(vim.api.nvim_win_set_cursor, 0, { selection.value.line, selection.value.col })
          end
          vim.cmd("normal! zz") -- Center screen
        end
      end)
      
      -- Add mapping to delete buffer
      map('i', '<C-d>', function()
        local selection = action_state.get_selected_entry()
        if selection then
          actions.close(prompt_bufnr)
          vim.api.nvim_buf_delete(selection.value.bufnr, { force = false })
          -- Reopen picker after deletion
          vim.schedule(function()
            M.buffers_by_edit_time(opts)
          end)
        end
      end)
      
      return true
    end,
  }):find()
end

return M
