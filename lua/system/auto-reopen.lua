-- folder, w którym trzymamy sesje
local session_dir = vim.fn.stdpath("data") .. "/sessions/"

-- Upewnij się, że katalog istnieje
vim.fn.mkdir(session_dir, "p")

-- Zapisz sesję przy wyjściu
vim.api.nvim_create_autocmd("VimLeavePre", {
  callback = function()
    -- nazwa pliku sesji = pełna ścieżka katalogu roboczego zakodowana
    local session_file = session_dir .. vim.fn.fnamemodify(vim.fn.getcwd(), ":p:h:t") .. ".vim"
    vim.cmd("mksession! " .. vim.fn.fnameescape(session_file))
  end,
})

-- Załaduj sesję przy starcie, jeśli istnieje
vim.api.nvim_create_autocmd("VimEnter", {
  callback = function()
    if vim.fn.argc() == 0 then  -- tylko jeśli nie podano plików w linii komend
      local session_file = session_dir .. vim.fn.fnamemodify(vim.fn.getcwd(), ":p:h:t") .. ".vim"
      if vim.fn.filereadable(session_file) == 1 then
        vim.cmd("source " .. vim.fn.fnameescape(session_file))
      end
    end
  end,
})

