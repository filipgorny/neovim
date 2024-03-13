install("neoclide/coc.nvim", { run = "npm ci" })

configure(function ()
  vim.g.coc_global_extensions = {'coc-go', 'coc-json', 'coc-tsserver', 'coc-yaml', 'coc-tailwindcss', 'coc-svg', 'coc-sql', 'coc-stylelintplus', 'coc-sh', 'coc-python', 'coc-prisma', 'coc-prettier', 'coc-phpls', 'coc-html', 'coc-gist', 'coc-eslint', 'coc-css', 'coc-angular', 'coc-clangd', '@yaegassy/coc-tailwindcss3'}

  -- format on save
  vim.cmd([[command! -nargs=0 Prettier :CocCommand prettier.formatFile]])

  -- organize imports on save
  vim.cmd([[autocmd BufWritePre *.go :silent call CocAction('runCommand', 'editor.action.organizeImport')]])
end)

function save_method()
  vim.cmd([[Prettier]])
  vim.cmd([[w]])
end
