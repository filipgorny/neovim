return {
  "yetone/avante.nvim",
  build = "make",
  event = "VeryLazy",
  version = false,

  opts = {
    instructions_file = "avante.md",

    provider = "ollama",

    providers = {
      ollama = {
        endpoint = "http://127.0.0.1:11434",
        model = "qwen2.5-coder:14b",
        timeout = 60000,

        extra_request_body = {
          -- 🔥 KLUCZOWE FIXY
          temperature = 0.2,
          top_p = 0.9,
          repeat_penalty = 1.15,

          -- 🧠 stabilność kontekstu (NAJWAŻNIEJSZE)
          num_ctx = 8192,

          -- 🧯 ograniczenie “rozjeżdżania się” generacji
          num_predict = 2048,
        },
      },
    },
  },

  dependencies = {
    "nvim-lua/plenary.nvim",
    "MunifTanjim/nui.nvim",

    "nvim-mini/mini.pick",
    "nvim-telescope/telescope.nvim",
    "hrsh7th/nvim-cmp",
    "ibhagwan/fzf-lua",
    "stevearc/dressing.nvim",
    "folke/snacks.nvim",
    "nvim-tree/nvim-web-devicons",

    {
      "HakonHarnes/img-clip.nvim",
      event = "VeryLazy",
      opts = {
        default = {
          embed_image_as_base64 = false,
          prompt_for_file_name = false,
          rag_and_drop = {
            insert_mode = true,
          },
          use_absolute_path = true,
        },
      },
    },

    {
      "MeanderingProgrammer/render-markdown.nvim",
      opts = {
        file_types = { "markdown", "Avante" },
      },
      ft = { "markdown", "Avante" },
    },
  },
}
