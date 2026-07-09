-- Moduł Jira — integracja z Jira Cloud wewnątrz Neovima.
--
-- Trzy ekrany (zakładki wspólnej ramki-popupu z ~10% marginesem):
--   a) Sprint Board — kanban aktywnego sprintu (ui/board.lua)
--   b) Task         — szczegół zadania z komentarzami i akcjami (ui/task.lua)
--   c) Backlog      — sprint na górze, kolejka backlogu na dole (ui/backlog.lua)
--
-- Uruchomienie: <leader>J. Otwiera się ostatnio oglądany ekran.
--
-- Konfiguracja jest per-repo (klucz = origin gita, fallback katalog) i trzymana
-- w utils.storage; poświadczenia z .env (JIRA_URL/JIRA_EMAIL/JIRA_API_TOKEN)
-- albo — jeśli brak — pytane przy pierwszym uruchomieniu. Patrz config.lua.

local config = require("system.jira.config")
local frame = require("system.jira.ui.frame")

local M = {}

-- ---------------------------------------------------------------------------
-- Router ekranów
-- ---------------------------------------------------------------------------

function M.show_board()
  frame.active_tab = "board"
  require("system.jira.ui.board").show()
end

function M.show_backlog()
  frame.active_tab = "backlog"
  require("system.jira.ui.backlog").show()
end

-- Ekran, na który wraca Esc z widoku taska (nil = brak → Esc zamyka).
M.return_to = nil

-- @param from string|nil — ekran, z którego weszliśmy ("board"/"backlog").
function M.show_task(key, from)
  if not key then
    vim.notify("Otwórz zadanie z boardu (Enter na karcie).", vim.log.levels.INFO)
    return
  end

  M.return_to = from
  frame.active_tab = "task"
  require("system.jira.ui.task").show(key)
end

-- Esc w tasku: wróć do poprzedniego ekranu, a jeśli go nie było — zamknij.
function M.task_back()
  local to = M.return_to
  M.return_to = nil

  if to == "board" then
    M.show_board()
  elseif to == "backlog" then
    M.show_backlog()
  else
    frame.close()
  end
end

-- Przełączanie zakładek (podpięte do ramki).
frame.on_tab = function(tab_id)
  if tab_id == "board" then
    M.show_board()
  elseif tab_id == "backlog" then
    M.show_backlog()
  elseif tab_id == "task" then
    local _, last_issue = config.last_screen()
    if last_issue then
      M.show_task(last_issue)
    else
      vim.notify("Brak otwartego zadania — otwórz je z boardu.", vim.log.levels.INFO)
    end
  end
end

-- Otwiera ostatnio oglądany ekran.
local function open_last_screen()
  local screen, issue_key = config.last_screen()

  if screen == "task" and issue_key then
    M.show_task(issue_key)
  elseif screen == "backlog" then
    M.show_backlog()
  else
    M.show_board()
  end
end

-- ---------------------------------------------------------------------------
-- Pierwsze uruchomienie: poświadczenia + wybór boardu
-- ---------------------------------------------------------------------------

-- Sekwencyjny prompt o poświadczenia. URL i email są podpowiadane obecnymi
-- wartościami (Enter zostawia), token wpisujemy zawsze od nowa.
local function prompt_credentials(done)
  local cur = config.credentials() or {}

  vim.ui.input({
    prompt = "Jira base URL (np. https://firma.atlassian.net): ",
    default = cur.base_url or "",
  }, function(url)
    if not url or url == "" then
      return
    end

    vim.ui.input({ prompt = "Jira email: ", default = cur.email or "" }, function(email)
      if not email or email == "" then
        return
      end

      vim.ui.input({ prompt = "Jira API token (wklej nowy): " }, function(token)
        if not token or token == "" then
          return
        end

        config.save_credentials({ base_url = url, email = email, api_token = token })
        done()
      end)
    end)
  end)
end

-- Picker boardu dla bieżącego repo (gdy brak zapisanego).
local function prompt_board(done)
  local api = require("system.jira.api")

  vim.notify("Jira: pobieram listę boardów…", vim.log.levels.INFO)

  api.list_boards(function(boards, err)
    if err then
      if err:match("HTTP 401") or err:match("HTTP 403") then
        vim.notify("Jira: auth nie działa (" .. err .. ").\nUruchamiam :JiraLogin…",
          vim.log.levels.WARN)
        M.login()
        return
      end

      return vim.notify("Jira: " .. err, vim.log.levels.ERROR)
    end

    if not boards or #boards == 0 then
      return vim.notify("Jira: nie znaleziono żadnych boardów.", vim.log.levels.WARN)
    end

    local labels = {}
    for _, b in ipairs(boards) do
      local proj = b.location and b.location.projectName or ""
      table.insert(labels, string.format("%s  [%s]  %s", b.name, b.type or "?", proj))
    end

    vim.ui.select(labels, { prompt = "Wybierz board dla tego repo:" }, function(_, idx)
      if not idx then
        return
      end

      local b = boards[idx]
      local project_key = b.location and b.location.projectKey or ""
      config.save_board(b.id, b.name, project_key)
      done()
    end)
  end)
end

-- Upewnia się, że mamy poświadczenia i board, potem woła `continue`.
local function ensure_config(continue)
  if not config.credentials() then
    prompt_credentials(function()
      ensure_config(continue)
    end)
    return
  end

  if not config.board_id() then
    prompt_board(function()
      ensure_config(continue)
    end)
    return
  end

  continue()
end

-- ---------------------------------------------------------------------------
-- Wejście
-- ---------------------------------------------------------------------------

function M.open()
  ensure_config(function()
    frame.open()
    open_last_screen()
  end)
end

-- Diagnostyka: pokazuje, jakie poświadczenia się rozwiązały (token zamaskowany)
-- i wykonuje kanoniczny test auth na /rest/api/3/myself.
function M.doctor()
  local creds = config.credentials()

  local lines = { "=== Jira Doctor ===", "repo key: " .. config.project_key() }

  if not creds then
    table.insert(lines, "❌ Brak kompletnych poświadczeń.")
    table.insert(lines, "   Ustaw JIRA_URL / JIRA_EMAIL / JIRA_API_TOKEN w " ..
      vim.fn.stdpath("config") .. "/.env albo w środowisku.")
    vim.notify(table.concat(lines, "\n"), vim.log.levels.WARN)
    return
  end

  local tok = creds.api_token
  local masked = #tok <= 6 and string.rep("*", #tok)
    or (tok:sub(1, 3) .. string.rep("*", #tok - 6) .. tok:sub(-3))

  table.insert(lines, "base_url: " .. creds.base_url)
  table.insert(lines, "email:    " .. creds.email)
  table.insert(lines, "token:    " .. masked .. "  (długość " .. #tok .. ")")
  table.insert(lines, "test:     GET /rest/api/3/myself …")
  vim.notify(table.concat(lines, "\n"), vim.log.levels.INFO)

  local api = require("system.jira.api")
  api.request("GET", "/rest/api/3/myself", nil, function(data, err)
    if err then
      vim.notify("❌ Auth NIE działa: " .. err
        .. "\n   • sprawdź, czy token pochodzi z id.atlassian.com/manage-profile/security/api-tokens"
        .. "\n   • email musi być tym z konta Atlassian"
        .. "\n   • base_url = https://TWOJA.atlassian.net (bez /jira, bez ścieżki)",
        vim.log.levels.ERROR)
      return
    end

    vim.notify("✅ Auth OK — zalogowany jako " ..
      (data.displayName or data.emailAddress or "?"), vim.log.levels.INFO)
  end)
end

-- Ponowne wpisanie poświadczeń (np. gdy token nie działa). Po zapisie
-- automatycznie odpala test auth (doctor).
function M.login()
  -- .env/środowisko ma pierwszeństwo nad storage — jeśli token stamtąd
  -- pochodzi, wpisywanie przez prompt nic nie da; kieruj do edycji .env.
  if config.from_env("api_token") then
    vim.notify(
      "Token Jira pochodzi z .env/środowiska (ma pierwszeństwo nad zapisanym).\n"
        .. "Popraw go w " .. vim.fn.stdpath("config") .. "/.env i zrestartuj nvim,\n"
        .. "albo usuń JIRA_API_TOKEN z .env i uruchom :JiraLogin ponownie.",
      vim.log.levels.WARN
    )
    return
  end

  prompt_credentials(function()
    vim.notify("Jira: zapisano poświadczenia — testuję…", vim.log.levels.INFO)
    M.doctor()
  end)
end

function M.close()
  frame.close()
end

function M.toggle()
  if frame.is_open() then
    frame.close()
  else
    M.open()
  end
end

function M.setup(opts)
  opts = opts or {}

  vim.keymap.set("n", opts.key or "<leader>j", function()
    M.open()
  end, { desc = "Jira", silent = true })

  vim.api.nvim_create_user_command("Jira", function()
    M.open()
  end, { desc = "Otwórz Jira" })

  vim.api.nvim_create_user_command("JiraLogin", function()
    M.login()
  end, { desc = "Wpisz ponownie poświadczenia Jira (token) i przetestuj" })

  vim.api.nvim_create_user_command("JiraDoctor", function()
    M.doctor()
  end, { desc = "Diagnostyka połączenia z Jira (test auth)" })

  vim.api.nvim_create_user_command("JiraResetAuth", function()
    config.clear_credentials()
    vim.notify("Jira: usunięto zapisane poświadczenia. Ustaw .env lub podaj je ponownie przez :Jira.",
      vim.log.levels.INFO)
  end, { desc = "Usuń zapisane poświadczenia Jira" })

  vim.api.nvim_create_user_command("JiraReconfigure", function()
    -- Wymusza ponowny wybór boardu dla bieżącego repo.
    config.save_board("", "", "")
    M.open()
  end, { desc = "Zmień board Jira dla tego repo" })
end

return M
