return {
  -- Colorscheme collection
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

  -- Telescope picker + keymap + persistence
  {
    "nvim-telescope/telescope.nvim",
    dependencies = { "nvim-lua/plenary.nvim" },
    config = function()
      local builtin = require("telescope.builtin")

      local state_file = vim.fn.stdpath("data") .. "/last_colorscheme"

      -- Save colorscheme name to file
      local function save_colorscheme(name)
        local f = io.open(state_file, "w")
        if f then
          f:write(name)
          f:close()
        end
      end

      -- Load last used colorscheme
      local function load_colorscheme()
        local f = io.open(state_file, "r")
        if f then
          local cs = f:read("*l")
          f:close()
          if cs and #cs > 0 then
            vim.cmd.colorscheme(cs)
          end
        end
      end

      -- Load colorscheme on startup
      load_colorscheme()

      -- Save whenever colorscheme changes
      vim.api.nvim_create_autocmd("ColorScheme", {
        callback = function(args)
          save_colorscheme(args.match)
        end,
      })

      -- Telescope command
      vim.api.nvim_create_user_command("ColorschemePicker", function()
        builtin.colorscheme({ enable_preview = true })
      end, {})

      -- Keymap <leader>t
      vim.keymap.set("n", "<leader>t", function()
        builtin.colorscheme({ enable_preview = true })
      end, { desc = "Pick colorscheme" })
    end,
  },
}
