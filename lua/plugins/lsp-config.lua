-- file: lua/plugins/lsp-config.lua
return {
  -- mason: manager serwerów lsp
  {
    "williamboman/mason.nvim",
    cmd = "Mason",
    config = function()
      require("mason").setup()
    end,
  },

  -- mason + lspconfig
  {
    "williamboman/mason-lspconfig.nvim",
    dependencies = { "mason.nvim" },
    config = function()
      require("mason-lspconfig").setup({
        ensure_installed = { "ts_ls", "eslint", "lua_ls" },
        automatic_installation = true,
        automatic_enable = true, -- włącza lsp automatycznie po otwarciu pliku
      })
    end,
  },

  -- lspconfig i cmp
  {
    "neovim/nvim-lspconfig",
    dependencies = { "hrsh7th/cmp-nvim-lsp" },
    event = { "bufreadpre", "bufnewfile" },
    config = function()
      local cmp_capabilities = require("cmp_nvim_lsp").default_capabilities()

      -- funkcje wspólne dla wszystkich lsp
      local function common_on_attach(client, bufnr)
        local opts = { noremap = true, silent = true, buffer = bufnr }
        vim.keymap.set("n", "gd", vim.lsp.buf.definition, opts)
        vim.keymap.set("n", "gi", vim.lsp.buf.implementation, opts)
        vim.keymap.set("n", "gr", vim.lsp.buf.references, opts)
        vim.keymap.set("n", "K", vim.lsp.buf.hover, opts)
        vim.keymap.set("n", "<leader>rn", vim.lsp.buf.rename, opts)
        vim.keymap.set("n", "<leader>ca", vim.lsp.buf.code_action, opts)
        vim.keymap.set("n", "<leader>r", vim.diagnostic.open_float, opts)
        vim.keymap.set("n", "[d", vim.diagnostic.goto_prev, opts)
        vim.keymap.set("n", "]d", vim.diagnostic.goto_next, opts)
        vim.keymap.set("i", "<c-h>", vim.lsp.buf.signature_help, opts)
      end

      ----------------------------------------------------------
      -- 🔧 pomocnicze funkcje do formatowania tylko zmienionych linii
      ----------------------------------------------------------
      local function get_changed_ranges()
        local bufnr = vim.api.nvim_get_current_buf()
        local filename = vim.api.nvim_buf_get_name(bufnr)
        if filename == "" then return {} end

        -- zapisz aktualną zawartość do tymczasowego pliku
        local tmpfile = vim.fn.tempname()
        vim.api.nvim_command("silent write! " .. tmpfile)

        -- porównaj bieżący bufor z wersją na dysku
        local diff_output = vim.fn.systemlist({ "diff", "-u0", tmpfile, filename })
        vim.fn.delete(tmpfile)

        local ranges = {}
        for _, line in ipairs(diff_output) do
          -- szukaj linii diff-a np. "@@ -10,0 +11,3 @@"
          local start_new, count_new = line:match("%+([0-9]+),?([0-9]*)")
          if start_new then
            start_new = tonumber(start_new)
            count_new = tonumber(count_new ~= "" and count_new or 1)
            table.insert(ranges, { start_new - 1, start_new - 1 + count_new })
          end
        end
        return ranges
      end

      local function format_changed_lines()
        local bufnr = vim.api.nvim_get_current_buf()
        local ranges = get_changed_ranges()
        if #ranges == 0 then return end

        for _, range in ipairs(ranges) do
          vim.lsp.buf.format({
            bufnr = bufnr,
            async = false,
            range = {
              ["start"] = { range[1], 0 },
              ["end"] = { range[2], 0 },
            },
          })
        end
      end

      -- =========================
      -- lua lsp
      vim.lsp.config("lua_ls", {
        cmd = { "lua-language-server" },
        filetypes = { "lua" },
        root_markers = { ".git", "." },
        settings = {
          Lua = {
            runtime = { version = "LuaJIT" },
            diagnostics = {
              globals = { "vim" },
            },
            workspace = {
              library = vim.api.nvim_get_runtime_file("", true),
              checkThirdParty = false,
            },
            telemetry = { enable = false },
            completion = {
              callSnippet = "Replace"
            },
          },
        },
        capabilities = cmp_capabilities,
        on_attach = common_on_attach,
      })

      -- =========================
      -- typescript/javascript
      vim.lsp.config("ts_ls", {
        cmd = { "typescript-language-server", "--stdio" },
        filetypes = { "typescript", "typescriptreact", "typescript.tsx", "javascript", "javascriptreact" },
        root_markers = { "tsconfig.json", "jsconfig.json", "package.json", ".git" },
        capabilities = cmp_capabilities,
        on_attach = common_on_attach,
        init_options = { hostinfo = "neovim" },
      })

      -- =========================
      -- eslint
      vim.lsp.config("eslint", {
        cmd = { "vscode-eslint-language-server", "--stdio" },
        filetypes = { "javascript", "javascriptreact", "typescript", "typescriptreact" },
        root_markers = {
          ".eslintrc",
          ".eslintrc.js",
          ".eslintrc.cjs",
          ".eslintrc.json",
          "package.json",
          ".git"
        },
        capabilities = cmp_capabilities,
        on_attach = function(client, bufnr)
          if client.name == "eslint" then
            client.server_capabilities.documentFormattingProvider = true
          end

          vim.api.nvim_create_autocmd("BufWritePre", {
            buffer = bufnr,
            callback = function()
              format_changed_lines()
            end,
          })

          common_on_attach(client, bufnr)
        end,
        settings = {
          format = true,
          run = "onSave",
          validate = "onSave",
          quiet = true,
          workingDirectory = { mode = "auto" },
          codeAction = {
            disableRuleComment = { enable = true, location = "separateLine" },
            showDocumentation = { enable = true },
          },
        },
      })

      -- Enable LSP servers with autocommands
      vim.api.nvim_create_autocmd("FileType", {
        pattern = "lua",
        callback = function()
          vim.lsp.enable("lua_ls")
        end,
      })

      vim.api.nvim_create_autocmd("FileType", {
        pattern = { "typescript", "typescriptreact", "javascript", "javascriptreact" },
        callback = function()
          vim.lsp.enable("ts_ls")
        end,
      })

      vim.api.nvim_create_autocmd("FileType", {
        pattern = { "javascript", "javascriptreact", "typescript", "typescriptreact" },
        callback = function()
          vim.lsp.enable("eslint")
        end,
      })

      ----------------------------------------------------------
      -- 💡 dodatkowa optymalizacja środowiska node.js
      ----------------------------------------------------------
      vim.env.NODE_OPTIONS = "--max-old-space-size=8000"

    end,
  },

}

