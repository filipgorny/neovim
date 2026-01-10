-- file: lua/utils/buffer_history.lua
-- Prosty system nawigacji między buforami

local M = {}

-- Historia buforów (lista bufnr w kolejności dostępu)
M.history = {}
M.current_index = 0

-- Dodaj bufor do historii
function M.add_buffer(bufnr)
  bufnr = bufnr or vim.api.nvim_get_current_buf()
  
  -- Ignoruj specjalne bufory
  local buftype = vim.api.nvim_buf_get_option(bufnr, 'buftype')
  if buftype ~= '' then
    return
  end
  
  -- Usuń bufor z historii jeśli już tam jest
  for i, buf in ipairs(M.history) do
    if buf == bufnr then
      table.remove(M.history, i)
      break
    end
  end
  
  -- Dodaj na koniec historii
  table.insert(M.history, bufnr)
  M.current_index = #M.history
end

-- Przejdź do poprzedniego bufora (M-k)
function M.go_prev()
  if #M.history == 0 then
    return
  end
  
  -- Znajdź poprzedni bufor w historii
  local current_buf = vim.api.nvim_get_current_buf()
  local current_pos = nil
  
  for i, buf in ipairs(M.history) do
    if buf == current_buf then
      current_pos = i
      break
    end
  end
  
  if not current_pos then
    -- Aktualny bufor nie jest w historii, idź do ostatniego
    current_pos = #M.history + 1
  end
  
  -- Idź do poprzedniego (z wrap around)
  local prev_pos = current_pos - 1
  if prev_pos < 1 then
    prev_pos = #M.history
  end
  
  local bufnr = M.history[prev_pos]
  if bufnr and vim.api.nvim_buf_is_valid(bufnr) then
    vim.api.nvim_set_current_buf(bufnr)
    M.current_index = prev_pos
  end
end

-- Przejdź do następnego bufora (M-j)
function M.go_next()
  if #M.history == 0 then
    return
  end
  
  -- Znajdź aktualny bufor w historii
  local current_buf = vim.api.nvim_get_current_buf()
  local current_pos = nil
  
  for i, buf in ipairs(M.history) do
    if buf == current_buf then
      current_pos = i
      break
    end
  end
  
  if not current_pos then
    -- Aktualny bufor nie jest w historii, idź do pierwszego
    current_pos = 0
  end
  
  -- Idź do następnego (z wrap around)
  local next_pos = current_pos + 1
  if next_pos > #M.history then
    next_pos = 1
  end
  
  local bufnr = M.history[next_pos]
  if bufnr and vim.api.nvim_buf_is_valid(bufnr) then
    vim.api.nvim_set_current_buf(bufnr)
    M.current_index = next_pos
  end
end

-- Inicjalizacja
function M.setup()
  -- Dodaj aktualny bufor do historii
  M.add_buffer(vim.api.nvim_get_current_buf())
  
  -- Śledź zmiany buforów
  vim.api.nvim_create_autocmd("BufEnter", {
    callback = function()
      vim.schedule(function()
        M.add_buffer(vim.api.nvim_get_current_buf())
      end)
    end,
  })
  
  -- Usuń zamknięte bufory z historii
  vim.api.nvim_create_autocmd("BufDelete", {
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
