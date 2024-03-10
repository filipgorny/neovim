install("NLKNguyen/papercolor-theme")
install("ellisonleao/gruvbox.nvim")
install("romainl/Apprentice")
install("joshdick/onedark.vim")

install("andrew-george/telescope-themes")
local telescope = require('telescope')
telescope.load_extension('themes')

keys.map_all("<leader>t", "<Esc>:Telescope themes<CR>")
