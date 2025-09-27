local M = {}

-- Renderuj wirtualne linijki (LSP + uwagi)
M.render_virtual_lines = function(bufnr, diagnostics, notes)
  local ns = vim.api.nvim_create_namespace("virtual_diagnostics")
  
  bufnr = bufnr or vim.api.nvim_get_current_buf()
  vim.api.nvim_buf_clear_namespace(bufnr, ns, 0, -1)

  local line_count = vim.api.nvim_buf_line_count(bufnr)

  -- LSP diagnostics
  for _, d in ipairs(diagnostics or {}) do
    local line = d.range.start.line
    if line < line_count then
      local msg = d.message
      vim.api.nvim_buf_set_extmark(bufnr, ns, line, 0, {
        virt_lines = { { { msg, "VirtualNote" } } },
        virt_lines_above = false,
        hl_mode = "combine",
      })
    end
  end

  -- Uwagi LLM
  for _, note in ipairs(notes or {}) do
    if vim.api.nvim_buf_get_name(bufnr):match(note.file) then
      local line = note.line - 1
      if line >= 0 and line < line_count then
        vim.api.nvim_buf_set_extmark(bufnr, ns, line, 0, {
          virt_lines = { { { note.text, "VirtualNote" } } },
          virt_lines_above = false,
          hl_mode = "combine",
        })
      end
    end
  end
end

return M


