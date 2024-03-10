local function map(mode, lhs, rhs, opts)
    local options = { noremap = true, silent = true }
    if opts then
        if opts.desc then
            opts.desc = "keymaps.lua: " .. opts.desc
        end
        options = vim.tbl_extend('force', options, opts)
    end
    vim.keymap.set(mode, lhs, rhs, options)
end


local function map_all(lhs, rhs, opts)
	map("n", lhs, rhs, opts)
	map("i", lhs, rhs, opts)
	map("v", lhs, rhs, opts)
end


local function map_modal(lhs, rhs, opts)
	map("n", lhs, rhs, opts)
	map("v", lhs, rhs, opts)
end

keys = {
	map = map,
	map_all = map_all,
	map_modal = map_modal
}

-- tabs
map_modal("we", ":tabnew<CR>", { desc = "Opens new tab" }) 
map_all("<C-k>", ":-tabnext<CR>", { desc = "Goes to previous tab." })
map_all("<C-j>", ":+tabnext<CR>", { desc = "Goes to next tab." })
map_all("<S-q>", ":tabclose<CR>", { desc = "Closes the tab." })

-- saving
map_all("wq", "<Esc> :w<CR>", { desc = "Saves the file and exits insert mode" })

-- typing navigation
map_modal("fl", "<S-$>", { desc = "Goes at the end of the line." })
map_modal("fh", "<S-^>", { desc = "Goes at the beginning of the line." })

