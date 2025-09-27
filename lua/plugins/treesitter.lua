return {
  {
    "nvim-treesitter/nvim-treesitter",
    build = ":TSUpdate",
    event = { "BufReadPost", "BufNewFile" },
    dependencies = {
      "nvim-treesitter/nvim-treesitter-textobjects", -- text objects
    },
    config = function()
      require("nvim-treesitter.configs").setup({
        -- Install parsers for languages you use
        ensure_installed = {
          "typescript",
          "javascript",
          "go",
          "html",
          "css",
          "json",
        },

        highlight = {
          enable = true,         -- enable Treesitter-based syntax highlighting
          additional_vim_regex_highlighting = false,
        },

        incremental_selection = {
          enable = true,
          keymaps = {
            init_selection = "gnn",   -- start selection
            node_incremental = "grn", -- expand selection
            scope_incremental = "grc", -- expand to scope
            node_decremental = "grm", -- shrink selection
          },
        },

        textobjects = {
          select = {
            enable = true,
            lookahead = true, -- automatically jump forward
            keymaps = {
              ["af"] = "@function.outer",
              ["if"] = "@function.inner",
              ["ac"] = "@class.outer",
              ["ic"] = "@class.inner",
            },
          },
        },

        -- Semantic highlighting (requires LSP support)
        rainbow = {
          enable = true,
          extended_mode = true,
          max_file_lines = nil,
        },
      })
    end,
  },
}
