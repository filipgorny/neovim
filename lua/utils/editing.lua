local M = {}

M.clear_buffer = function()
  vim.cmd("<Esc>gg^vGd")
end

M.format_added = function()
  vim.api.nvim_command("FormatDiff")
end

return M


