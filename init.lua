require("system.lazy")

require("config.clipboard")
require("config.editor")
require("config.keymap")
require("config.spaces")


require("system.themes")

require("utils.editing").setup()
require("system.session").setup()
require("utils.generator").setup()
require("system.debugging").setup()
require("utils.navigation").setup()
require("utils.buffer_history").setup()

-- Setup LLM with provider and API key from .env
-- Choose your provider:
-- - require("utils.llm.providers.claude") - Uses Claude API (requires ANTHROPIC_API_KEY)
-- - require("utils.llm.providers.claude_plan") - Uses your Claude Code plan (no API key needed)
require("utils.llm").setup({
  model = require("utils.llm.providers.claude_plan"), -- Using plan to save API tokens
  -- api_key will be automatically loaded from .env file (only for claude API provider)
})

-- Copilot disabled - moved to deprecated/copilot.lua

-- Create command to view errors in :messages
-- Errors from code review and other operations are logged here without popups
vim.api.nvim_create_user_command("Errors", function()
  vim.cmd("messages")
end, { desc = "Show all errors and messages (including code review errors)" })

