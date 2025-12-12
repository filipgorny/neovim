-- file: lua/system/configuration.lua
-- Funkcje zarządzania konfiguracją Neovim

local M = {}

-- Przeładowuje całą konfigurację Neovim
function M.reload_config()
  vim.cmd("source ~/.config/nvim/init.lua")
  vim.notify("Configuration reloaded!", vim.log.levels.INFO)
end

return M
