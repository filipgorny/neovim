return {
  -- Mason package manager
  {
    "williamboman/mason.nvim",
    cmd = "Mason",
    config = function()
      require("mason").setup()
    end,
  },

  -- Mason LSP bridge
  {
    "williamboman/mason-lspconfig.nvim",
    dependencies = { "mason.nvim" },
    config = function()
      local mason_lsp = require("mason-lspconfig")
      mason_lsp.setup({
        ensure_installed = {
          "tsserver",
          "gopls",
          "cssls",
          "html",
          "pyright",    -- Python
          "bashls",     -- Bash
          "clangd",     -- C/C++
        },
        automatic_installation = true,
      })
    end,
  },

  -- LSP config
  {
    "neovim/nvim-lspconfig",
    dependencies = {
      "hrsh7th/cmp-nvim-lsp",
      "nvim-treesitter/nvim-treesitter",
      "williamboman/mason.nvim",
      "williamboman/mason-lspconfig.nvim",
    },
    event = { "BufReadPre", "BufNewFile" },
    config = function()
      local lspconfig = require("lspconfig")
      local cmp_capabilities = require("cmp_nvim_lsp").default_capabilities()

      local function on_attach(client, bufnr)
        local opts = { noremap = true, silent = true, buffer = bufnr }

        vim.keymap.set("n", "gd", vim.lsp.buf.definition, opts)
        vim.keymap.set("n", "gD", vim.lsp.buf.declaration, opts)
        vim.keymap.set("n", "gi", vim.lsp.buf.implementation, opts)
        vim.keymap.set("n", "gr", vim.lsp.buf.references, opts)
        vim.keymap.set("n", "K", vim.lsp.buf.hover, opts)
        vim.keymap.set("n", "<leader>rn", vim.lsp.buf.rename, opts)
        vim.keymap.set("n", "<leader>ca", vim.lsp.buf.code_action, opts)
        vim.keymap.set("n", "<leader>r", vim.diagnostic.open_float, opts)
        vim.keymap.set("n", "[d", vim.diagnostic.goto_prev, opts)
        vim.keymap.set("n", "]d", vim.diagnostic.goto_next, opts)
        vim.keymap.set("i", "<C-h>", vim.lsp.buf.signature_help, opts)

        -- Auto-import for TypeScript
        if client.name == "tsserver" then
          vim.api.nvim_create_autocmd("BufWritePre", {
            buffer = bufnr,
            callback = function()
              vim.lsp.buf.execute_command({
                command = "_typescript.applyWorkspaceEdit",
                arguments = {},
              })
            end,
          })
        end

        -- Semantic highlighting
        if client.server_capabilities.semanticTokensProvider then
          vim.lsp.semantic_tokens.on_attach(client, bufnr)
        end

        -- Inline type hints
        if client.supports_method("textDocument/inlayHint") then
          vim.lsp.buf.inlay_hint(bufnr, true)
        end
      end

      -- Lista serwerów
      local servers = {
        "tsserver",
        "gopls",
        "cssls",
        "html",
        "pyright",
        "bashls",
        "clangd",
      }

      for _, lsp in ipairs(servers) do
        lspconfig[lsp].setup({
          capabilities = cmp_capabilities,
          on_attach = on_attach,
          settings = lsp == "gopls" and {
            gopls = {
              analyses = { unusedparams = true, shadow = true },
              staticcheck = true,
            }
          } or nil,
        })
      end

      -- Diagnostics: błędy jako czerwony tekst pod linijką
      vim.diagnostic.config({
        virtual_text = {
          spacing = 1,
          prefix = "●",
          severity = { min = vim.diagnostic.severity.ERROR },
        },
        underline = true,
        signs = true,
        update_in_insert = false,
      })
    end,
  },
}
