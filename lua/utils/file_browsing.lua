-- File browsing utilities
local M = {}

-- Open Telescope with files sorted by modification time (most recent first)
function M.find_files_by_mtime()
  local pickers = require("telescope.pickers")
  local finders = require("telescope.finders")
  local conf = require("telescope.config").values
  local actions = require("telescope.actions")
  local action_state = require("telescope.actions.state")

  -- Get project root (git root or cwd)
  local git_root = vim.fn.systemlist("git rev-parse --show-toplevel 2>/dev/null")[1]
  local root = (vim.v.shell_error == 0 and git_root ~= "") and git_root or vim.fn.getcwd()

  -- Get all files sorted by modification time using find
  local cmd = string.format(
    "find %s -type f -not -path '*/.git/*' -printf '%%T@ %%p\\n' 2>/dev/null | sort -rn | cut -d' ' -f2-",
    vim.fn.shellescape(root)
  )
  local files = vim.fn.systemlist(cmd)

  -- Make paths relative to root
  local relative_files = {}
  for _, file in ipairs(files) do
    local relative = file:gsub("^" .. vim.pesc(root) .. "/", "")
    table.insert(relative_files, relative)
  end

  pickers.new({}, {
    prompt_title = "Files by Modification Time",
    finder = finders.new_table({
      results = relative_files,
    }),
    sorter = conf.generic_sorter({}),
    previewer = conf.file_previewer({}),
    attach_mappings = function(prompt_bufnr, map)
      actions.select_default:replace(function()
        actions.close(prompt_bufnr)
        local selection = action_state.get_selected_entry()
        if selection then
          vim.cmd("edit " .. root .. "/" .. selection[1])
        end
      end)
      return true
    end,
  }):find()
end

return M
