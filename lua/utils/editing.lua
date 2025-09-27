local M = {}

M.clear_buffer = function()
  vim.cmd("<Esc>gg^vGd")
end

M.format_added = function()
  vim.api.nvim_command("FormatDiff")
end

M.select_all = function()
    vim.cmd("normal! gg^vG$")
end

M.reload_current = function()
    local file = vim.fn.expand("%:p")
    dofile(file)
    print("Reloaded " .. file)
end

return M
