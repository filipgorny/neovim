return {
  "nvim-treesitter/nvim-treesitter",
  build = ":TSUpdate",
  event = { "BufReadPre", "BufNewFile" },
  opts = {
    -- Automatycznie instaluj parsery dla tych języków
    ensure_installed = {
      "lua",
      "javascript",
      "typescript",
      "tsx",
      "go",
      "gomod",
      "gosum",
      "json",
      "html",
      "css",
      "markdown",
    },

    -- Instaluj parsery synchronicznie (jeden po drugim)
    sync_install = false,

    -- Instaluj parsery automatycznie przy otwieraniu nowych plików
    auto_install = true,

    -- Włącz kolorowanie składni
    highlight = {
      enable = true,
      additional_vim_regex_highlighting = false,
    },

    -- Włącz inteligentne wcięcia
    indent = {
      enable = true,
    },

    -- Włącz incremental selection
    incremental_selection = {
      enable = true,
      keymaps = {
        init_selection = "<CR>",
        node_incremental = "<CR>",
        scope_incremental = "<TAB>",
        node_decremental = "<S-TAB>",
      },
    },
  },
}
