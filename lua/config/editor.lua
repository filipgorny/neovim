-- WAŻNE: Ustaw termguicolors jako pierwsze, przed załadowaniem motywów
vim.opt.termguicolors = true

vim.cmd("set number")
vim.opt.number = true

-- Włącz kolorowanie składni
vim.cmd("syntax on")
vim.opt.syntax = "on"

-- Włącz automatyczne wykrywanie typu pliku
vim.cmd("filetype plugin indent on")
