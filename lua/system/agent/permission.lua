-- Prośby agenta o ZGODĘ na użycie narzędzia spoza allowlisty ORAZ pytania, które
-- model zadaje użytkownikowi (AskUserQuestion) — oba idą tym samym kanałem.
--
-- Dotąd `claude` dostawał sztywne --allowedTools i wszystko poza listą (Bash,
-- WebFetch, narzędzia MCP) było po cichu odrzucane — model nie miał jak zapytać.
-- Teraz CLI dostaje --permission-prompt-tool wskazujący na narzędzie MCP
-- `permission_request` (patrz mcp/server.js), które odbija pytanie tutaj i czeka
-- na decyzję użytkownika.
--
-- Protokół jest ODPYTYWANY, nie blokujący: serwer MCP woła `ask` (dostaje id i
-- wraca natychmiast), a potem cyklicznie `poll` aż do decyzji. Gdyby `ask`
-- blokowało do czasu odpowiedzi, pętla zdarzeń nvima stałaby w miejscu i user
-- nie mógłby nacisnąć żadnego klawisza — czyli nie dałoby się odpowiedzieć.
--
-- Decyzja wraca do CLI jako JSON w formacie, którego oczekuje permission-prompt:
--   { "behavior": "allow", "updatedInput": {...} }
--   { "behavior": "deny",  "message": "..." }
--
-- PYTANIA MODELU. W trybie -p CLI nie ma jak zapytać użytkownika, więc wywołanie
-- AskUserQuestion też przepuszcza przez to narzędzie — z całą treścią pytania i
-- opcjami w `input.questions`. Renderujemy więc PRAWDZIWE pytanie modelu (nie
-- „zgodę na AskUserQuestion"), a wybór odsyłamy w polu `message` odmowy: to
-- jedyny kanał wracający do modelu w TEJ SAMEJ turze. Zgoda ("allow") nic by nie
-- dała — CLI wykonałoby wtedy tool sam i odpowiedziało modelowi „The user did
-- not answer the questions.".

local M = {}

-- id -> { tool, input, decision (string JSON albo nil), rendered (bool) }
local pending = {}
local seq = 0

-- Narzędzia, na które user zgodził się "na całą sesję" (czyszczone przy resecie).
local always = {}

---------------------------------------------------------------------------
-- Pomocnicze
---------------------------------------------------------------------------

-- Krótki, czytelny opis TEGO konkretnego wywołania — user musi wiedzieć, na co
-- się zgadza: nie "Bash", tylko "Bash: rm -rf build".
local function summarize(tool, input)
  input = type(input) == "table" and input or {}

  local detail = input.command
    or input.file_path
    or input.path
    or input.url
    or input.pattern

  if type(detail) ~= "string" or detail == "" then
    return tool
  end

  detail = detail:gsub("%s+", " ")

  if #detail > 160 then
    detail = detail:sub(1, 157) .. "..."
  end

  return tool .. ": " .. detail
end

local function allow_json(input)
  -- updatedInput musi być OBIEKTEM JSON, nie tablicą — pusta tabela Lua
  -- zakodowałaby się jako `[]` i CLI odrzuciłoby odpowiedź.
  local payload = input

  if type(payload) ~= "table" or vim.tbl_isempty(payload) then
    payload = vim.empty_dict()
  end

  return vim.json.encode({ behavior = "allow", updatedInput = payload })
end

local function deny_json(message)
  return vim.json.encode({ behavior = "deny", message = message })
end

-- Odpowiedź użytkownika na pytanie modelu. Formalnie „deny" (patrz nagłówek
-- pliku), ale `message` trafia do modelu jako wynik wywołania AskUserQuestion.
local function answer_json(text)
  return deny_json(text)
end

-- Czy payload AskUserQuestion niesie cokolwiek, co da się pokazać?
local function has_questions(input)
  if type(input) ~= "table" or type(input.questions) ~= "table" then
    return false
  end

  for _, q in ipairs(input.questions) do
    if type(q) == "table" and type(q.options) == "table" and #q.options > 0 then
      return true
    end
  end

  return false
end

---------------------------------------------------------------------------
-- Render pytania w panelu czatu
---------------------------------------------------------------------------

-- Pytanie MODELU: pokazujemy jego własne pytania i opcje, a wybór odsyłamy jako
-- wynik wywołania. Rdzeń dostaje znacznik, żeby po turze nie zadać go drugi raz
-- (provider widzi to samo wywołanie jako zdarzenie `question`).
local function render_question(id)
  local entry = pending[id]
  local agent = require("system.agent")

  local shown = agent.ask_question(entry.input.questions, function(text)
    entry.decision = answer_json(text .. "\n\nKontynuuj zadanie w oparciu o tę odpowiedź.")
  end, function()
    entry.decision = answer_json(
      "Użytkownik zamknął pytanie bez odpowiedzi. Nie zgaduj za niego — napisz krótko, na co czekasz."
    )
  end)

  if shown then
    agent.mark_question_handled()
  end

  entry.rendered = shown and true or false
end

local function render(id)
  local entry = pending[id]

  if not entry or entry.decision then return end

  if entry.tool == "AskUserQuestion" then
    render_question(id)

    return
  end

  local agent = require("system.agent")

  local questions = { {
    header = "Zgoda",
    question = ("Agent prosi o zgodę na:\n%s"):format(summarize(entry.tool, entry.input)),
    options = {
      { label = "Pozwól raz", description = "Jednorazowo, tylko to wywołanie.", value = "allow" },
      {
        label = "Pozwól zawsze (ta sesja)",
        description = ("Nie pytaj więcej o %s do czasu resetu rozmowy."):format(entry.tool),
        value = "always",
      },
      { label = "Odrzuć", description = "Agent dostanie odmowę i pójdzie inną drogą.", value = "deny" },
    },
  } }

  local shown = agent.ask_question(questions, function(_, answers)
    local choice = ((answers or {})[1] or {}).options
    local value = ((choice or {})[1] or {}).value or "deny"

    if value == "always" then
      always[entry.tool] = true
    end

    entry.decision = (value == "deny")
      and deny_json("Użytkownik nie zgodził się na użycie " .. entry.tool)
      or allow_json(entry.input)
  end, function()
    -- Esc / q — brak zgody jest bezpieczniejszym domyślnym.
    entry.decision = deny_json("Użytkownik anulował prośbę o zgodę")
  end)

  -- Gdy UI jest zajęte innym pytaniem, zostawiamy `rendered = false`; kolejny
  -- `poll` spróbuje ponownie, aż blok pytania się zwolni.
  entry.rendered = shown and true or false
end

---------------------------------------------------------------------------
-- Wejścia wołane zdalnie przez serwer MCP
---------------------------------------------------------------------------

-- payload (JSON): { tool_name, input }. Zwraca id prośby albo "error: ...".
function M.ask(payload_json)
  local ok, payload = pcall(vim.json.decode, payload_json)

  if not ok or type(payload) ~= "table" then
    return "error: nieczytelny payload prośby o zgodę"
  end

  local tool = payload.tool_name

  if type(tool) ~= "string" or tool == "" then
    return "error: brak tool_name"
  end

  seq = seq + 1

  local id = tostring(seq)
  local entry = { tool = tool, input = payload.input, rendered = false }
  pending[id] = entry

  if tool == "AskUserQuestion" then
    -- Pytania nigdy nie idą na skróty przez `always` — zawsze pyta użytkownika.
    if not has_questions(entry.input) then
      entry.decision = answer_json(
        "Wywołanie AskUserQuestion nie zawierało pytań z opcjami — zadaj pytanie zwykłym tekstem."
      )

      return id
    end

  -- Zgoda "na zawsze" z wcześniejszego pytania — nie zawracamy userowi głowy.
  elseif always[tool] then
    entry.decision = allow_json(entry.input)

    return id
  end

  render(id)

  return id
end

-- Zwraca "pending" albo gotowy JSON decyzji (i sprząta wpis).
function M.poll(id)
  local entry = pending[id]

  if not entry then
    return deny_json("Prośba o zgodę wygasła")
  end

  if entry.decision then
    pending[id] = nil

    return entry.decision
  end

  if not entry.rendered then
    render(id)
  end

  return "pending"
end

function M.cancel(id)
  pending[id] = nil

  return "ok"
end

-- Reset stanu przy czyszczeniu rozmowy — zgody nie przechodzą na nową sesję.
function M.reset()
  pending = {}
  always = {}
end

return M
