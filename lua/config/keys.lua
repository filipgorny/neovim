-- tabs
local tabs = require("editor.tabs")
keys.map_modal("we", tabs.new_tab, { desc = "Opens new tab" }) 
keys.map_all("<C-k>", tabs.prev_tab, { desc = "Goes to previous tab." })
keys.map_all("<C-j>", tabs.next_tab, { desc = "Goes to next tab." })
keys.map_all("<S-q>", ":q<CR>", { desc = "Closes the tab." })

function save_method_end_exit_insert()
  save_method()
  vim.cmd("stopinsert")
end

-- tree
local tree = require("editor.tree")
keys.map_all("<M-q>", tree.toggle_tree, { desc = "Toggles the tree." })

-- saving
keys.map_all("wq", save_method_end_exit_insert, { desc = "Saves the file and exits insert mode" })

-- typing navigation
keys.map_modal("fl", "<S-$>", { desc = "Goes at the end of the line." })
keys.map_modal("fh", "<S-^>", { desc = "Goes at the beginning of the line." })

-- navigation
keys.map_all("<M-e>", "<Esc>:bn<CR>", { desc = "Goes to the previous buffer." })
keys.map_all("<M-w>", "<Esc>:bp<CR>", { desc = "Goes to the next buffer." })
