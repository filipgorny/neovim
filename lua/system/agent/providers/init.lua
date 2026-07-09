-- Rejestr providerów agenta.
--
-- Provider abstrahuje konkretne CLI. Dwa tryby pracy:
--   mode = "stream"  — jeden trwały proces, wiadomości po stdin (np. claude).
--   mode = "oneshot" — proces na każdą wiadomość, kontekst przez id sesji
--                      przekazywane do kolejnego uruchomienia (np. opencode).
--
-- Interfejs (opcjonalne poza name):
--   name, label, icon, mode
--   config                              -- domyślna konfiguracja providera
--   command(config, opts) -> string[]   -- argv; opts.message/opts.session dla oneshot
--   encode(text) -> string              -- (stream) payload wiadomości na stdin
--   new_decoder() -> fun(data)->Event[] -- dekoder chunków stdout na zdarzenia
--   interrupt_payload(id) -> string     -- (stream) payload przerwania tury
--   models(config) -> string[]          -- lista modeli do pickera

local M = {}

M.registry = {
  claude = "system.agent.providers.claude",
  opencode = "system.agent.providers.opencode",
}

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
