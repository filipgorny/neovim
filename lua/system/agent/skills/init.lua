-- Rejestr skilli agenta.
--
-- Skill to moduł, który rozszerza możliwości agenta. Interfejs (wszystko
-- opcjonalne poza name):
--   name           string
--   description    string
--   tools          string[]                 -- narzędzia CLI do dopisania do --allowedTools
--   on_enable(ctx)                           -- jednorazowa inicjalizacja (ctx.server = adres RPC nvim)
--   env(ctx)       -> table<string,string>   -- zmienne środowiskowe procesu agenta
--   system_prompt(ctx) -> string             -- tekst dopisywany do system-promptu
--   mcp(ctx)       -> spec                   -- serwer MCP wnoszony przez skill:
--       { name, tools[], permission_tool? } oraz ALBO stdio (command, args, env),
--       ALBO serwer zdalny (url, type = "http"|"sse", headers)
--
-- Skille wstrzykuje się przez require("system.agent").setup{ skills = { "neovim" } }
-- (nazwa z rejestru) lub podając bezpośrednio tabelę-moduł.

local M = {}

M.registry = {
  -- editor: żywy nvim + historia + schowek jako narzędzia MCP (patrz mcp/server.js).
  -- Zastępuje trójkę poniżej, która działała przez kruche prompty bash-RPC.
  editor = "system.agent.skills.editor",
  -- figma: pliki i mockupy Figmy przez jej zdalny serwer MCP (design → kod).
  figma = "system.agent.skills.figma",
  -- Stare skille (miękki system-prompt + Bash) — zostawione dla zgodności wstecz.
  neovim = "system.agent.skills.neovim",
  history = "system.agent.skills.history",
  clipboard = "system.agent.skills.clipboard",
}

-- Zamień specyfikację (nazwa z rejestru albo gotowa tabela) na moduł skilla.
function M.resolve(spec)
  if type(spec) == "table" then
    return spec
  end

  local path = M.registry[spec]

  if not path then
    return nil
  end

  local ok, mod = pcall(require, path)

  return ok and mod or nil
end

return M
