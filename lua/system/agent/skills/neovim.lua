-- Skill "neovim": daje agentowi dostęp do konfiguracji i ŻYWEJ instancji
-- Neovima użytkownika. Agent może czytać pliki configu (są w cwd) oraz —
-- na żądanie — wykonywać Lua w działającym edytorze przez RPC, żeby
-- sprawdzić stan runtime (opcje, keymapy, załadowane pluginy, zmienne).
--
-- Mechanizm: rdzeń agenta wystawia adres serwera RPC nvim w zmiennej
-- $NVIM_AGENT_SERVER. Ten skill definiuje globalny helper _G.agent_lua(path),
-- który wczytuje plik .lua i zwraca vim.inspect() jego wyniku — agent woła go
-- przez `nvim --server "$NVIM_AGENT_SERVER" --remote-expr '...'`.

local M = {
  name = "neovim",
  description = "Dostęp do configu i żywej instancji Neovima (inspekcja + Lua na żądanie)",
  tools = { "Bash" },
}

function M.on_enable(_)
  -- Helper wołany zdalnie: wczytuje plik Lua i zwraca jego wynik jako tekst.
  -- Uruchamiany w kontekście żywego nvim, więc widzi cały stan runtime.
  function _G.agent_lua(path)
    local chunk, load_err = loadfile(path)

    if not chunk then
      return "load error: " .. tostring(load_err)
    end

    local ok, result = pcall(chunk)

    if not ok then
      return "runtime error: " .. tostring(result)
    end

    if result == nil then
      return "(brak wartości zwróconej — użyj `return ...` w pliku)"
    end

    return type(result) == "string" and result or vim.inspect(result)
  end

  -- Otwórz plik w GŁÓWNYM oknie edytora (nie w kolumnie czatu). Agent woła to,
  -- gdy user prosi o otwarcie/pokazanie pliku.
  function _G.agent_open(path)
    local ok, agent = pcall(require, "system.agent")

    if not ok then
      return "error: agent module unavailable"
    end

    local win = agent.open_file(path)

    return win and ("opened " .. path) or ("could not open " .. path)
  end
end

function M.env(ctx)
  return { NVIM_AGENT_SERVER = ctx.server }
end

function M.system_prompt(_)
  return [[## Skill: Neovim (live editor access)

You are running inside the user's LIVE Neovim editor. The current working
directory IS their Neovim config repository, so you can inspect the config
directly with Read / Grep / Glob.

IMPORTANT — opening files for the user:
When the user asks to open, show, or go to a file ("otwórz plik X", "open X",
"pokaż mi X", "wejdź do X"), they mean OPEN IT IN THIS NEOVIM, in the main
editor area — not just read it into your context. Do it immediately, without
asking them to remind you that you're in Neovim. Use the Bash tool:
  nvim --server "$NVIM_AGENT_SERVER" --remote-expr 'luaeval("_G.agent_open(\"/abs/or/rel/path\")")'
This opens the file in a real editor window (never in the chat input column).
Do NOT open files with a bare `:edit` over the RPC — that could replace the chat
input. Always use _G.agent_open for opening files the user wants to see.

When the user asks you to check their Neovim config or its runtime state, you
have two complementary tools:

1. Static config — just Read/Grep the files in the cwd (init.lua, lua/**).

2. Live runtime state — evaluate Lua inside the RUNNING Neovim instance via its
   RPC server. The address is in the environment variable $NVIM_AGENT_SERVER.
   Use the Bash tool. Two ways:

   a) Quick expression (no quoting headaches — wrap the value in vim.inspect):
      nvim --server "$NVIM_AGENT_SERVER" --remote-expr 'luaeval("vim.inspect(vim.o.tabstop)")'

   b) Multi-line / complex Lua — write it to a temp file (it must `return` the
      value you want back), then run the helper _G.agent_lua on it:
      # first Write the Lua to /tmp/agent-eval.lua, e.g.:
      #   return { ts = vim.o.tabstop, sw = vim.o.shiftwidth,
      #            keymap = vim.fn.maparg("<leader>e", "n") }
      nvim --server "$NVIM_AGENT_SERVER" --remote-expr 'luaeval("_G.agent_lua(\"/tmp/agent-eval.lua\")")'
      # prints vim.inspect(...) of the returned value

Useful live probes: vim.o / vim.bo / vim.wo (options), vim.fn.maparg(lhs, mode)
(keymaps), vim.tbl_keys(package.loaded) (loaded modules), vim.api.nvim_list_bufs(),
require("lazy").plugins() if lazy.nvim is present.

Rules:
- Prefer read-only inspection. Do NOT mutate editor state (set options, run
  commands with side effects, edit buffers) via the live RPC unless the user
  explicitly asks you to — reading config is safe, changing a running editor is not.
- Only reach for the live RPC when runtime state actually matters; for "how is X
  configured" the config files are usually enough and cleaner to cite.]]
end

return M
