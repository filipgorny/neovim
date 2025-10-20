local M = {};

local session_dir = vim.fn.stdpath("data") .. "/sessions/"
local breakpoints_dir = vim.fn.stdpath("data") .. "/breakpoints/"

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

local function get_base_path_and_branch()
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

  return base_path, git_branch
end

local function get_safe_path()
  local base_path, git_branch = get_base_path_and_branch()

  -- Zamień slashe i kropki na bezpieczne znaki
  local safe_path = base_path:gsub("[/\\]", "__"):gsub("%.", "_")

  -- Dodaj branch do nazwy pliku jeśli istnieje
  if git_branch then
    local safe_branch = git_branch:gsub("[/\\]", "_"):gsub("%.", "_")
    safe_path = safe_path .. "__branch__" .. safe_branch
  end

  return safe_path
end

local function session_file()
  return session_dir .. get_safe_path() .. ".vim"
end

local function breakpoints_file()
  return breakpoints_dir .. get_safe_path() .. ".json"
end

local function save_breakpoints()
  local ok, dap = pcall(require, "dap")
  if not ok or not dap.breakpoints then
    return -- DAP not loaded or breakpoints module not available
  end

  local debugging_ok, debugging = pcall(require, "system.debugging")
  if not debugging_ok then
    vim.notify("Failed to load debugging module", vim.log.levels.ERROR)
    return
  end

  local breakpoints = dap.breakpoints.get()

  if not breakpoints or vim.tbl_isempty(breakpoints) then
    return -- No breakpoints to save
  end

  -- Clear existing breakpoints for this project
  debugging.clear_breakpoints()

  -- Save each breakpoint to database
  local count = 0
  for buf, buf_bps in pairs(breakpoints) do
    local bufnr = tonumber(buf)
    if bufnr and vim.api.nvim_buf_is_valid(bufnr) then
      local filepath = vim.api.nvim_buf_get_name(bufnr)
      if filepath and filepath ~= "" then
        for _, bp in ipairs(buf_bps) do
          debugging.save_breakpoint(
            filepath,
            bp.line,
            bp.condition,
            bp.hitCondition,
            bp.logMessage
          )
          count = count + 1
        end
      end
    end
  end
end

local function load_breakpoints()
  local ok, dap = pcall(require, "dap")
  if not ok then
    return -- DAP not loaded yet
  end

  local debugging_ok, debugging = pcall(require, "system.debugging")
  if not debugging_ok then
    vim.notify("Failed to load debugging module", vim.log.levels.ERROR)
    return
  end

  -- Load breakpoints from database
  local file_breakpoints = debugging.load_breakpoints()

  if not file_breakpoints or vim.tbl_isempty(file_breakpoints) then
    return -- No breakpoints to load
  end

  -- Defer breakpoint restoration to ensure buffers are fully loaded
  vim.schedule(function()
    -- Restore breakpoints for each file
    for filepath, bps in pairs(file_breakpoints) do
      -- Find or create buffer for this file
      local bufnr = vim.fn.bufnr(filepath)

      -- If buffer doesn't exist, create it
      if bufnr == -1 then
        bufnr = vim.fn.bufadd(filepath)
        -- Load the buffer to ensure it's valid
        vim.fn.bufload(bufnr)
      end

      -- Set breakpoints for this buffer
      if bufnr and bufnr ~= -1 then
        for _, bp in ipairs(bps) do
          -- Create opts table from breakpoint data
          local opts = {
            condition = bp.condition,
            hitCondition = bp.hitCondition,
            logMessage = bp.logMessage,
          }
          -- Call dap.breakpoints.set with correct signature: (opts, bufnr, lnum)
          pcall(dap.breakpoints.set, opts, bufnr, bp.line)
        end
      end
    end
  end)
end

local function save_session()
  -- Close DAP UI windows before saving session
  local dap_ok, dapui = pcall(require, "dapui")
  if dap_ok then
    dapui.close()
  end

  -- Close any remaining DAP buffers
  for _, buf in ipairs(vim.api.nvim_list_bufs()) do
    if vim.api.nvim_buf_is_valid(buf) then
      local bufname = vim.api.nvim_buf_get_name(buf)
      local filetype = vim.bo[buf].filetype or ""

      -- Close DAP-related buffers based on filetype or buffer name
      local is_dap_buffer = filetype:match("^dap") ~= nil or
        bufname:match("DAP") ~= nil or
        bufname:match("dap%-repl") ~= nil or
        bufname:match("%[dap%-") ~= nil

      if is_dap_buffer then
        pcall(vim.api.nvim_buf_delete, buf, { force = true })
      end
    end
  end

  local session_file_path = session_file()
  local full_session_file_name = vim.fn.fnameescape(session_file_path)

  local ok, err = pcall(function()
    vim.cmd("mksession! " .. full_session_file_name)
  end)

  if not ok then
    vim.notify("Failed to save session: " .. tostring(err), vim.log.levels.ERROR)
  end

  -- Save breakpoints along with session
  save_breakpoints()
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

        -- Load breakpoints after buffers are loaded
        load_breakpoints()
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

        -- Load breakpoints after buffers are loaded
        load_breakpoints()
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
  vim.fn.mkdir(breakpoints_dir, "p")

  -- zapis sesji przy wyjściu
  local augroup = vim.api.nvim_create_augroup("SessionManager", { clear = true })

  vim.api.nvim_create_autocmd({ "VimLeavePre" }, {
    group = augroup,
    callback = function()
      -- zapis wszystkich zmienionych plików
      vim.cmd("silent! wa")
      -- zapis sesji z pełnym układem okien i zakładkami
      local ok, err = pcall(save_session)
      if not ok then
        -- Write error to file since we're exiting
        local error_file = vim.fn.stdpath("data") .. "/session_error.log"
        local f = io.open(error_file, "w")
        if f then
          f:write(os.date("%Y-%m-%d %H:%M:%S") .. "\n")
          f:write("Error in save_session:\n")
          f:write(tostring(err) .. "\n")
          f:close()
        end
        vim.notify("Session save error (see " .. error_file .. "): " .. tostring(err), vim.log.levels.ERROR)
        -- Wait a bit so user can see the error
        vim.cmd("sleep 2")
      end
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
