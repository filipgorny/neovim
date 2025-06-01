return {
  "fatih/vim-go",
  ft = { "go" },
  build = ":GoUpdateBinaries",  -- pobiera binarki potrzebne przez vim-go
  config = function()
    -- wyłącz wewnętrzne mechanizmy, które mogą kolidować z LSP
    vim.g.go_def_mode = "gopls"
    vim.g.go_info_mode = "gopls"
    vim.g.go_fmt_command = "gopls"
    vim.g.go_doc_keywordprg_enabled = 0  -- nie używaj :help na słowach kluczowych

    -- opcjonalnie: nie używaj autoformatowania vim-go
    vim.g.go_fmt_autosave = 0
    vim.g.go_imports_autosave = 0
  end
}
