return {
  "akinsho/bufferline.nvim",
  event = "VeryLazy",
  keys = {
    { "<leader>bp", "<Cmd>BufferLineTogglePin<CR>", desc = "Toggle Pin" },
    { "<leader>bP", "<Cmd>BufferLineGroupClose ungrouped<CR>", desc = "Delete Non-Pinned Buffers" },
    { "<leader>br", "<Cmd>BufferLineCloseRight<CR>", desc = "Delete Buffers to the Right" },
    { "<leader>bl", "<Cmd>BufferLineCloseLeft<CR>", desc = "Delete Buffers to the Left" },
    { "<S-h>", "<cmd>BufferLineCyclePrev<cr>", desc = "Prev Buffer" },
    { "<S-l>", "<cmd>BufferLineCycleNext<cr>", desc = "Next Buffer" },
    { "<M-j>", "<cmd>BufferLineCyclePrev<cr>", desc = "Prev Buffer" },
    { "<M-k>", "<cmd>BufferLineCycleNext<cr>", desc = "Next Buffer" },
    { "[B", "<cmd>BufferLineMovePrev<cr>", desc = "Move buffer prev" },
    { "]B", "<cmd>BufferLineMoveNext<cr>", desc = "Move buffer next" },
  },
  opts = {
    options = {
      close_command = function(n) Snacks.bufdelete(n) end,
      right_mouse_command = function(n) Snacks.bufdelete(n) end,
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
    },
  },
  config = function(_, opts)
    local bufferline = require("bufferline")
    bufferline.setup(opts)

    -- Historia buforów
    local buf_history = {}
    local current_index = 1 -- wskazuje aktualny bufor w historii

    local function add_to_history(buf)
      for i, b in ipairs(buf_history) do
        if b == buf then
          table.remove(buf_history, i)
          break
        end
      end
      table.insert(buf_history, 1, buf)
      current_index = 1
    end

    -- Aktualizacja historii przy wejściu do bufora
    vim.api.nvim_create_autocmd("BufEnter", {
      callback = function()
        local buf = vim.api.nvim_get_current_buf()
        add_to_history(buf)
      end,
    })

    -- Przejście do poprzedniego bufora w historii (Alt-b)
    local function go_prev_buf()
      if #buf_history < 2 then return end
      current_index = current_index + 1
      if current_index > #buf_history then
        current_index = 1
      end
      vim.api.nvim_set_current_buf(buf_history[current_index])
    end

    -- Przejście do następnego bufora w historii (Alt-n)
    local function go_next_buf()
      if #buf_history < 2 then return end
      current_index = current_index - 1
      if current_index < 1 then
        current_index = #buf_history
      end
      vim.api.nvim_set_current_buf(buf_history[current_index])
    end

    -- Keymapy do historii buforów
    vim.keymap.set("n", "<M-b>", go_prev_buf, { noremap = true, silent = true })
    vim.keymap.set("n", "<M-n>", go_next_buf, { noremap = true, silent = true })

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
