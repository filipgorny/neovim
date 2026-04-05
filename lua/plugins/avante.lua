return {
  "yetone/avante.nvim",
  event = "VeryLazy",
  version = false,
  build = "make",
  dependencies = {
    "nvim-treesitter/nvim-treesitter",
    "stevearc/dressing.nvim",
    "nvim-lua/plenary.nvim",
    "MunifTanjim/nui.nvim",
    "MeanderingProgrammer/render-markdown.nvim",
  },
  opts = {
    provider = "ollama",
    ollama = {
      endpoint = "http://127.0.0.1:11434",
      model = "qwen2.5-coder:14b",
      is_env_set = function() return true end,
    },
  },
  keys = {
    { "<leader>a", function() require("avante.api").ask() end, mode = { "n", "v" }, desc = "Avante: Ask" },
  },
}
