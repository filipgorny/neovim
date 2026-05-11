-- map leader to <Space>
vim.keymap.set("n", " ", "<Space>", { silent = true, remap = false })
vim.g.mapleader = " "

local file = require("utils.file")
local editing = require("utils.editing")
local keymap = require("utils.keymap")
local llm = require("utils.llm")
local assist = require("utils.assist")
local git = require("utils.git")
local generator = require("utils.generator")
local navigation = require("utils.navigation")
local configuration = require("system.configuration")
local buffer_history = require("utils.buffer_history")
local file_browsing = require("utils.file_browsing")

keymap.bind_for_all("<C-s>", function()
  -- Format only modified lines (synchronously), then save
  editing.format_modifications()
  file.save_file()
end)

-- Reload configuration
keymap.bind("n", "<leader>rc", configuration.reload_config)

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

-- Restart Neovim (save state to SQLite, quit, process respawns)
keymap.bind("n", "<leader>rr", require("utils.process").restart_nvim)

keymap.bind_for_all("<C-a>", editing.select_all)

-- Copy with Ctrl+C in visual mode
vim.keymap.set("v", "<C-c>", '"+y', { noremap = true, silent = true })

-- Git change navigation
vim.keymap.set("n", "<S-]>", git.next_hunk, { noremap = true, silent = true, desc = "Next git change" })
vim.keymap.set("n", "<S-[>", git.prev_hunk, { noremap = true, silent = true, desc = "Previous git change" })

-- Git branch switching with session management
keymap.bind("n", "<leader>gb", git.switch_branch) -- Switch git branch with auto-save/stash/session

-- Git diff overview (file list + editable buffer)
keymap.bind("n", "<leader>gd", git.review_changes) -- Git diff overview

-- Git conflict resolution
keymap.bind("n", "<leader>gm", git.resolve_conflicts) -- Resolve merge conflicts
keymap.bind("n", "<leader>gc", git.resolve_conflicts) -- Git conflicts picker

-- Edit history navigation (jump between edit locations across files)
vim.keymap.set("n", "<C-j>", navigation.go_back, { noremap = true, silent = true, desc = "Go to previous edit location" })
vim.keymap.set("n", "<C-k>", navigation.go_forward, { noremap = true, silent = true, desc = "Go to next edit location" })
vim.keymap.set("n", "<leader>nh", navigation.show_history, { noremap = true, silent = true, desc = "Show edit history" })
vim.keymap.set("n", "<leader>nc", navigation.clear_history, { noremap = true, silent = true, desc = "Clear edit history" })

-- Terry assistant
vim.keymap.set("n", "<leader>ta", function() require("terry").toggle() end, { noremap = true, silent = true, desc = "Toggle Terry assistant" })

-- Code generators
keymap.bind("n", "<leader>gr", function() generator.run("react-component") end) -- Generate React component

-- Scripts menu (~/.config/nvim/scripts/)
keymap.bind("n", "<leader>x", require("utils.scripts").pick)

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

-- File browsing
keymap.bind("n", "<leader>l", file_browsing.find_files_by_mtime) -- Find files by modification time

-- Buffers navigation (Alt+k = left tab, Alt+j = right tab)
keymap.bind("n", "<M-k>", "<cmd>BufferLineCyclePrev<CR>")
keymap.bind("n", "<M-j>", "<cmd>BufferLineCycleNext<CR>")

-- Telescope buffer list sorted by edit time (main buffer picker)
keymap.bind("n", "<leader>b", function()
  require("utils.telescope_buffers").buffers_by_edit_time()
end)

-- Show buffer history for debugging
keymap.bind("n", "<leader>bh", buffer_history.show_history)

-- Change/substitute without yanking (only y and d yank to register)
for _, mode in ipairs({ "n", "v" }) do
  for _, key in ipairs({ "c", "C", "x", "s", "S" }) do
    vim.keymap.set(mode, key, '"_' .. key, { noremap = true, silent = true })
  end
end
-- Backspace in visual mode deletes selection without yanking
vim.keymap.set("v", "<BS>", '"_d', { noremap = true, silent = true })

-- Exit editor
keymap.bind("n", "<C-M-q>", ":exit <CR>");
