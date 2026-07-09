-- file: lua/utils/buffer_history.lua
-- Prosty system nawigacji między buforami

local M = {}

-- Historia buforów (lista bufnr w kolejności dostępu)
M.history = {}
M.current_index = 0
M.navigating = false  -- Flag to prevent reordering during navigation

-- Cap on number of entries kept. Each entry is a single bufnr (small integer),
-- but unbounded growth still wastes memory + slows linear scans.
local MAX_HISTORY = 200

-- Dodaj bufor do historii
function M.add_buffer(bufnr)
  bufnr = bufnr or vim.api.nvim_get_current_buf()

  -- Ignoruj specjalne bufory
  local buftype = vim.api.nvim_buf_get_option(bufnr, 'buftype')
  if buftype ~= '' then
    return
  end

  -- If navigating, just update current_index to match the buffer
  if M.navigating then
    for i, buf in ipairs(M.history) do
      if buf == bufnr then
        M.current_index = i
        break
      end
    end
    return
  end

  -- Usuń bufor z historii jeśli już tam jest
  for i, buf in ipairs(M.history) do
    if buf == bufnr then
      table.remove(M.history, i)
      break
    end
  end

  -- Dodaj na koniec historii i usuń wszystko co było "do przodu"
  -- (truncate forward history when making a new navigation action)
  while #M.history > M.current_index do
    table.remove(M.history)
  end
  
  table.insert(M.history, bufnr)

  -- Cap the history — drop oldest entries from the front. Adjust current_index
  -- to stay aligned with the (now shifted) list.
  while #M.history > MAX_HISTORY do
    table.remove(M.history, 1)
    M.current_index = M.current_index - 1
  end

  M.current_index = #M.history
end

-- Przejdź do poprzedniego bufora
function M.go_prev()
  if #M.history == 0 then
    vim.notify("No buffer history", vim.log.levels.WARN)
    return
  end

  -- Use current_index for navigation instead of finding current buffer
  local prev_pos = M.current_index - 1
  if prev_pos < 1 then
    vim.notify("Already at first buffer", vim.log.levels.INFO)
    return
  end

  local bufnr = M.history[prev_pos]
  if bufnr and vim.api.nvim_buf_is_valid(bufnr) then
    M.navigating = true
    M.current_index = prev_pos
    vim.api.nvim_set_current_buf(bufnr)
    -- Clear flag after BufEnter event has been processed
    vim.schedule(function()
      M.navigating = false
    end)
  else
    -- Buffer is invalid, remove it and try again
    table.remove(M.history, prev_pos)
    M.current_index = math.min(M.current_index, #M.history)
    M.go_prev()
  end
end

-- Przejdź do następnego bufora
function M.go_next()
  if #M.history == 0 then
    vim.notify("No buffer history", vim.log.levels.WARN)
    return
  end

  -- Use current_index for navigation
  local next_pos = M.current_index + 1
  if next_pos > #M.history then
    vim.notify("Already at last buffer", vim.log.levels.INFO)
    return  -- Don't wrap, stay at end
  end

  local bufnr = M.history[next_pos]
  if bufnr and vim.api.nvim_buf_is_valid(bufnr) then
    M.navigating = true
    M.current_index = next_pos
    vim.api.nvim_set_current_buf(bufnr)
    -- Clear flag after BufEnter event has been processed
    vim.schedule(function()
      M.navigating = false
    end)
  else
    -- Buffer is invalid, remove it and try again
    table.remove(M.history, next_pos)
    M.go_next()
  end
end

-- Pokaż historię buforów (do debugowania)
function M.show_history()
  if #M.history == 0 then
    vim.notify("Buffer history is empty", vim.log.levels.INFO)
    return
  end
  
  local lines = {}
  table.insert(lines, "Buffer History (current index: " .. M.current_index .. "):")
  table.insert(lines, string.rep("-", 60))
  
  for i, bufnr in ipairs(M.history) do
    local is_current = (i == M.current_index)
    local marker = is_current and ">>> " or "    "
    local is_valid = vim.api.nvim_buf_is_valid(bufnr)
    local bufname = is_valid and vim.api.nvim_buf_get_name(bufnr) or "[INVALID]"
    local short_name = vim.fn.fnamemodify(bufname, ":t")
    
    table.insert(lines, string.format("%s[%d] %s (bufnr: %d)", marker, i, short_name, bufnr))
  end
  
  vim.notify(table.concat(lines, "\n"), vim.log.levels.INFO)
end

-- Inicjalizacja
function M.setup()
  -- Dodaj aktualny bufor do historii
  M.add_buffer(vim.api.nvim_get_current_buf())

  -- Augroup z clear=true zapobiega multiplikacji autocmds przy ponownym setup().
  local group = vim.api.nvim_create_augroup("BufferHistory", { clear = true })

  -- Śledź zmiany buforów
  vim.api.nvim_create_autocmd("BufEnter", {
    group = group,
    callback = function()
      vim.schedule(function()
        M.add_buffer(vim.api.nvim_get_current_buf())
      end)
    end,
  })

  -- Usuń zamknięte bufory z historii
  vim.api.nvim_create_autocmd("BufDelete", {
    group = group,
    callback = function(args)
      for i, buf in ipairs(M.history) do
        if buf == args.buf then
          table.remove(M.history, i)
          if M.current_index > i then
            M.current_index = M.current_index - 1
          elseif M.current_index == i then
            M.current_index = math.min(M.current_index, #M.history)
          end
          break
        end
      end
    end,
  })
end

return M
