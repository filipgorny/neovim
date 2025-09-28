-- map leader to <Space>
vim.keymap.set("n", " ", "<Space>", { silent = true, remap = false })
vim.g.mapleader = " "

local file = require("utils.file")
local editing = require("utils.editing")
local keymap = require("utils.keymap")

keymap.bind_for_all("<C-s>", function ()
  file.save_file()
  editing.format_modifications()
end)

keymap.bind_for_all("<C-a>", editing.select_all)

