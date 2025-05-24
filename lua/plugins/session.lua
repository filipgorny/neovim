return {
    "olimorris/persisted.nvim",
    dependencies = { "nvim-telescope/telescope.nvim" },
  event = "BufReadPre", -- Ensure the plugin loads only when a buffer has been loaded
  opts = {
        save_dir = vim.fn.expand(vim.fn.stdpath("data") .. "/sessions/"),
        autosave = true,
  },
}
