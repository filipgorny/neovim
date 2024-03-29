install("nvim-telescope/telescope.nvim")
install("rmagatti/auto-session")
install("rmagatti/session-lens")

configure(function()
  require("auto-session").setup({
    auto_restore_enabled = true,
    auto_save_enabled = true,
    auto_session_enable_last_session = true,
    auto_session_root_dir = vim.fn.stdpath("data") .. "/sessions/",
    auto_session_enabled = true,
  })

  require("session-lens").setup({
    previewer = false,
  })

  require("telescope").load_extension("session-lens")

  keys.map_all("<leader>s", "<Esc>:SearchSession<CR>")
end)
