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
        ensure_installed = { "ts_ls", "eslint", "lua_ls", "gopls" },
        automatic_installation = true,
        automatic_enable = true, -- włącza lsp automatycznie po otwarciu pliku
      })

      -- Also ensure debug adapters are installed
      local registry = require("mason-registry")
      local adapters_to_install = { "js-debug-adapter" }

      for _, adapter in ipairs(adapters_to_install) do
        local package = registry.get_package(adapter)
        if not package:is_installed() then
          vim.notify("Installing " .. adapter .. "...", vim.log.levels.INFO)
          package:install()
        end
      end
    end,
  },

  -- lspconfig i cmp
  {
    "neovim/nvim-lspconfig",
    dependencies = { "hrsh7th/cmp-nvim-lsp" },
    event = { "bufreadpre", "bufnewfile" },
    config = function()
      local cmp_capabilities = require("cmp_nvim_lsp").default_capabilities()
      local signature_state = require("utils.signature_state")

      if not vim.g.__lsp_signature_handler_wrapped then
        local original_signature_handler = vim.lsp.handlers["textDocument/signatureHelp"]
          or vim.lsp.handlers.signature_help

        vim.lsp.handlers["textDocument/signatureHelp"] = function(err, result, ctx, config)
          if not err then
            local bufnr = ctx and ctx.bufnr or vim.api.nvim_get_current_buf()
            signature_state.update_from_signature(bufnr, result)
          end

          if original_signature_handler then
            return original_signature_handler(err, result, ctx, config)
          end
        end

        vim.g.__lsp_signature_handler_wrapped = true
      end

      local signature_triggers = { ["("] = true, [","] = true }

      local function setup_signature_autocmd(bufnr)
        local group = vim.api.nvim_create_augroup("LspSignatureOnType" .. bufnr, { clear = true })
        vim.api.nvim_create_autocmd("InsertCharPre", {
          group = group,
          buffer = bufnr,
          callback = function(event)
            if not signature_triggers[event.char or ""] then
              return
            end

            local clients = vim.lsp.get_clients({ bufnr = event.buf })
            for _, active_client in ipairs(clients) do
              if active_client.server_capabilities.signatureHelpProvider then
                vim.schedule(function()
                  if vim.api.nvim_get_current_buf() == event.buf then
                    pcall(vim.lsp.buf.signature_help)
                  end
                end)
                break
              end
            end
          end,
        })
      end

      -- funkcje wspólne dla wszystkich lsp
      local function common_on_attach(client, bufnr)
        local opts = { noremap = true, silent = true, buffer = bufnr }
        
        -- gd skacze bezpośrednio do pierwszej definicji bez pokazywania okna wyboru
        vim.keymap.set("n", "gd", function()
          local clients = vim.lsp.get_clients({bufnr = 0})
          if #clients == 0 then
            vim.notify("No LSP client attached", vim.log.levels.WARN)
            return
          end
          
          local params = vim.lsp.util.make_position_params(0, clients[1].offset_encoding)
          vim.lsp.buf_request(0, 'textDocument/definition', params, function(err, result, ctx, config)
            if err then
              vim.notify("LSP Error: " .. vim.inspect(err), vim.log.levels.ERROR)
              return
            end
            if not result or vim.tbl_isempty(result) then
              vim.notify("No definition found", vim.log.levels.WARN)
              return
            end
            
            -- Handle both single result and array of results
            local locations = vim.islist(result) and result or {result}
            if #locations > 0 then
              local loc = locations[1]
              local uri = loc.uri or loc.targetUri
              local range = loc.range or loc.targetRange or loc.targetSelectionRange
              
              if uri then
                -- Get file path from URI
                local filepath = vim.uri_to_fname(uri)
                local current_buf = vim.api.nvim_get_current_buf()
                local current_file = vim.api.nvim_buf_get_name(current_buf)
                
                -- Check if opening a different file
                local is_new_file = (filepath ~= current_file)

                -- Open file in buffer only if it's a different file
                if is_new_file then
                  vim.cmd('edit ' .. vim.fn.fnameescape(filepath))
                end

                -- Set cursor position
                if range and range.start then
                  vim.api.nvim_win_set_cursor(0, {range.start.line + 1, range.start.character})
                end
              end
            end
          end)
        end, opts)
        
        vim.keymap.set("n", "gi", vim.lsp.buf.implementation, opts)
        vim.keymap.set("n", "gr", function()
          require('telescope.builtin').lsp_references()
        end, { noremap = true, silent = true, buffer = bufnr, desc = "Find all usages (Telescope)" })
        vim.keymap.set("n", "K", vim.lsp.buf.hover, opts)
        vim.keymap.set("n", "<leader>rn", vim.lsp.buf.rename, opts)
        vim.keymap.set("n", "<leader>ca", vim.lsp.buf.code_action, opts)
        vim.keymap.set("n", "<leader>r", vim.diagnostic.open_float, opts)
        vim.keymap.set("n", "[d", vim.diagnostic.goto_prev, opts)
        vim.keymap.set("n", "]d", vim.diagnostic.goto_next, opts)
        vim.keymap.set("i", "<c-h>", vim.lsp.buf.signature_help, opts)

        if client.server_capabilities.signatureHelpProvider and not vim.b[bufnr].lsp_signature_on_type then
          setup_signature_autocmd(bufnr)
          vim.b[bufnr].lsp_signature_on_type = true
        end
      end

      local signature_cleanup_group = vim.api.nvim_create_augroup("LspSignatureStateCleanup", { clear = true })
      vim.api.nvim_create_autocmd({ "InsertLeave", "BufLeave", "LspDetach" }, {
        group = signature_cleanup_group,
        callback = function(event)
          signature_state.clear(event.buf)
        end,
      })

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
        settings = {
          typescript = {
            preferences = {
              importModuleSpecifier = "non-relative",
            },
          },
          javascript = {
            preferences = {
              importModuleSpecifier = "non-relative",
            },
          },
        },
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

          -- Removed BufWritePre autocmd to prevent formatting lag
          -- Use :Format command or conform.nvim manually instead

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

      -- =========================
      -- gopls (Go language server)
      vim.lsp.config("gopls", {
        cmd = { "gopls" },
        filetypes = { "go", "gomod", "gowork", "gotmpl" },
        root_markers = { "go.work", "go.mod", ".git" },
        capabilities = cmp_capabilities,
        on_attach = common_on_attach,
        settings = {
          gopls = {
            analyses = {
              unusedparams = true,
            },
            staticcheck = true,
            gofumpt = true,
          },
        },
      })

      vim.api.nvim_create_autocmd("FileType", {
        pattern = "go",
        callback = function()
          vim.lsp.enable("gopls")
        end,
      })

      ----------------------------------------------------------
      -- 💡 dodatkowa optymalizacja środowiska node.js
      ----------------------------------------------------------
      vim.env.NODE_OPTIONS = "--max-old-space-size=8000"

    end,
  },

}
