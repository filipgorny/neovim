return {
  dir = vim.fn.expand("~/Projects/filipgorny/assistant/nvim/terry.nvim"),
  name = "terry.nvim",
  config = function()
    require("terry").setup({
      host = "localhost",
      port = 9877,
      token = "",
      persona = "Terry",
      system_prompt_file = vim.fn.expand("~/.config/nvim/terry/TERRY.md"),
      start_command = "cd " .. vim.fn.expand("~/Projects/filipgorny/assistant") .. " && ./bin/engine -config config.yaml",
      ui = {
        width = 0.40,
        input_min_height = 0.10,
        input_max_height = 0.25,
      },
    })
  end,
  keys = {
    { "<leader>ta", function() require("terry").toggle() end, desc = "Toggle Terry assistant" },
  },
}
