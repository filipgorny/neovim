-- Zanim bufferline przełączy/zamknie bufor, zejdź z okna z winfixbuf (kolumna
-- czatu agenta, panele boczne) do prawdziwego okna edytora — inaczej
-- nvim_set_current_buf rzuca E1513 ("Cannot switch buffer. 'winfixbuf' is
-- enabled"). Efekt: agent zostaje po prawej, plik otwiera się w głównym oknie.
local function ensure_editor_win()
  if not vim.wo.winfixbuf and vim.bo.buftype == "" then return end

  -- Agent zna swoje okno edytora (tworzy je w razie potrzeby, nie ruszając czatu).
  local ok, agent = pcall(require, "system.agent")

  if ok and agent.focus_editor_win and agent.focus_editor_win() then return end

  -- Fallback bez agenta: znajdź dowolne zwykłe, nie-winfixbuf okno na plik.
  for _, w in ipairs(vim.api.nvim_list_wins()) do
    local b = vim.api.nvim_win_get_buf(w)

    if vim.api.nvim_win_get_config(w).relative == "" and not vim.wo[w].winfixbuf and vim.bo[b].buftype == "" then
      pcall(vim.api.nvim_set_current_win, w)

      return
    end
  end
end

-- Owija komendę bufferline guardem ensure_editor_win.
local function guarded(cmd)
  return function()
    ensure_editor_win()
    vim.cmd(cmd)
  end
end

return {
  "akinsho/bufferline.nvim",
  event = "VeryLazy",
  keys = {
    { "<leader>bp", "<Cmd>BufferLineTogglePin<CR>", desc = "Toggle Pin" },
    { "<leader>bP", "<Cmd>BufferLineGroupClose ungrouped<CR>", desc = "Delete Non-Pinned Buffers" },
    { "<leader>br", guarded("BufferLineCloseRight"), desc = "Delete Buffers to the Right" },
    { "<leader>bl", guarded("BufferLineCloseLeft"), desc = "Delete Buffers to the Left" },
    { "<M-k>", guarded("BufferLineCyclePrev"), desc = "Previous tab (left)" },
    { "<M-j>", guarded("BufferLineCycleNext"), desc = "Next tab (right)" },
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
      -- Domyślne "buffer %d" wykonuje :buffer w AKTUALNYM oknie — klik w tab
      -- z kursorem w czacie agenta / panelu bocznym rzucał E1513 (winfixbuf).
      -- Najpierw zejdź do okna edytora, dopiero potem przełącz bufor.
      left_mouse_command = function(bufnr)
        if not vim.api.nvim_buf_is_valid(bufnr) then return end

        ensure_editor_win()

        local ok, err = pcall(vim.api.nvim_set_current_buf, bufnr)

        if not ok then
          vim.notify("Bufferline: nie można przełączyć bufora — " .. tostring(err), vim.log.levels.WARN)
        end
      end,
      -- Zamykanie taba pokazuje poprzedni tab z historii i nie ubija okna
      -- edytora (inaczej czat agenta rozciągnąłby się na cały ekran).
      close_command = function(bufnr) require("utils.buffer_history").smart_close(bufnr) end,
      right_mouse_command = function(bufnr) require("utils.buffer_history").smart_close(bufnr) end,
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

    -- Re-sort tabs when switching buffers.
    -- Guards: skip unlisted/special buffers AND skip when bufferline has no
    -- components yet (otherwise it prints "Unable to find elements to sort").
    vim.api.nvim_create_autocmd("BufEnter", {
      group = vim.api.nvim_create_augroup("BufferlineAutoSort", { clear = true }),
      callback = function(args)
        if not vim.bo[args.buf].buflisted then return end
        if vim.bo[args.buf].buftype ~= "" then return end
        vim.schedule(function()
          local ok_state, bl_state = pcall(require, "bufferline.state")
          if not ok_state or not bl_state.components or next(bl_state.components) == nil then
            return
          end
          pcall(function() bufferline.sort_by("custom") end)
        end)
      end,
    })
  end,
}
