install("nvim-treesitter/nvim-treesitter")
install("benwilliamgraham/tree-sitter-llvm")
install("HiPhish/nvim-ts-rainbow2")

configure(function()
  require("nvim-treesitter.configs").setup({
    ensure_installed = "llvm",
    highlight = {
      enable = true,
    },
    rainbow = {
      enable = true,
      extended_mode = true,
      strategy = require('ts-rainbow').strategy.global,
    },
  })
end)
