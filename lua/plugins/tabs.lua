return {
  "akinsho/bufferline.nvim",
  event = "VeryLazy",
  keys = {
    { "<leader>bp", "<Cmd>BufferLineTogglePin<CR>", desc = "Toggle Pin" },
    { "<leader>bP", "<Cmd>BufferLineGroupClose ungrouped<CR>", desc = "Delete Non-Pinned Buffers" },
    { "<leader>br", "<Cmd>BufferLineCloseRight<CR>", desc = "Delete Buffers to the Right" },
    { "<leader>bl", "<Cmd>BufferLineCloseLeft<CR>", desc = "Delete Buffers to the Left" },
    { "<M-k>",      "<cmd>BufferLineCyclePrev<cr>", desc = "Previous tab" },
    { "<M-j>",      "<cmd>BufferLineCycleNext<cr>", desc = "Next tab" },
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
      close_command = "bdelete! %", -- zamykanie buforów
      right_mouse_command = "bdelete! %",
    },
  },
  config = function(_, opts)
    local bufferline = require("bufferline")
    bufferline.setup(opts)
  end,
}
