local M = {}

local string = require("utils.string")

M.clear_buffer = function()
  vim.cmd("<Esc>gg^vGd")
end

M.format_added = function()
  -- This function is deprecated - use format_modifications instead
  -- Keeping it for backwards compatibility but making it a no-op
end

M.select_all = function()
    vim.cmd("normal! gg^vG$")
end

M.reload_current = function()
    local file = vim.fn.expand("%:p")
    dofile(file)
    print("Reloaded " .. file)
end

M.snapshot = {
  filename = "",
  lines = {}
}

M.get_current_filename = function()
  return vim.api.nvim_buf_get_name(0)
end

M.update_snapshot = function()
  M.snapshot.lines = vim.api.nvim_buf_get_lines(0, 0, -1, false)
  M.snapshot.filename = M.get_current_filename()
end

M.setup = function()
  -- Only update snapshot on file read, not on every buffer enter (performance)
  vim.api.nvim_create_autocmd({ "BufNewFile", "BufReadPost" }, {
    callback = function()
      M.update_snapshot()
    end,
  })
end

M.format_modifications = function()
  local conform = require("conform");

  if M.snapshot.filename ~= M.get_current_filename() then
    return
  end

  -- Check if there are any LSP errors - skip formatting if there are
  local diagnostics = vim.diagnostic.get(0, { severity = vim.diagnostic.severity.ERROR })
  if #diagnostics > 0 then
    -- Silently skip formatting if there are syntax errors
    M.update_snapshot()
    return
  end

  local snapshot = M.snapshot.lines

  local bufnr = 0

  -- pobierz aktualne linie
  local lines = vim.api.nvim_buf_get_lines(bufnr, 0, -1, false)

  -- znajdź zmienione linie
  local modified_lines = {}

  for i = 1, #lines do
    if not string.is_blank(lines[i]) then
      if snapshot[i] == nil or snapshot[i] ~= lines[i] then
        table.insert(modified_lines, i)
      end
    end
  end

  if #modified_lines == 0 then
    -- Silently return if no changes
    return
  end

  local ranges = {}
  local start_line = modified_lines[1]
  local prev = modified_lines[1]
  for i = 2, #modified_lines do
    if modified_lines[i] == prev + 1 then
      prev = modified_lines[i]
    else
      table.insert(ranges, { start_line, prev })
      start_line = modified_lines[i]
      prev = modified_lines[i]
    end
  end
  table.insert(ranges, { start_line, prev })

  for _, r in ipairs(ranges) do
    local start0 = r[1]
    local end0 = r[2]

    -- Check if the range contains any non-empty lines
    local has_content = false
    for i = start0, end0 do
      if not string.is_blank(lines[i]) then
        has_content = true
        break
      end
    end

    -- Only format if there's actual content (not just empty lines)
    if start0 <= end0 and has_content then
      pcall(conform.format, {
        async = true,  -- Async to prevent blocking during typing
        lsp_fallback = true,
        timeout_ms = 1000,
        range = {
          start = { start0, 0 },
          ["end"] = { end0, 0 },
        },
      })
    end
  end

  -- Always update snapshot after formatting
  M.update_snapshot()
end
return M
