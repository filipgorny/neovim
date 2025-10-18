local M = {};

local session_dir = vim.fn.stdpath("data") .. "/sessions/"

local function get_git_root()
  local git_root = vim.fn.systemlist("git rev-parse --show-toplevel 2>/dev/null")[1]
  if vim.v.shell_error == 0 and git_root and git_root ~= "" then
    return git_root
  end
  return nil
end

local function get_git_branch()
  local branch = vim.fn.systemlist("git rev-parse --abbrev-ref HEAD 2>/dev/null")[1]
  if vim.v.shell_error == 0 and branch and branch ~= "" then
    return branch
  end
  return nil
end

local function session_file()
  -- Najpierw spróbuj znaleźć git root
  local base_path = get_git_root()
  local git_branch = nil

  -- Jeśli nie ma gita, użyj aktualnego katalogu
  if not base_path then
    base_path = vim.fn.getcwd()
  else
    -- Jeśli jesteśmy w git repo, pobierz branch
    git_branch = get_git_branch()
  end

  -- Normalizuj ścieżkę
  base_path = vim.fn.fnamemodify(base_path, ":p")
  -- usuń końcowy slash
  base_path = base_path:gsub("/$", "")

  -- Zamień slashe i kropki na bezpieczne znaki
  local safe_path = base_path:gsub("[/\\]", "__"):gsub("%.", "_")

  -- Dodaj branch do nazwy pliku jeśli istnieje
  if git_branch then
    local safe_branch = git_branch:gsub("[/\\]", "_"):gsub("%.", "_")
    safe_path = safe_path .. "__branch__" .. safe_branch
  end

  local name = session_dir .. safe_path .. ".vim"

  return name
end

local function save_session()
  local session_file_path = session_file()
  local full_session_file_name = vim.fn.fnameescape(session_file_path)

  local ok, err = pcall(function()
    vim.cmd("mksession! " .. full_session_file_name)
  end)

  if not ok then
    vim.notify("Failed to save session: " .. tostring(err), vim.log.levels.ERROR)
  end
end

-- Export save_session
M.save_session = save_session

vim.keymap.set("n", "<leader>S", save_session);

local function load_session()
  if vim.fn.argc() == 0 then
    local f = session_file()
    if vim.fn.filereadable(f) == 1 then
      vim.cmd("silent! source " .. vim.fn.fnameescape(f))

      -- Po załadowaniu sesji, odśwież LSP i podświetlanie składni dla wszystkich buforów
      vim.schedule(function()
        for _, buf in ipairs(vim.api.nvim_list_bufs()) do
          if vim.api.nvim_buf_is_loaded(buf) and vim.api.nvim_buf_get_option(buf, "buflisted") then
            local bufname = vim.api.nvim_buf_get_name(buf)
            if bufname and bufname ~= "" then
              -- Triggeruj BufRead i BufEnter żeby aktywować LSP i treesitter
              vim.api.nvim_exec_autocmds("BufRead", { buffer = buf })
              vim.api.nvim_exec_autocmds("BufEnter", { buffer = buf })
            end
          end
        end
      end)
      return true
    end
  end
  return false
end

-- Export load_session with option to force load even with args
M.load_session = function(force)
  if force or vim.fn.argc() == 0 then
    local f = session_file()
    if vim.fn.filereadable(f) == 1 then
      vim.cmd("silent! source " .. vim.fn.fnameescape(f))

      -- Po załadowaniu sesji, odśwież LSP i podświetlanie składni dla wszystkich buforów
      vim.schedule(function()
        for _, buf in ipairs(vim.api.nvim_list_bufs()) do
          if vim.api.nvim_buf_is_loaded(buf) and vim.api.nvim_buf_get_option(buf, "buflisted") then
            local bufname = vim.api.nvim_buf_get_name(buf)
            if bufname and bufname ~= "" then
              -- Triggeruj BufRead i BufEnter żeby aktywować LSP i treesitter
              vim.api.nvim_exec_autocmds("BufRead", { buffer = buf })
              vim.api.nvim_exec_autocmds("BufEnter", { buffer = buf })
            end
          end
        end
      end)
      return true
    end
  end
  return false
end

-- Check if session file exists
M.session_exists = function()
  local f = session_file()
  return vim.fn.filereadable(f) == 1
end

M.setup = function()
  vim.fn.mkdir(session_dir, "p")

  -- zapis sesji przy wyjściu
  local augroup = vim.api.nvim_create_augroup("SessionManager", { clear = true })

  vim.api.nvim_create_autocmd({ "VimLeavePre", "QuitPre" }, {
    group = augroup,
    callback = function()
      -- zapis wszystkich zmienionych plików
      vim.cmd("silent! wa")
      -- zapis sesji z pełnym układem okien i zakładkami
      save_session()
    end,
  })

  -- ładowanie sesji przy starcie, jeśli nie podano plików w argumencie
  -- sprawdź czy VimEnter już się wykonał
  if vim.v.vim_did_enter == 1 then
    -- VimEnter już był, załaduj sesję teraz
    load_session()
  else
    -- VimEnter jeszcze nie był, ustaw autocmd
    vim.api.nvim_create_autocmd("VimEnter", {
      callback = load_session,
    })
  end
end

return M
