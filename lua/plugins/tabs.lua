return {
  "akinsho/bufferline.nvim",
  event = "VeryLazy",
  keys = {
    { "<leader>bp", "<Cmd>BufferLineTogglePin<CR>", desc = "Toggle Pin" },
    { "<leader>bP", "<Cmd>BufferLineGroupClose ungrouped<CR>", desc = "Delete Non-Pinned Buffers" },
    { "<leader>br", "<Cmd>BufferLineCloseRight<CR>", desc = "Delete Buffers to the Right" },
    { "<leader>bl", "<Cmd>BufferLineCloseLeft<CR>", desc = "Delete Buffers to the Left" },
    { "<M-k>", "<cmd>BufferLineCyclePrev<CR>", desc = "Previous tab (left)" },
    { "<M-j>", "<cmd>BufferLineCycleNext<CR>", desc = "Next tab (right)" },
  },
  opts = {
    options = {
      diagnostics = "nvim_lsp",
      always_show_bufferline = false,
      icons = {
        diagnostics = { Error = " ", Warn = " ", Info = " ", Hint = " " },
        ft = {
          lua = "",
          javascript = "",
          typescript = "",
          go = "",
          html = "",
          css = "",
          json = "",
          default = "",
        },
      },
      numbers = "ordinal",
      close_command = "bdelete! %",
      right_mouse_command = "bdelete! %",
      sort_by = function(buf_a, buf_b)
        -- Sort by buffer history (most recent last, so it appears on the right)
        local history = require("utils.buffer_history").history
        local pos_a, pos_b = #history + 1, #history + 1
        for i, buf in ipairs(history) do
          if buf == buf_a.id then pos_a = i end
          if buf == buf_b.id then pos_b = i end
        end
        return pos_a < pos_b
      end,
    },
  },
  config = function(_, opts)
    local bufferline = require("bufferline")

    bufferline.setup(opts)

    -- Re-sort tabs when switching buffers
    vim.api.nvim_create_autocmd("BufEnter", {
      callback = function()
        vim.schedule(function()
          pcall(function()
            bufferline.sort_by("custom")
          end)
        end)
      end,
    })
  end,
}
