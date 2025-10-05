return {
  "akinsho/bufferline.nvim",
  event = "VeryLazy",
  keys = {
    { "<leader>bp", "<Cmd>BufferLineTogglePin<CR>", desc = "Toggle Pin" },
    { "<leader>bP", "<Cmd>BufferLineGroupClose ungrouped<CR>", desc = "Delete Non-Pinned Buffers" },
    { "<leader>br", "<Cmd>BufferLineCloseRight<CR>", desc = "Delete Buffers to the Right" },
    { "<leader>bl", "<Cmd>BufferLineCloseLeft<CR>", desc = "Delete Buffers to the Left" },
    { "<M-j>",      "<cmd>BufferLineCyclePrev<cr>",            desc = "Move buffer prev" },
    { "<M-k>",      "<cmd>BufferLineCycleNext<cr>",            desc = "Move buffer next" },
  },
  opts = {
    options = {
      diagnostics = "nvim_lsp",
      always_show_bufferline = false,
      icons = {
        diagnostics = { Error = " ", Warn = " ", Info = " ", Hint = " " },
        ft = {
          lua = "",
          javascript = "",
          typescript = "",
          go = "",
          html = "",
          css = "",
          json = "",
          default = "",
        },
      },
      numbers = "ordinal",
      close_command = "bdelete! %", -- zamykanie buforów
      right_mouse_command = "bdelete! %",

      sort_by = function(buf_a, buf_b)
        local modified_a = vim.fn.getbufinfo(buf_a.id)[1].changedtick
        local modified_b = vim.fn.getbufinfo(buf_b.id)[1].changedtick

        return modified_a > modified_b
      end,
    },
  },
  config = function(_, opts)
    local bufferline = require("bufferline")
    bufferline.setup(opts)

    -- Nowy plik zawsze w nowej zakładce
    vim.api.nvim_create_autocmd({ "BufReadPost", "BufNewFile" }, {
      callback = function(args)
        local buf = args.buf
        local ft = vim.api.nvim_buf_get_option(buf, "filetype")
        if ft ~= "help" and ft ~= "terminal" and buf ~= vim.api.nvim_get_current_buf() then
          vim.cmd("tabnew " .. vim.api.nvim_buf_get_name(buf))
        end
      end,
    })
  end,
}
