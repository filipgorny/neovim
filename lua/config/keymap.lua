-- map leader to <Space>
vim.keymap.set("n", " ", "<Space>", { silent = true, remap = false })
vim.g.mapleader = " "

local file = require("utils.file")
local editing = require("utils.editing")
local keymap = require("utils.keymap")
local llm = require("utils.llm")
local git = require("utils.git")
local generator = require("utils.generator")
local navigation = require("utils.navigation")
local configuration = require("system.configuration")

keymap.bind_for_all("<C-s>", function()
  -- Format only modified lines (synchronously), then save
  editing.format_modifications()
  file.save_file()
end)

-- Reload configuration
keymap.bind("n", "<leader>c", configuration.reload_config)

keymap.bind("n", "<S-q>", function()
  local bufnr = vim.api.nvim_get_current_buf()
  if vim.api.nvim_buf_is_valid(bufnr) then
    -- Try to save the buffer first if it has unsaved changes
    if vim.api.nvim_buf_get_option(bufnr, 'modified') then
      local bufname = vim.api.nvim_buf_get_name(bufnr)
      -- Only try to save if it's a real file (not a special buffer like DAP UI)
      if bufname ~= "" and not bufname:match("^%[") then
        pcall(vim.cmd, 'write')
      end
    end
    -- Now delete the buffer (force=true to handle DAP buffers and other special cases)
    vim.api.nvim_buf_delete(bufnr, { force = true })
  end
end)

-- Restart Neovim
keymap.bind("n", "<leader>rr", function()
  vim.cmd("wa") -- Save all buffers
  vim.cmd("source $MYVIMRC") -- Reload config
  vim.notify("Neovim config reloaded!", vim.log.levels.INFO)
end)

keymap.bind_for_all("<C-a>", editing.select_all)

-- Copy with Ctrl+C in visual mode
vim.keymap.set("v", "<C-c>", '"+y', { noremap = true, silent = true })

-- Git change navigation
vim.keymap.set("n", "<S-]>", git.next_hunk, { noremap = true, silent = true, desc = "Next git change" })
vim.keymap.set("n", "<S-[>", git.prev_hunk, { noremap = true, silent = true, desc = "Previous git change" })

-- Git branch switching with session management
keymap.bind("n", "<leader>gb", git.switch_branch) -- Switch git branch with auto-save/stash/session

-- Git conflict resolution
keymap.bind("n", "<leader>gm", git.resolve_conflicts) -- Resolve merge conflicts

-- Edit history navigation (jump between edit locations across files)
vim.keymap.set("n", "<M-h>", navigation.go_back, { noremap = true, silent = true, desc = "Go to previous edit location" })
vim.keymap.set("n", "<M-l>", navigation.go_forward, { noremap = true, silent = true, desc = "Go to next edit location" })
vim.keymap.set("n", "<leader>nh", navigation.show_history, { noremap = true, silent = true, desc = "Show edit history" })
vim.keymap.set("n", "<leader>nc", navigation.clear_history, { noremap = true, silent = true, desc = "Clear edit history" })

-- LLM/AI keybindings
keymap.bind("n", "<leader>ar", llm.review_diff)        -- Review all git changes
keymap.bind("n", "<leader>af", llm.review_file)        -- Review current file changes
keymap.bind("n", "<leader>ac", llm.analyze_file)       -- Analyze current file (bugs, quality, etc)
keymap.bind("v", "<leader>aa", llm.ask_about_selection) -- Ask about selected code
keymap.bind("n", "<leader>ai", llm.open_chat)          -- Open interactive chat with Claude
keymap.bind("n", "<leader>ap", llm.apply_chat_changes) -- Apply code changes from chat
keymap.bind("n", "<leader>ax", llm.clear_chat)         -- Clear chat history

-- Code generators
keymap.bind("n", "<leader>gr", function() generator.run("react-component") end) -- Generate React component

-- Debugging keybindings (using function keys)
local dap = require("dap")
local dapui = require("dapui")

keymap.bind("n", "<F5>", dap.continue)                           -- Start/Continue debugging
keymap.bind("n", "<F6>", dap.terminate)                          -- Terminate debug session
keymap.bind("n", "<F7>", dap.step_into)                          -- Step into
keymap.bind("n", "<F8>", dap.step_over)                          -- Step over
keymap.bind("n", "<F9>", dap.toggle_breakpoint)                  -- Toggle breakpoint
keymap.bind("n", "<F10>", dap.step_out)                          -- Step out

-- Additional debugging keybindings with leader
keymap.bind("n", "<leader>db", dap.toggle_breakpoint)            -- Toggle breakpoint
keymap.bind("n", "<leader>dB", function()                        -- Set conditional breakpoint
  dap.set_breakpoint(vim.fn.input("Breakpoint condition: "))
end)
keymap.bind("n", "<leader>dr", dap.repl.toggle)                  -- Toggle REPL
keymap.bind("n", "<leader>dl", dap.run_last)                     -- Run last debug configuration
keymap.bind("n", "<leader>du", dapui.toggle)                     -- Toggle debug UI
keymap.bind("n", "<leader>dh", require("dap.ui.widgets").hover)  -- Hover variable value
keymap.bind("n", "<leader>dp", require("dap.ui.widgets").preview) -- Preview variable


