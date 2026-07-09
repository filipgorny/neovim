-- Disable built-in netrw so neo-tree can handle directory arguments
-- (must be set BEFORE plugins load).
vim.g.loaded_netrw = 1
vim.g.loaded_netrwPlugin = 1

require("system.lazy")
require("system.auto_open_neotree")

require("config.clipboard")
require("config.editor")
require("config.keymap")
require("config.spaces")


require("system.themes")

require("utils.editing").setup()
require("system.session").setup()
require("utils.process").setup()
require("utils.generator").setup()
require("system.debugging").setup()
require("utils.navigation").setup()
require("system.projects").setup()
require("utils.buffer_history").setup()
require("utils.resize_cursor").setup()
require("utils.ts_paste_imports").setup()
require("system.agent").setup({
  providers = { "claude", "opencode" },
  default = "claude",
  skills = { "neovim", "history", "clipboard" },
})
require("system.jira").setup()

-- Create command to view errors in :messages
-- Errors from code review and other operations are logged here without popups
vim.api.nvim_create_user_command("Errors", function()
  vim.cmd("messages")
end, { desc = "Show all errors and messages (including code review errors)" })

