-- Skill "history": pozwala agentowi doczytywać wcześniejsze wiadomości tej
-- rozmowy (per projekt) wstecz, tak głęboko jak chce.
--
-- Cała historia jest zapisywana do SQLite przez system.agent.history (klucz =
-- URL gita albo katalog). Ten skill podaje agentowi ścieżkę bazy i klucz
-- projektu w zmiennych środowiskowych oraz instrukcję, jak odpytać bazę
-- narzędziem Bash (`sqlite3`).

local history = require("system.agent.history")

local M = {
  name = "history",
  description = "Dostęp agenta do historii rozmowy zapisanej w SQLite (czytanie wstecz)",
  tools = { "Bash" },
}

function M.env(_)
  return {
    AGENT_HISTORY_DB = history.path(),
    AGENT_HISTORY_PROJECT = history.project_key(),
  }
end

function M.system_prompt(_)
  return [[## Skill: Conversation history (persistent memory)

Every message in this conversation is persisted to a SQLite database, keyed by
project (git origin URL, or working directory if the project has no git remote).
You can read PAST messages of THIS project's conversation as far back as you want.

Environment:
- $AGENT_HISTORY_DB       — path to the SQLite database file
- $AGENT_HISTORY_PROJECT  — this project's key (use it to filter rows)

Schema: table `messages(id INTEGER, project TEXT, ts INTEGER, role TEXT, content TEXT)`
where role is 'user' or 'assistant', ts is a Unix timestamp, id increases over time.

Read history with the Bash tool, e.g. the 20 most recent messages before now:
  sqlite3 "$AGENT_HISTORY_DB" \
    "SELECT datetime(ts,'unixepoch','localtime'), role, content
     FROM messages WHERE project = '$AGENT_HISTORY_PROJECT'
     ORDER BY id DESC LIMIT 20;"

Read further back by raising LIMIT or paging with an id cursor:
  ... WHERE project = '$AGENT_HISTORY_PROJECT' AND id < <oldest_id_you_saw> ORDER BY id DESC LIMIT 20;

Search past messages for a keyword:
  ... WHERE project = '$AGENT_HISTORY_PROJECT' AND content LIKE '%<keyword>%' ORDER BY id DESC LIMIT 20;

Use this when the user references something from earlier that isn't in your current
context ("jak wcześniej", "to co robiliśmy", "wróć do…"). Read only as much as you
need. The most recent rows may duplicate what's already in your context — that's fine.]]
end

return M
