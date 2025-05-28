-- map leader to <Space>
vim.keymap.set("n", " ", "<Space>", { silent = true, remap = false })
vim.g.mapleader = " "

local file = require("utils.file")

vim.keymap.set("i", "<C-S>", function()
    file.save_file()
end)
vim.keymap.set("v", "<C-S>", function()
    file.save_file()
end)
vim.keymap.set("n", "<C-S>", function()
    file.save_file()
end)

local editing = require("utils.editing")

vim.keymap.set("n", "<C-a>", function()
    editing.select_all()
end)

-- open neotree
vim.keymap.set("n", "<leader>e", "<Cmd>Neotree reveal<CR>")
