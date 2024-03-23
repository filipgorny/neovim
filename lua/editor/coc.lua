install_and_run("neoclide/coc.nvim", "npm install && nvpm ci")

configure(function ()
  vim.g.coc_global_extensions = {'coc-go', 'coc-json', 'coc-tsserver', 'coc-yaml', 'coc-tailwindcss', 'coc-svg', 'coc-sql', 'coc-stylelintplus', 'coc-sh', 'coc-python', 'coc-prisma', 'coc-prettier', 'coc-phpls', 'coc-html', 'coc-gist', 'coc-eslint', 'coc-css', 'coc-angular', 'coc-clangd', '@yaegassy/coc-tailwindcss3', 'coc-lua'}

  -- format on save
  vim.cmd([[command! -nargs=0 Prettier :CocCommand prettier.formatFile]])

  -- organize imports on save
  vim.cmd([[autocmd BufWritePre *.go :silent call CocAction('runCommand', 'editor.action.organizeImport')]])

--  vim.cmd("CocInstall " .. table.concat(vim.g.coc_global_extensions, " "))

--  for _, ext in ipairs(vim.g.coc_global_extensions) do
 --   vim.cmd("silent CocInstall " .. ext)
  --end
end)

function save_method()
  vim.cmd([[Prettier]])
  vim.cmd([[w]])
end

