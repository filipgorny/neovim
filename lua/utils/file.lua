local M = {}

M.save_file = function()
  vim.cmd("write")
  vim.api.nvim_feedkeys(vim.api.nvim_replace_termcodes("<Esc>", true, false, true), "n", false)
end

return M
