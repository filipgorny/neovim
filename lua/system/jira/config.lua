-- Konfiguracja i trwałość modułu Jira.
--
-- Dwie warstwy:
--   1. Poświadczenia (globalne dla konta): base_url, email, api_token.
--      Źródła w kolejności: .env / środowisko (utils.env) -> storage.
--      Jeśli brak — pytamy przy pierwszym uruchomieniu i zapisujemy w storage.
--   2. Board dla bieżącego repo (per-projekt): board_id, project_key oraz
--      ostatni ekran. Klucz projektu = URL origin gita, a jeśli repo nie ma
--      origin/nie jest repo, to katalog roboczy (ten sam wzorzec co
--      system.agent.history). Trzymane w utils.storage (SQLite).

local env = require("utils.env")
local storage = require("utils.storage")

local M = {}

-- Nazwy zmiennych czytane z .env / środowiska.
local ENV_KEYS = {
  base_url = { "JIRA_URL", "JIRA_BASE_URL" },
  email = { "JIRA_EMAIL", "JIRA_USER" },
  api_token = { "JIRA_API_TOKEN", "JIRA_TOKEN" },
}

local CRED_TABLE = "jira_credentials"
local REPO_TABLE = "jira_repo"
local FILTER_TABLE = "jira_filter"

local initialized = false

local function ensure_tables()
  if initialized then
    return
  end

  storage.init()
  storage.create_table(CRED_TABLE, {
    { name = "id", type = "TEXT PRIMARY KEY" },
    { name = "base_url", type = "TEXT" },
    { name = "email", type = "TEXT" },
    { name = "api_token", type = "TEXT" },
  })
  storage.create_table(REPO_TABLE, {
    { name = "repo_key", type = "TEXT PRIMARY KEY" },
    { name = "board_id", type = "TEXT" },
    { name = "board_name", type = "TEXT" },
    { name = "project_key", type = "TEXT" },
    { name = "last_screen", type = "TEXT" },
    { name = "last_issue_key", type = "TEXT" },
  })
  storage.create_table(FILTER_TABLE, {
    { name = "repo_key", type = "TEXT PRIMARY KEY" },
    { name = "data", type = "TEXT" },
  })
  initialized = true
end

-- Klucz identyfikujący repo/projekt: origin gita albo katalog roboczy.
function M.project_key()
  local cwd = vim.fn.getcwd()
  local url = vim.fn.systemlist({ "git", "-C", cwd, "remote", "get-url", "origin" })[1]

  if vim.v.shell_error == 0 and url and url ~= "" then
    return vim.trim(url)
  end

  return cwd
end

-- ---------------------------------------------------------------------------
-- Poświadczenia
-- ---------------------------------------------------------------------------

local function env_value(field)
  for _, key in ipairs(ENV_KEYS[field]) do
    local v = env.get(key)

    if v and v ~= "" then
      return v
    end
  end

  return nil
end

-- utils.storage zwraca wiersze POZYCYJNIE (przez indeks), a jego parser gubi
-- puste pola (przesuwając kolumny). Dlatego: (1) zawsze podajemy jawną listę
-- kolumn i czytamy przez indeks, (2) nigdy nie zapisujemy pustego stringa —
-- pustki zamieniamy na sentinel "-" przy zapisie i z powrotem na nil/"" przy
-- odczycie. Dzięki temu liczba pól zawsze się zgadza.
local CRED_COLS = { "id", "base_url", "email", "api_token" }
local REPO_COLS = { "repo_key", "board_id", "board_name", "project_key", "last_screen", "last_issue_key" }
local FILTER_COLS = { "repo_key", "data" }

local SENTINEL = "-"

local function nz(v)
  if v == nil or v == "" then
    return SENTINEL
  end
  return tostring(v)
end

local function rd(v)
  if v == nil or v == SENTINEL then
    return nil
  end
  return v
end

-- Buduje tabelę z nazwanymi polami z wiersza pozycyjnego.
local function row_to_named(cols, row)
  if not row then
    return nil
  end

  local out = {}
  for i, col in ipairs(cols) do
    out[col] = rd(row[i])
  end
  return out
end

local function stored_credentials()
  ensure_tables()
  local rows = storage.select(CRED_TABLE, CRED_COLS, { id = "default" })
  return row_to_named(CRED_COLS, rows[1])
end

-- Usuwa otaczające białe znaki ORAZ CR (\r) — parser .env potrafi dokleić
-- końcówkę linii / spacje do wartości, co psuje nagłówek Basic auth (401).
local function clean(v)
  if v == nil then
    return nil
  end

  v = v:gsub("[\r\n]", "")
  v = vim.trim(v)

  if v == "" then
    return nil
  end

  return v
end

-- Zwraca { base_url, email, api_token } albo nil, jeśli czegoś brakuje.
function M.credentials()
  local stored = stored_credentials() or {}

  local creds = {
    base_url = clean(env_value("base_url") or stored.base_url),
    email = clean(env_value("email") or stored.email),
    api_token = clean(env_value("api_token") or stored.api_token),
  }

  if creds.base_url then
    -- Normalizacja — bez końcowego slasha.
    creds.base_url = creds.base_url:gsub("/+$", "")
  end

  if not (creds.base_url and creds.email and creds.api_token) then
    return nil
  end

  return creds
end

function M.save_credentials(creds)
  ensure_tables()
  storage.insert_or_replace(CRED_TABLE, {
    id = "default",
    base_url = nz((creds.base_url or ""):gsub("/+$", "")),
    email = nz(creds.email),
    api_token = nz(creds.api_token),
  })
end

-- Czy dane pole poświadczeń pochodzi z .env/środowiska (ma pierwszeństwo
-- nad storage — więc ponowne wpisanie przez prompt go nie nadpisze).
function M.from_env(field)
  return env_value(field) ~= nil
end

-- Usuwa zapisane poświadczenia (nie dotyka .env — te i tak mają pierwszeństwo).
function M.clear_credentials()
  ensure_tables()
  storage.delete(CRED_TABLE, { id = "default" })
end

-- ---------------------------------------------------------------------------
-- Config repo (board / ostatni ekran)
-- ---------------------------------------------------------------------------

function M.repo()
  ensure_tables()
  local rows = storage.select(REPO_TABLE, REPO_COLS, { repo_key = M.project_key() })
  return row_to_named(REPO_COLS, rows[1])
end

-- Zapis wiersza repo z sentinelami na pustych polach.
local function write_repo(tbl)
  storage.insert_or_replace(REPO_TABLE, {
    repo_key = nz(tbl.repo_key),
    board_id = nz(tbl.board_id),
    board_name = nz(tbl.board_name),
    project_key = nz(tbl.project_key),
    last_screen = nz(tbl.last_screen),
    last_issue_key = nz(tbl.last_issue_key),
  })
end

function M.board_id()
  local repo = M.repo()

  if not repo or not repo.board_id then
    return nil
  end

  return repo.board_id
end

function M.save_board(board_id, board_name, project_key)
  ensure_tables()
  local existing = M.repo() or {}
  write_repo({
    repo_key = M.project_key(),
    board_id = board_id ~= "" and tostring(board_id) or nil,
    board_name = board_name or existing.board_name,
    project_key = project_key or existing.project_key,
    last_screen = existing.last_screen or "board",
    last_issue_key = existing.last_issue_key,
  })
end

-- Zapamiętuje ostatni ekran (i ewentualnie kontekst taska), żeby przy
-- kolejnym <leader>J otworzyć to, co widzieliśmy ostatnio.
function M.save_last_screen(screen, issue_key)
  ensure_tables()
  local existing = M.repo()

  if not existing then
    return
  end

  existing.last_screen = screen
  if issue_key ~= nil then
    existing.last_issue_key = issue_key
  end

  write_repo(existing)
end

function M.last_screen()
  local repo = M.repo()

  if not repo then
    return "board", nil
  end

  return repo.last_screen or "board", repo.last_issue_key
end

-- ---------------------------------------------------------------------------
-- Filtr zadań (per-repo, wspólny dla boardu i backlogu)
-- ---------------------------------------------------------------------------
--
-- Trzymany jako pojedynczy JSON w kolumnie `data`. utils.storage parsuje wynik
-- po '|' i po nowej linii, więc te znaki usuwamy z tekstu wyszukiwania —
-- struktura JSON ich nie zawiera.

-- @return { text = "<substring>", users = { [accountId] = true } }
function M.get_filter()
  ensure_tables()
  local rows = storage.select(FILTER_TABLE, FILTER_COLS, { repo_key = M.project_key() })
  local named = row_to_named(FILTER_COLS, rows[1])

  local filter = { text = "", users = {} }

  if named and named.data then
    local ok, obj = pcall(vim.json.decode, named.data)

    if ok and type(obj) == "table" then
      filter.text = type(obj.text) == "string" and obj.text or ""

      if type(obj.users) == "table" then
        for _, id in ipairs(obj.users) do
          filter.users[id] = true
        end
      end
    end
  end

  return filter
end

function M.save_filter(filter)
  ensure_tables()

  local ids = {}

  for id, on in pairs(filter.users or {}) do
    if on then
      table.insert(ids, id)
    end
  end

  local text = (filter.text or ""):gsub("[|\r\n]", " ")
  local data = vim.json.encode({ text = text, users = ids })

  storage.insert_or_replace(FILTER_TABLE, {
    repo_key = nz(M.project_key()),
    data = nz(data),
  })
end

return M
