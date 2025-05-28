return {
	'nvim-telescope/telescope.nvim',
	-- tag = '0.1.8', -- Opcjonalnie, jeśli chcesz konkretną wersję
	dependencies = { 'nvim-lua/plenary.nvim' },
	keys = {
		{
			'<leader>f',
			function()
				require('telescope.builtin').find_files({
					hidden = false, -- Włącza wyszukiwanie ukrytych plików
				})
			end,
			desc = 'Telescope find files',
		},
		{
			'<leader>b',
			function()
				require('telescope.builtin').buffers()
			end,
			desc = 'Telescope list buffers',
		},
		{
			'<leader>h',
			function()
				require('telescope.builtin').help_tags()
			end,
			desc = 'Telescope help tags',
		},
		{
			'<leader>g',
			function()
				require('telescope.builtin').live_grep()
			end,
			desc = 'Telescope live grep',
		},
		{
			'<leader>t',
			function()
				require('telescope.builtin').colorscheme()
			end,
			desc = 'Select color theme',
		},
	},
	config = function()
		print('Telescope setup running') -- Debug output
		require('telescope').setup {
			defaults = {
				mappings = {
					i = {
						['<C-j>'] = require('telescope.actions').move_selection_next,
						['<C-k>'] = require('telescope.actions').move_selection_previous,
					},
				},
			},
			pickers = {
				colorscheme = {
					enable_preview = true, -- Włącza podgląd motywu podczas wyboru
				},
			},
		}
	end,
}
