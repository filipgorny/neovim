install("nvim-tree/nvim-tree.lua")
install("nvim-tree/nvim-web-devicons")

-- disable netrw at the very start of your init.lua
vim.g.loaded_netrw = 1
vim.g.loaded_netrwPlugin = 1

-- optionally enable 24-bit colour
vim.opt.termguicolors = true

-- empty setup using defaults
require("nvim-tree").setup()

keys.map_all("<C-n>", "<Esc>:NvimTreeToggle<CR>")

