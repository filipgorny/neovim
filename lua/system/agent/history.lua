-- Trwała historia czatu w SQLite (przez CLI `sqlite3`, bez zależności).
--
-- Klucz projektu = URL origin gita, a jeśli repo nie ma origin/nie jest repo,
-- to katalog roboczy. Ten sam klucz jest podawany agentowi przez skill
-- "history", żeby mógł doczytywać wcześniejsze wiadomości wstecz.
--
-- Schemat: messages(id, project, ts, role, content).

local M = {}

local function db_path()
  local dir = vim.fn.stdpath("data") .. "/agent"
  vim.fn.mkdir(dir, "p")
  return dir .. "/history.sqlite"
end

M.path = db_path

-- Klucz identyfikujący projekt (URL gita albo katalog).
function M.project_key()
  local cwd = vim.fn.getcwd()
  local url = vim.fn.systemlist({ "git", "-C", cwd, "remote", "get-url", "origin" })[1]

  if vim.v.shell_error == 0 and url and url ~= "" then
    return vim.trim(url)
  end

  return cwd
end

local function esc(s)
  return (tostring(s or ""):gsub("'", "''"))
end

local SCHEMA = "CREATE TABLE IF NOT EXISTS messages("
  .. "id INTEGER PRIMARY KEY AUTOINCREMENT, project TEXT, ts INTEGER, role TEXT, content TEXT);"
  .. "CREATE INDEX IF NOT EXISTS idx_messages_project ON messages(project, id);"

local schema_ready = false

local function run_sql(sql)
  local out = vim.fn.system({ "sqlite3", db_path() }, sql)

  if vim.v.shell_error ~= 0 then
    return nil, out
  end

  return out
end

-- Dopisz wiadomość do historii bieżącego projektu (nieblokująco po stronie UX).
function M.append(role, content)
  if not schema_ready then
    run_sql(SCHEMA)
    schema_ready = true
  end

  local sql = ("INSERT INTO messages(project,ts,role,content) VALUES('%s',%d,'%s','%s');")
    :format(esc(M.project_key()), os.time(), esc(role), esc(content))

  run_sql(sql)
end

-- Odczyt ostatnich `n` wiadomości projektu (najstarsze→najnowsze) — do UI/testów.
function M.recent(n)
  local sql = ("SELECT role || ': ' || substr(content,1,200) FROM (SELECT * FROM messages WHERE project='%s' ORDER BY id DESC LIMIT %d) ORDER BY id ASC;")
    :format(esc(M.project_key()), n or 20)
  local out = run_sql(sql)

  return out and vim.split(vim.trim(out), "\n", { plain = true }) or {}
end

return M
