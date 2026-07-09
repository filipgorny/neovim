-- Przełącznik projektów: <leader>P otwiera listę ostatnio otwieranych projektów
-- (Telescope), a wybór jednego:
--   1. zapisuje PEŁNY stan bieżącego projektu do sesji (:mksession — wszystkie
--      okna, karty, layout, bufory, cwd),
--   2. czyści edytor i przywraca sesję wybranego projektu 1:1.
--
-- Rejestr projektów (ścieżka, nazwa, plik sesji, kiedy ostatnio otwarty) leży
-- w SQLite (utils.storage). Sam layout trzymamy w plikach :mksession pod
-- stdpath("data")/projects_sessions/, bo native session odtwarza stan wiernie.

local M = {}

local storage = require("utils.storage")

local PROJECTS_TABLE = "projects"
local SESSION_DIR = vim.fn.stdpath("data") .. "/projects_sessions"

-- Co zapisać w sesji, żeby layout wrócił idealnie (bez `options` — nie chcemy
-- nadpisywać runtime'owych opcji przy wczytaniu).
local SESSIONOPTIONS = "blank,buffers,curdir,folds,help,tabpages,winsize,winpos,localoptions"

-- Okna pomocnicze (sidebary, czat agenta, bufory specjalne) wycinamy przed
-- zapisem — inaczej sesja przywróciłaby puste/śmieciowe okna.
local SIDEBAR_FT = {
  ["neo-tree"] = true, ["NvimTree"] = true, ["neo-tree-popup"] = true,
  ["aerial"] = true, ["Outline"] = true, ["undotree"] = true,
  ["Trouble"] = true, ["trouble"] = true, ["help"] = true, ["qf"] = true,
}

M.current = nil -- ścieżka projektu, w którym „jesteśmy" (którą zapiszemy wychodząc)

---------------------------------------------------------------------------
-- Pomocnicze
---------------------------------------------------------------------------

local function ensure_dir()
  if vim.fn.isdirectory(SESSION_DIR) == 0 then
    vim.fn.mkdir(SESSION_DIR, "p")
  end
end

-- Deterministyczna ścieżka pliku sesji dla danego projektu.
local function session_path(path)
  return SESSION_DIR .. "/" .. vim.fn.sha256(path) .. ".vim"
end

-- Korzeń bieżącego projektu: git root cwd, a jak nie ma — samo cwd.
local function get_project_root()
  local cwd = vim.fn.getcwd()
  local root = vim.fn.systemlist(
    "git -C " .. vim.fn.shellescape(cwd) .. " rev-parse --show-toplevel 2>/dev/null"
  )[1]

  if vim.v.shell_error == 0 and root and root ~= "" then
    return (vim.fn.fnamemodify(root, ":p"):gsub("/$", ""))
  end

  return (cwd:gsub("/$", ""))
end

-- Zapisz/odśwież wpis projektu w rejestrze (z aktualnym last_opened).
local function register_project(path, session_file)
  storage.insert_or_replace(PROJECTS_TABLE, {
    path = path,
    name = vim.fn.fnamemodify(path, ":t"),
    session_file = session_file or session_path(path),
    last_opened = os.date("%Y-%m-%d %H:%M:%S"),
  })
end

-- Zamknij okna pomocnicze, żeby w sesji został tylko realny layout plików.
local function close_transient_windows()
  for _, w in ipairs(vim.api.nvim_list_wins()) do
    if vim.api.nvim_win_is_valid(w) then
      local b = vim.api.nvim_win_get_buf(w)
      local bt = vim.bo[b].buftype
      local ft = vim.bo[b].filetype

      if bt ~= "" or SIDEBAR_FT[ft] then
        pcall(vim.api.nvim_win_close, w, true)
      end
    end
  end
end

-- Wyczyść edytor do czystej kartki (bez odpalania autocmd śledzących bufory).
local function clean_slate()
  local ei = vim.o.eventignore
  vim.o.eventignore = "all"

  pcall(vim.cmd, "silent! tabonly!")
  pcall(vim.cmd, "silent! only!")
  pcall(vim.cmd, "silent! %bwipeout!")

  vim.o.eventignore = ei
end

---------------------------------------------------------------------------
-- Zapis / odczyt sesji projektu
---------------------------------------------------------------------------

-- Zapisz pełny stan `path` do jego pliku :mksession i odśwież rejestr.
function M.save_project(path)
  if not path or path == "" then return end

  ensure_dir()

  local file = session_path(path)

  close_transient_windows()

  local so = vim.o.sessionoptions
  vim.o.sessionoptions = SESSIONOPTIONS
  local ok = pcall(vim.cmd, "mksession! " .. vim.fn.fnameescape(file))
  vim.o.sessionoptions = so

  if ok then
    register_project(path, file)
  end

  return ok
end

-- Wczytaj projekt: wyczyść edytor i odtwórz sesję (albo wejdź świeżo, jeśli
-- projekt nie ma jeszcze zapisanej sesji).
local function load_project(path)
  local rows = storage.select(PROJECTS_TABLE, { "session_file" }, { path = path }, {})
  local file = rows and rows[1] and rows[1][1]

  clean_slate()

  if file and vim.fn.filereadable(file) == 1 then
    local ok, err = pcall(vim.cmd, "silent! source " .. vim.fn.fnameescape(file))

    if not ok then
      vim.notify("Nie udało się wczytać sesji: " .. tostring(err), vim.log.levels.ERROR)
    end
  else
    -- brak sesji — po prostu wejdź do katalogu projektu
    pcall(vim.cmd, "cd " .. vim.fn.fnameescape(path))
    pcall(vim.cmd, "enew")
  end

  M.current = path
  register_project(path, file)

  vim.schedule(function()
    -- dopal filetype/LSP/treesitter dla przywróconych, załadowanych buforów
    for _, b in ipairs(vim.api.nvim_list_bufs()) do
      if vim.api.nvim_buf_is_loaded(b) and vim.api.nvim_buf_get_name(b) ~= "" then
        pcall(vim.api.nvim_exec_autocmds, "BufRead", { buffer = b })
      end
    end

    vim.notify("Projekt: " .. vim.fn.fnamemodify(path, ":t"), vim.log.levels.INFO)
  end)
end

-- Przełącz na projekt `path`: najpierw zapisz bieżący, potem wczytaj docelowy.
function M.switch_to(path)
  if not path or path == "" then return end

  if path == M.current then
    vim.notify("Już jesteś w tym projekcie", vim.log.levels.INFO)

    return
  end

  if M.current then
    M.save_project(M.current)
  end

  load_project(path)
end

---------------------------------------------------------------------------
-- Telescope picker
---------------------------------------------------------------------------

function M.pick()
  local rows = storage.select(
    PROJECTS_TABLE,
    { "path", "name", "last_opened" },
    {},
    { "last_opened DESC" }
  )

  if not rows or #rows == 0 then
    vim.notify("Brak zapisanych projektów", vim.log.levels.INFO)

    return
  end

  local ok, pickers = pcall(require, "telescope.pickers")

  if not ok then
    vim.notify("Telescope niedostępny", vim.log.levels.ERROR)

    return
  end

  local finders = require("telescope.finders")
  local conf = require("telescope.config").values
  local actions = require("telescope.actions")
  local action_state = require("telescope.actions.state")

  pickers.new({}, {
    prompt_title = "Projekty",
    finder = finders.new_table({
      results = rows,
      entry_maker = function(row)
        local path = row[1]
        local name = row[2] or vim.fn.fnamemodify(path, ":t")
        local short = vim.fn.fnamemodify(path, ":~")
        local marker = (path == M.current) and " ●" or ""

        return {
          value = path,
          display = string.format("%-28s %s%s", name, short, marker),
          ordinal = name .. " " .. path,
        }
      end,
    }),
    sorter = conf.generic_sorter({}),
    attach_mappings = function(prompt_bufnr)
      actions.select_default:replace(function()
        local entry = action_state.get_selected_entry()
        actions.close(prompt_bufnr)

        if entry then
          M.switch_to(entry.value)
        end
      end)

      return true
    end,
  }):find()
end

---------------------------------------------------------------------------
-- Setup
---------------------------------------------------------------------------

function M.setup()
  storage.init()

  storage.create_table(PROJECTS_TABLE, {
    { name = "path", type = "TEXT PRIMARY KEY" },
    { name = "name", type = "TEXT" },
    { name = "session_file", type = "TEXT" },
    { name = "last_opened", type = "DATETIME DEFAULT CURRENT_TIMESTAMP" },
  }, {
    { name = "idx_projects_recent", columns = { "last_opened" } },
  })

  -- Zarejestruj bieżący projekt, żeby od razu był na liście.
  M.current = get_project_root()
  register_project(M.current, session_path(M.current))

  vim.keymap.set("n", "<leader>P", M.pick, { desc = "Projekty (ostatnio otwierane)" })

  vim.api.nvim_create_user_command("Projects", M.pick, {})
  vim.api.nvim_create_user_command("ProjectSave", function()
    M.save_project(M.current)
    vim.notify("Zapisano sesję projektu: " .. vim.fn.fnamemodify(M.current, ":t"))
  end, {})

  -- Zapisz stan bieżącego projektu przy wyjściu z Neovima.
  vim.api.nvim_create_autocmd("VimLeavePre", {
    group = vim.api.nvim_create_augroup("ProjectSwitcher", { clear = true }),
    callback = function()
      if M.current then
        M.save_project(M.current)
      end
    end,
  })
end

return M
