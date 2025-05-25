-- map leader to <Space>
vim.keymap.set("n", " ", "<Space>", { silent = true, remap = false })
vim.g.mapleader = " "
vim.keymap.set("n"," ",":make")

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

