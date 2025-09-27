local info = require("utils.info")

-- Namespace dla wszystkich wirtualnych linii
local ns = vim.api.nvim_create_namespace("universal_warnings")

-- Ikony dla poszczególnych typów diagnostics
local icons = {
  [1] = "❗",  -- Error
  [2] = "⚠",  -- Warning
  [3] = "ℹ",  -- Info
  [4] = "💡",  -- Hint
}

-- Kolory – można użyć highlightów z Neovim
vim.cmd([[highlight DiagnosticError guifg=#F44747]])
vim.cmd([[highlight DiagnosticWarn guifg=#FF8800]])
vim.cmd([[highlight DiagnosticInfo guifg=#4FC1FF]])
vim.cmd([[highlight DiagnosticHint guifg=#B5CEA8]])

local severity_hl = {
  [1] = "DiagnosticError",
  [2] = "DiagnosticWarn",
  [3] = "DiagnosticInfo",
  [4] = "DiagnosticHint",
}

-- Globalny handler dla wszystkich LSP
vim.lsp.handlers["textDocument/publishDiagnostics"] = function(_, result, ctx, _)
  local bufnr = ctx.bufnr
  if not bufnr or not vim.api.nvim_buf_is_valid(bufnr) then return end

  -- Konwersja diagnostics do struktury render_warnings
  local diagnostics = {}
  for _, d in ipairs(result.diagnostics) do
    table.insert(diagnostics, {
      lnum = d.range.start.line,
      message = d.message,
      severity = d.severity,
      hl = severity_hl[d.severity] or "WarningMsg",
      icon = icons[d.severity] or "⚠",
    })
  end

  -- Renderowanie w bezpiecznym wątku Neovim
  vim.schedule(function()
    if vim.api.nvim_buf_is_valid(bufnr) then
      -- W `render_warnings` musisz uwzględnić pola: lnum, message, severity, hl, icon
      info.render_warnings(bufnr, diagnostics)
    end
  end)
end
