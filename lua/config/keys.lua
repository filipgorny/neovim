-- tabs
keys.map_modal("we", ":tabnew<CR>", { desc = "Opens new tab" }) 
keys.map_all("<C-k>", ":-tabnext<CR>", { desc = "Goes to previous tab." })
keys.map_all("<C-j>", ":+tabnext<CR>", { desc = "Goes to next tab." })
keys.map_all("<S-q>", ":q<CR>", { desc = "Closes the tab." })

-- saving
keys.map_all("wq", "<Esc> :w<CR>", { desc = "Saves the file and exits insert mode" })

-- typing navigation
keys.map_modal("fl", "<S-$>", { desc = "Goes at the end of the line." })
keys.map_modal("fh", "<S-^>", { desc = "Goes at the beginning of the line." })

