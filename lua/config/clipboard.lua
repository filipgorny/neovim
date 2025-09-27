vim.opt.clipboard = "unnamedplus"

-- mapowania dla bezpieczeństwa
local opts = { noremap = true, silent = true }
vim.keymap.set("v", "y", '"+y', opts)
vim.keymap.set("n", "yy", '"+yy', opts)
vim.keymap.set("v", "d", '"+d', opts)
vim.keymap.set("n", "dd", '"+dd', opts)
vim.keymap.set("n", "p", '"+p', opts)
vim.keymap.set("n", "P", '"+P', opts)
vim.keymap.set("v", "p", '"+p', opts)
vim.keymap.set("v", "P", '"+P', opts)

if vim.fn.has("clipboard") == 0 then
  vim.notify("Neovim nie ma wsparcia +clipboard!", vim.log.levels.WARN)
end