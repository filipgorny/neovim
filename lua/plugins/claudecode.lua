return {
  "greggh/claude-code.nvim",
  dependencies = {
    "nvim-lua/plenary.nvim",
  },
  opts = {
    window = {
      position = "right",
      width = 0.45,
      enter_insert = true,
    },
  },
  keys = {
    { "<leader>c", "<cmd>ClaudeCode<cr>", desc = "Claude Code" },
  },
}
