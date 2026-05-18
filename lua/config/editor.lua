-- WAŻNE: Ustaw termguicolors jako pierwsze, przed załadowaniem motywów
vim.opt.termguicolors = true

vim.cmd("set number")
vim.opt.number = true

-- Włącz kolorowanie składni
vim.cmd("syntax on")
vim.opt.syntax = "on"

-- Włącz automatyczne wykrywanie typu pliku
vim.cmd("filetype plugin indent on")

-- Disable swap files (no more recovery prompts)
vim.opt.swapfile = false

-- Włącz pełną obsługę myszki (resize okien, scroll, visual selection)
vim.opt.mouse = "a"
vim.opt.mousemoveevent = true

-- Set terminal/tmux pane title to current file name (tmux uses it as window name)
vim.opt.title = true
vim.opt.titlestring = [[%t%( %M%)]]
