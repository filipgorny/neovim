install("vim-airline/vim-airline")
install("vim-airline/vim-airline-themes")

configure(function ()
  vim.g.airline_theme = 'simple'
  vim.g.airline_powerline_fonts = 1
end)
