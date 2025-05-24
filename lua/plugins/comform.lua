return {
    'stevearc/conform.nvim',
    opts = {
        formatters_by_ft = {
    javascript = { 'prettier' },
    typescript = { 'prettier' },
    javascriptreact = { 'prettier' },
    typescriptreact = { 'prettier' },
  },
  format_on_save = {
    timeout_ms = 500,
    lsp_fallback = true,
  },
  }
  }
