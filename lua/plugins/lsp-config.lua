-- file: lua/plugins/lsp-config.lua
return {
  -- Mason: manager serwerów LSP
  {
    "williamboman/mason.nvim",
    cmd = "Mason",
    config = function()
      require("mason").setup()
    end,
  },

  -- Mason + LSPConfig
  {
    "williamboman/mason-lspconfig.nvim",
    dependencies = { "mason.nvim" },
    config = function()
      require("mason-lspconfig").setup({
        ensure_installed = { "ts_ls", "eslint", "lua_ls" },
        automatic_installation = true,
        automatic_enable = true, -- włącza LSP automatycznie po otwarciu pliku
      })
    end,
  },

  -- LSPConfig i CMP
  {
    "neovim/nvim-lspconfig",
    dependencies = { "hrsh7th/cmp-nvim-lsp" },
    event = { "BufReadPre", "BufNewFile" },
    config = function()
      local lspconfig = require("lspconfig")
      local util = require("lspconfig.util")
      local cmp_capabilities = require("cmp_nvim_lsp").default_capabilities()

      -- funkcje wspólne dla wszystkich LSP
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
      end

      -- =========================
      -- Lua LSP
      lspconfig.lua_ls.setup({
        capabilities = cmp_capabilities,
        on_attach = on_attach,
        settings = {
          Lua = {
            runtime = { version = "LuaJIT" },
            diagnostics = { globals = { "vim" } },
            workspace = {
              library = vim.api.nvim_get_runtime_file("", true),
              checkThirdParty = false,
            },
            telemetry = { enable = false },
          },
        },
      })

      -- =========================
      -- TypeScript/JavaScript
      lspconfig.ts_ls.setup({
        cmd = { "typescript-language-server", "--stdio" },
        filetypes = { "typescript", "typescriptreact", "typescript.tsx", "javascript", "javascriptreact" },
        root_dir = util.root_pattern("tsconfig.json", "jsconfig.json", "package.json", ".git"),
        capabilities = cmp_capabilities,
        on_attach = on_attach,
        init_options = { hostInfo = "neovim" },
      })

      -- =========================
      -- ESLint
      lspconfig.eslint.setup({
        cmd = { "vscode-eslint-language-server", "--stdio" },
        filetypes = { "javascript", "javascriptreact", "typescript", "typescriptreact" },
        root_dir = util.root_pattern(".eslintrc*", "package.json", ".git"),
        capabilities = cmp_capabilities,
        on_attach = on_attach,
        settings = {
          codeAction = {
            disableRuleComment = { enable = true, location = "separateLine" },
            showDocumentation = { enable = true },
          },
        },
      })
    end,
  },

  -- =========================
  -- CMP
  {
    "hrsh7th/nvim-cmp",
    version = false,
    event = "InsertEnter",
    dependencies = { "hrsh7th/cmp-nvim-lsp", "hrsh7th/cmp-buffer", "hrsh7th/cmp-path" },
    opts = function()
      local cmp = require("cmp")
      local defaults = require("cmp.config.default")()
      local auto_select = true

      return {
        completion = {
          completeopt = "menu,menuone,noinsert" .. (auto_select and "" or ",noselect"),
        },
        preselect = auto_select and cmp.PreselectMode.Item or cmp.PreselectMode.None,
        mapping = cmp.mapping.preset.insert({
          ["<C-b>"] = cmp.mapping.scroll_docs(-4),
          ["<C-f>"] = cmp.mapping.scroll_docs(4),
          ["<C-n>"] = cmp.mapping.select_next_item({ behavior = cmp.SelectBehavior.Insert }),
          ["<C-p>"] = cmp.mapping.select_prev_item({ behavior = cmp.SelectBehavior.Insert }),
          ["<C-Space>"] = cmp.mapping.complete(),
          ["<CR>"] = cmp.mapping.confirm({ select = auto_select }),
          ["<Tab>"] = function(fallback) if cmp.visible() then cmp.select_next_item() else fallback() end end,
          ["<S-Tab>"] = function(fallback) if cmp.visible() then cmp.select_prev_item() else fallback() end end,
        }),
        sources = cmp.config.sources({
          { name = "nvim_lsp" },
          { name = "path" },
        }, {
          { name = "buffer" },
        }),
        formatting = {
          format = function(entry, item)
            local kind_icons = {
              Text = "", Method = "", Function = "", Constructor = "",
              Field = "", Variable = "", Class = "ﴯ", Interface = "",
              Module = "", Property = "ﰠ", Unit = "", Value = "",
              Enum = "", Keyword = "", Snippet = "", Color = "",
              File = "", Reference = "", Folder = "", EnumMember = "",
              Constant = "", Struct = "", Event = "", Operator = "", TypeParameter = "",
            }
            if kind_icons[item.kind] then
              item.kind = kind_icons[item.kind] .. " " .. item.kind
            end
            return item
          end,
        },
        experimental = { ghost_text = false },
        sorting = defaults.sorting,
      }
    end,
  },
}

