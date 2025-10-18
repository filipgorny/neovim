-- map leader to <Space>
vim.keymap.set("n", " ", "<Space>", { silent = true, remap = false })
vim.g.mapleader = " "

local file = require("utils.file")
local editing = require("utils.editing")
local keymap = require("utils.keymap")
local llm = require("utils.llm")
local git = require("utils.git")

keymap.bind_for_all("<C-s>", function()
  file.save_file()
  editing.format_added()
  editing.format_modifications()
end)

keymap.bind("n", "<S-q>", function()
  vim.api.nvim_buf_delete(0, { force = false })
end)

keymap.bind_for_all("<C-a>", editing.select_all)

-- Copy with Ctrl+C in visual mode
vim.keymap.set("v", "<C-c>", '"+y', { noremap = true, silent = true })

-- Git change navigation
vim.keymap.set("n", "<S-]>", git.next_hunk, { noremap = true, silent = true, desc = "Next git change" })
vim.keymap.set("n", "<S-[>", git.prev_hunk, { noremap = true, silent = true, desc = "Previous git change" })

-- Git branch switching with session management
keymap.bind("n", "<leader>gb", git.switch_branch) -- Switch git branch with auto-save/stash/session

-- LLM/AI keybindings
keymap.bind("n", "<leader>ar", llm.review_diff)        -- Review all git changes
keymap.bind("n", "<leader>af", llm.review_file)        -- Review current file changes
keymap.bind("n", "<leader>ac", llm.analyze_file)       -- Analyze current file (bugs, quality, etc)
keymap.bind("v", "<leader>aa", llm.ask_about_selection) -- Ask about selected code
keymap.bind("n", "<leader>ai", llm.open_chat)          -- Open interactive chat with Claude
keymap.bind("n", "<leader>ap", llm.apply_chat_changes) -- Apply code changes from chat
keymap.bind("n", "<leader>ax", llm.clear_chat)         -- Clear chat history


