local session_dir = vim.fn.stdpath("data") .. "/sessions/"

vim.fn.mkdir(session_dir, "p")

local function session_file()
  local cwd_name = vim.fn.fnamemodify(vim.fn.getcwd(), ":p")
  local safe_path = cwd_name:gsub("[/\\]", "__"):gsub("%.", "")

  local name = session_dir .. safe_path .. ".vim"

  vim.notify("SESSION FILE NAME: " .. name)

  return name
end

local function save_session()
  local full_session_file_name = vim.fn.fnameescape(session_file())

  vim.notify("Saving session in the " .. full_session_file_name)

  vim.cmd("mksession! " .. full_session_file_name)
end

vim.keymap.set("n", "<leader>S", save_session);

-- zapis sesji przy wyjściu
vim.api.nvim_create_autocmd("VimLeavePre", {
  callback = function()
    -- zapis wszystkich zmienionych plików
    vim.cmd("silent! wa")
    -- zapis sesji z pełnym układem okien i zakładkami
    save_session()
  end,
})

-- ładowanie sesji przy starcie, jeśli nie podano plików w argumencie
vim.api.nvim_create_autocmd("VimEnter", {
  callback = function()
    if vim.fn.argc() == 0 then
      local f = session_file()
      if vim.fn.filereadable(f) == 1 then
        vim.cmd("silent! source " .. vim.fn.fnameescape(f))
      end
    end
  end,
})

