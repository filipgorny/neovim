-- tabs
keys.map_modal("we", ":tabnew<CR>", { desc = "Opens new tab" }) 
keys.map_all("<C-k>", ":-tabnext<CR>", { desc = "Goes to previous tab." })
keys.map_all("<C-j>", ":+tabnext<CR>", { desc = "Goes to next tab." })
keys.map_all("<S-q>", ":q<CR>", { desc = "Closes the tab." })

function save_method_end_exit_insert()
  save_method()
  vim.cmd("stopinsert")
end

-- saving
keys.map_all("wq", save_method_end_exit_insert, { desc = "Saves the file and exits insert mode" })

-- typing navigation
keys.map_modal("fl", "<S-$>", { desc = "Goes at the end of the line." })
keys.map_modal("fh", "<S-^>", { desc = "Goes at the beginning of the line." })

