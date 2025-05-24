-- map leader to <Space>
vim.keymap.set("n", " ", "<Nop>", { silent = true, remap = false })
vim.g.mapleader = " "
vim.keymap.set("n"," ",":make")
vim.keymap.set({"n", "i", "v"}, "<C-s>", "<Esc>:w<CR>")

