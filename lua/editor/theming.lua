install("NLKNguyen/papercolor-theme")
install("ellisonleao/gruvbox.nvim")
install("romainl/Apprentice")
install("joshdick/onedark.vim")
install("EdenEast/nightfox.nvim")

install("andrew-george/telescope-themes")

configure(function ()
  local telescope = require('telescope')
  telescope.load_extension('themes')

  keys.map_all("<leader>t", "<Esc>:Telescope themes<CR>")
end)
