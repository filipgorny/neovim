install("williamboman/mason.nvim")
install("williamboman/mason-lspconfig.nvim")
install("neovim/nvim-lspconfig")

configure(function ()
  require("mason").setup()
  require("mason-lspconfig").setup({
    ensure_installed = {
      "golangci_lint_ls",
      "tsserver",
      "marksman",
      "intelephense",
      "jedi_language_server",
      "biome",
      "hydra_lsp"
    }
  })
end)
