-- Asynchroniczny klient REST Jira Cloud.
--
-- Wszystkie wywołania idą przez `curl` uruchamiany w `vim.fn.jobstart`
-- (ten sam wzorzec co utils.llm.providers.ollama), więc UI nigdy nie blokuje.
-- Auth: Basic (email:api_token) — curl przez `-u`, bez ręcznego base64.
--
-- Callbacki mają sygnaturę function(data, err): dokładnie jedno jest nie-nil.
-- Callback jest zawsze wołany w vim.schedule (bezpieczny dostęp do API nvim).

local config = require("system.jira.config")

local M = {}

local API3 = "/rest/api/3"
local AGILE = "/rest/agile/1.0"

-- Dekoduje JSON zamieniając null -> nil (luanil). KLUCZOWE: vim.fn.json_decode
-- zwraca dla null userdata vim.NIL (truthy!), przez co pola typu assignee=null
-- wybuchają przy indeksowaniu. vim.json.decode z luanil daje prawdziwe nil.
local function decode_json(str)
  return pcall(vim.json.decode, str, { luanil = { object = true, array = true } })
end

-- ---------------------------------------------------------------------------
-- Rdzeń: pojedyncze żądanie HTTP
-- ---------------------------------------------------------------------------

-- @param method  "GET" | "POST" | "PUT"
-- @param path    ścieżka od base_url (np. "/rest/api/3/issue/FOO-1")
-- @param body    table|nil — zostanie zserializowane do JSON
-- @param callback function(decoded_json|true, err)
function M.request(method, path, body, callback)
  local creds = config.credentials()

  if not creds then
    vim.schedule(function()
      callback(nil, "Brak poświadczeń Jira (JIRA_URL / JIRA_EMAIL / JIRA_API_TOKEN)")
    end)
    return
  end

  local url = creds.base_url .. path

  local cmd = {
    "curl", "-s", "-S",
    "-w", "\n%{http_code}",
    "-X", method,
    "-u", creds.email .. ":" .. creds.api_token,
    "-H", "Accept: application/json",
  }

  if body ~= nil then
    table.insert(cmd, "-H")
    table.insert(cmd, "Content-Type: application/json")
    table.insert(cmd, "-d")
    table.insert(cmd, vim.fn.json_encode(body))
  end

  table.insert(cmd, url)

  local stdout_chunks = {}
  local stderr_chunks = {}

  vim.fn.jobstart(cmd, {
    stdout_buffered = true,
    stderr_buffered = true,
    on_stdout = function(_, data)
      if data then
        vim.list_extend(stdout_chunks, data)
      end
    end,
    on_stderr = function(_, data)
      if data then
        vim.list_extend(stderr_chunks, data)
      end
    end,
    on_exit = function(_, code)
      vim.schedule(function()
        if code ~= 0 then
          local err = vim.trim(table.concat(stderr_chunks, "\n"))
          callback(nil, "curl exited " .. code .. (err ~= "" and (": " .. err) or ""))
          return
        end

        local raw = table.concat(stdout_chunks, "\n")
        -- Ostatnia linia to kod HTTP (dopisany przez -w).
        local status_code = raw:match("(%d%d%d)%s*$") or "000"
        local payload = raw:gsub("%s*%d%d%d%s*$", "")
        status_code = tonumber(status_code)

        if status_code >= 400 then
          local msg = payload
          local ok, decoded = decode_json(payload)

          if ok and type(decoded) == "table" then
            if decoded.errorMessages and #decoded.errorMessages > 0 then
              msg = table.concat(decoded.errorMessages, "; ")
            elseif decoded.errors and next(decoded.errors) then
              local parts = {}
              for k, v in pairs(decoded.errors) do
                table.insert(parts, k .. ": " .. tostring(v))
              end
              msg = table.concat(parts, "; ")
            end
          end

          callback(nil, "HTTP " .. status_code .. " — " .. msg)
          return
        end

        -- 204 No Content / puste ciało (np. udany transition).
        if payload == nil or vim.trim(payload) == "" then
          callback(true, nil)
          return
        end

        local ok, decoded = decode_json(payload)
        if not ok then
          callback(nil, "Nie udało się sparsować odpowiedzi JSON")
          return
        end

        callback(decoded, nil)
      end)
    end,
  })
end

local function get(path, cb) M.request("GET", path, nil, cb) end
local function post(path, body, cb) M.request("POST", path, body, cb) end

-- Buduje querystring z tabeli { k = v }.
local function qs(params)
  local parts = {}
  for k, v in pairs(params) do
    table.insert(parts, k .. "=" .. vim.fn.escape(tostring(v), " &?"):gsub(" ", "%%20"))
  end
  return #parts > 0 and ("?" .. table.concat(parts, "&")) or ""
end

-- ---------------------------------------------------------------------------
-- Boardy / sprinty (Agile API)
-- ---------------------------------------------------------------------------

-- Lista boardów (scrum/kanban) — do pickera przy pierwszym uruchomieniu.
function M.list_boards(callback)
  get(AGILE .. "/board" .. qs({ maxResults = 50 }), function(data, err)
    if err then
      return callback(nil, err)
    end

    callback(data.values or {}, nil)
  end)
end

-- Konfiguracja boardu — mapowanie statusów na kolumny (kolejność kolumn!).
function M.board_config(board_id, callback)
  get(AGILE .. "/board/" .. board_id .. "/configuration", callback)
end

-- Aktywny sprint boardu (pierwszy w stanie active), albo nil.
function M.active_sprint(board_id, callback)
  get(AGILE .. "/board/" .. board_id .. "/sprint" .. qs({ state = "active" }), function(data, err)
    if err then
      return callback(nil, err)
    end

    local sprints = data.values or {}
    callback(sprints[1], nil)
  end)
end

local ISSUE_FIELDS = "summary,status,assignee,priority,issuetype,parent,labels,updated"

-- Pole Story Points jest customfieldem o instancyjnym id. Rozwiązujemy je raz
-- (po nazwie) i cache'ujemy. sp_field_cache: nil=nierozwiązane, false=brak, string=id.
local sp_field_cache = nil

function M.story_points_field(callback)
  if sp_field_cache ~= nil then
    return callback(sp_field_cache or nil)
  end

  get(API3 .. "/field", function(fields, err)
    if err or type(fields) ~= "table" then
      sp_field_cache = false
      return callback(nil)
    end

    for _, fld in ipairs(fields) do
      local nm = (fld.name or ""):lower()

      if nm == "story points" or nm == "story point estimate" then
        sp_field_cache = fld.id
        return callback(fld.id)
      end
    end

    sp_field_cache = false
    callback(nil)
  end)
end

-- Buduje listę pól rozszerzoną o Story Points (jeśli instancja je ma).
local function fields_with_sp(callback)
  M.story_points_field(function(sp)
    callback(sp and (ISSUE_FIELDS .. "," .. sp) or ISSUE_FIELDS)
  end)
end

-- Zadania z aktywnego sprintu boardu.
function M.sprint_issues(board_id, sprint_id, callback)
  fields_with_sp(function(fields)
    local path = AGILE .. "/board/" .. board_id .. "/sprint/" .. sprint_id .. "/issue"
      .. qs({ maxResults = 100, fields = fields })
    get(path, function(data, err)
      if err then
        return callback(nil, err)
      end

      callback(data.issues or {}, nil)
    end)
  end)
end

-- Backlog boardu (zadania spoza sprintu).
function M.backlog_issues(board_id, callback)
  fields_with_sp(function(fields)
    local path = AGILE .. "/board/" .. board_id .. "/backlog"
      .. qs({ maxResults = 100, fields = fields })
    get(path, function(data, err)
      if err then
        return callback(nil, err)
      end

      callback(data.issues or {}, nil)
    end)
  end)
end

-- Przenosi zadania do sprintu (Agile API).
function M.move_to_sprint(sprint_id, issue_keys, callback)
  post(AGILE .. "/sprint/" .. sprint_id .. "/issue", { issues = issue_keys }, callback)
end

-- ---------------------------------------------------------------------------
-- Zadania (API v3)
-- ---------------------------------------------------------------------------

-- Pełny szczegół zadania z wyrenderowanymi polami (opis jako HTML/tekst).
function M.issue(key, callback)
  local path = API3 .. "/issue/" .. key .. qs({ expand = "renderedFields" })
  get(path, callback)
end

function M.comments(key, callback)
  get(API3 .. "/issue/" .. key .. "/comment" .. qs({ expand = "renderedBody" }), function(data, err)
    if err then
      return callback(nil, err)
    end

    callback(data.comments or {}, nil)
  end)
end

-- Dodaje komentarz. Jira Cloud v3 wymaga ADF — pakujemy zwykły tekst.
function M.add_comment(key, text, callback)
  local adf = {
    type = "doc",
    version = 1,
    content = {},
  }

  for _, line in ipairs(vim.split(text, "\n", { plain = true })) do
    local paragraph = { type = "paragraph", content = {} }

    if line ~= "" then
      paragraph.content = { { type = "text", text = line } }
    end

    table.insert(adf.content, paragraph)
  end

  post(API3 .. "/issue/" .. key .. "/comment", { body = adf }, callback)
end

-- Dostępne przejścia statusu dla zadania.
function M.transitions(key, callback)
  get(API3 .. "/issue/" .. key .. "/transitions", function(data, err)
    if err then
      return callback(nil, err)
    end

    callback(data.transitions or {}, nil)
  end)
end

-- Wykonuje przejście (zmiana statusu).
function M.transition(key, transition_id, callback)
  post(API3 .. "/issue/" .. key .. "/transitions", {
    transition = { id = tostring(transition_id) },
  }, callback)
end

-- Znajduje przejście prowadzące do docelowej nazwy statusu (case-insensitive).
function M.find_transition_to(key, target_status_name, callback)
  M.transitions(key, function(transitions, err)
    if err then
      return callback(nil, err)
    end

    local want = target_status_name:lower()
    for _, t in ipairs(transitions) do
      if t.to and t.to.name and t.to.name:lower() == want then
        return callback(t, nil)
      end
    end

    callback(nil, nil) -- brak dozwolonego przejścia
  end)
end

return M
