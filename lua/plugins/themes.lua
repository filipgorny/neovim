return {
  { "ellisonleao/gruvbox.nvim", priority = 1000 },
  { "catppuccin/nvim", name = "catppuccin", priority = 1000 },
  { "folke/tokyonight.nvim", lazy = false, priority = 1000 },
  { "rebelot/kanagawa.nvim", priority = 1000 },
  { "shaunsingh/nord.nvim", priority = 1000 },
  { "ishan9299/nvim-solarized-lua", priority = 1000 },
  { "Mofiqul/dracula.nvim", priority = 1000 },
  { "EdenEast/nightfox.nvim", priority = 1000 },
  { "navarasu/onedark.nvim", priority = 1000 },
  { "NLKNguyen/papercolor-theme", priority = 1000 },
  { "projekt0n/github-nvim-theme", priority = 1000 },
  { "tiagovla/tokyodark.nvim", priority = 1000 },
  { "sainnhe/everforest", priority = 1000 },
  { "sainnhe/gruvbox-material", priority = 1000 },
  { "sainnhe/sonokai", priority = 1000 },
  { "marko-cerovac/material.nvim", priority = 1000 },
  { "glepnir/zephyr-nvim", priority = 1000 },
  { "bluz71/vim-nightfly-colors", priority = 1000 },
  { "nyoom-engineering/oxocarbon.nvim", priority = 1000 },
  { "rose-pine/neovim", name = "rose-pine", priority = 1000 },

  {
    "nvim-telescope/telescope.nvim",
    dependencies = { "nvim-lua/plenary.nvim" },
    config = function()
      local builtin = require("telescope.builtin")
      vim.api.nvim_create_user_command("ColorschemePicker", function()
        builtin.colorscheme({ enable_preview = true })
      end, {})
      vim.keymap.set("n", "<leader>t", "<cmd>ColorschemePicker<cr>", { desc = "Pick colorscheme" })
    end,
  },
}
