  return {
    "Kurama622/llm.nvim",
    dependencies = { "nvim-lua/plenary.nvim", "MunifTanjim/nui.nvim"},
    cmd = { "LLMSessionToggle", "LLMSelectedTextHandler", "LLMAppHandler" },
    config = function()
      require("llm").setup({
            url = "https://api.deepseek.com/chat/completions",
            model = "deepseek-chat",
            api_type = "openai",
            max_tokens = 4096,
            temperature = 0.3,
            top_p = 0.7,
            fetch_key = function()
              return "sk-03404a31fd2144538d78915ca5465b67"
            end,
            prompt = "You are a helpful AI assistant",
            max_history = 10,
            enable_memory = true,
            ui = {
              enable = true,
              position = "float",
              width = 0.5,
              height = 0.5,
              border = "rounded"
            },
            save_session = {
              enable = true,
              path = vim.fn.stdpath("data") .. "/llm_sessions",
            },
        })
    end,
    keys = {
      { "<leader>ac", mode = "n", "<cmd>LLMSessionToggle<cr>" },
    },
  }
