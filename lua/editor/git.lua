install("mhinz/vim-signify")

configure(function ()
  vim.g.signify_sign_add = '+'
  vim.g.signify_sign_change = '~'
  vim.g.signify_sign_delete = '-'
  vim.cmd("hi SignColumn ctermbg=none")
end)

