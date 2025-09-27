-- map leader to <Space>
vim.keymap.set("n", " ", "<Space>", { silent = true, remap = false })
vim.g.mapleader = " "
vim.keymap.set("n"," ",":make")

local file = require("utils.file")
local editing = require("utils.editing")

vim.keymap.set("i", "<C-S>", function()
	file.save_file()
	editing.format_added()
end)
vim.keymap.set("v", "<C-S>", function()
	file.save_file()
	editing.format_added()
end)
vim.keymap.set("n", "<C-S>", function()
	file.save_file()
	editing.format_added()
end)


