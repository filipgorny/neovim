return {
  {
    "nvim-lualine/lualine.nvim",
    dependencies = {
      "nvim-tree/nvim-web-devicons",  -- ikony
      "lewis6991/gitsigns.nvim",      -- Git diff
    },
    event = "VeryLazy",
    config = function()
      require("gitsigns").setup() -- gitsigns musi być zainicjalizowany
      local lualine = require("lualine")
      local colors = { error = "#FF6C6B", warn = "#ECBE7B" }

      local function git_diff_count()
        local g = vim.b.gitsigns_status_dict
        if g then
          local total = (g.added or 0) + (g.changed or 0) + (g.removed or 0)
          if total > 0 then return "Δ" .. total end
        end
        return ""
      end

      local function diagnostics_count()
        local e = #vim.diagnostic.get(0, { severity = vim.diagnostic.severity.ERROR })
        local w = #vim.diagnostic.get(0, { severity = vim.diagnostic.severity.WARN })
        if e + w > 0 then return "E:"..e.." W:"..w end
        return ""
      end

      lualine.setup({
        options = { theme = "auto", globalstatus = true },
        sections = {
          lualine_a = { "mode" },
          lualine_b = { "branch" },
          lualine_c = { { "filename", path = 1 } },
          lualine_x = { git_diff_count, { diagnostics_count, color = { fg = colors.error } } },
          lualine_y = { "progress" },
          lualine_z = { "location" },
        },
      })
    end,
  },
}
