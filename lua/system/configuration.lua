-- file: lua/system/configuration.lua
-- Funkcje zarządzania konfiguracją Neovim

local M = {}

-- Przeładowuje całą konfigurację Neovim
function M.reload_config()
  -- Wyczyść cache wszystkich modułów Lua (oprócz lazy)
  for name, _ in pairs(package.loaded) do
    if name:match("^config%.") or 
       name:match("^utils%.") or 
       name:match("^system%.") or
       name:match("^plugins%.") then
      package.loaded[name] = nil
    end
  end
  
  -- Przeładuj init.lua
  vim.cmd("source ~/.config/nvim/init.lua")
  vim.notify("Configuration reloaded! (modules cleared from cache)", vim.log.levels.INFO)
end

return M
