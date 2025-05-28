local M = {}

M.select_all = function()
    local keys = vim.api.nvim_replace_termcodes('<ESC>gg^vG$', true, false, true)
    vim.api.nvim_feedkeys(keys,'m',false)
end

return M


