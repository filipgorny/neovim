install("neoclide/coc.nvim")

configure(function ()
  vim.g.coc_global_extensions = {'coc-go', 'coc-json', 'coc-tsserver', 'coc-yaml', 'coc-tailwindcss', 'coc-svg', 'coc-sql', 'coc-stylelintplus', 'coc-sh', 'coc-python', 'coc-prisma', 'coc-prettier', 'coc-phpls', 'coc-html', 'coc-gist', 'coc-eslint', 'coc-css', 'coc-angular', 'coc-clangd', '@yaegassy/coc-tailwindcss3'}
end)
	
