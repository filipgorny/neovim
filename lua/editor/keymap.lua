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

vim.cmd([[inoremap <silent><expr> <CR> coc#pum#visible() ? coc#pum#confirm() : "\<CR>"]])
