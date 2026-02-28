return {
	"akinsho/toggleterm.nvim",
	version = "*",
	keys = {
		{ "<leader>s", "<cmd>ToggleTerm<cr>", desc = "Toggle terminal" },
	},
	config = function(_, opts)
		require("toggleterm").setup(opts)
		vim.api.nvim_create_autocmd("TermOpen", {
			pattern = "term://*toggleterm#*",
			callback = function()
				vim.keymap.set("t", "<Esc><Esc>", "<cmd>ToggleTerm<cr>", { buffer = true, desc = "Close terminal" })
			end,
		})
	end,
	opts = {
		direction = "float",
		hide_numbers = true,
		start_in_insert = true,
		close_on_exit = true,
		float_opts = {
			border = "curved",
		},
	},
}
