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

-- Cienka, jednopikselowa linia między oknami. Domyślny fillchar to już thin `│`,
-- ale motyw (np. unokai) ustawia WinSeparator z tłem == pierwszym planem, więc
-- znak wypełnia całą komórkę i separator wygląda jak gruby pasek. Zdejmujemy tło
-- — zostaje sam cienki glif — i przygaszamy kolor do 50% w stronę tła, żeby
-- ramka była subtelna.
local function blend(fg, bg, alpha)
  local f = { math.floor(fg / 65536) % 256, math.floor(fg / 256) % 256, fg % 256 }
  local b = { math.floor(bg / 65536) % 256, math.floor(bg / 256) % 256, bg % 256 }
  local r = math.floor(f[1] * alpha + b[1] * (1 - alpha) + 0.5)
  local g = math.floor(f[2] * alpha + b[2] * (1 - alpha) + 0.5)
  local bl = math.floor(f[3] * alpha + b[3] * (1 - alpha) + 0.5)

  return r * 65536 + g * 256 + bl
end

local function thin_win_separators()
  local sep = vim.api.nvim_get_hl(0, { name = "WinSeparator", link = false })
  local normal = vim.api.nvim_get_hl(0, { name = "Normal", link = false })
  local fg = sep.fg or sep.bg
  local bg = normal.bg

  if fg and bg then
    fg = blend(fg, bg, 0.5)
  end

  vim.api.nvim_set_hl(0, "WinSeparator", { fg = fg, bg = "NONE" })
end

vim.api.nvim_create_autocmd("ColorScheme", {
  group = vim.api.nvim_create_augroup("ThinWinSeparators", { clear = true }),
  callback = thin_win_separators,
})

thin_win_separators()
