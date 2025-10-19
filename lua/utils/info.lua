local M = {}

-- Namespace dla wszystkich wirtualnych linii
M.ns = vim.api.nvim_create_namespace("virtual_warnings")

-- Domyślne ikony (do wirtualnych linii)
M.icons = {
  [1] = "❗",  -- Error
  [2] = "⚠",  -- Warning
  [3] = "ℹ",  -- Info
  [4] = "💡",  -- Hint
}

-- Domyślne highlighty dla severity
vim.cmd([[highlight VirtualError guifg=#F44747]])
vim.cmd([[hi:Qarrright VirtualWarn  guifg=#FF8800]])
vim.cmd([[highlight VirtualInfo  guifg=#4FC1FF]])
vim.cmd([[highlight VirtualHint  guifg=#B5CEA8]])

M.severity_hl = {
  [1] = "VirtualError",
  [2] = "VirtualWarn",
  [3] = "VirtualInfo",
  [4] = "VirtualHint",
}

-- Funkcja renderująca wirtualne linie
-- diagnostics: tabela z polami {lnum=0-indexed, message, severity, opcjonalnie hl, icon}
function M.render_warnings(bufnr, diagnostics)
  if not vim.api.nvim_buf_is_valid(bufnr) then return end

  -- Wyczyść poprzednie wirtualne linie
  vim.api.nvim_buf_clear_namespace(bufnr, M.ns, 0, -1)

  for _, d in ipairs(diagnostics) do
    local icon = d.icon or M.icons[d.severity] or "⚠"
    local hl   = d.hl   or M.severity_hl[d.severity] or "VirtualWarn"

    vim.api.nvim_buf_set_extmark(bufnr, M.ns, d.lnum, 0, {
      virt_text = { { icon .. " " .. d.message, hl } },
      virt_text_pos = "eol",  -- pod linijką
      hl_mode = "combine",
    })
  end
end

-- Funkcja debugująca – wypisuje treść diagnostics do bufna debugowego
function M.debug(diagnostics)
  for _, d in ipairs(diagnostics) do
    print(string.format("[%d] %s: %s", d.lnum + 1, d.severity, d.message))
  end
end

return M
