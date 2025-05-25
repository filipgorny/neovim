local M = {}

M.clear_buffer = function()
  vim.cmd("<Esc>gg^vGd")
end

return M


