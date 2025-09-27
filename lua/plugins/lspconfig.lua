-- np. w lua/plugins/lsp.lua
return {
  "neovim/nvim-lspconfig",
  dependencies = {
    "williamboman/mason.nvim", -- jeśli chcesz auto-installer
    "williamboman/mason-lspconfig.nvim",
  },
  config = function()
    local lspconfig = require("lspconfig")

    -- mapowania dla LSP
    local function on_attach(client, bufnr)
      local opts = { noremap = true, silent = true, buffer = bufnr }

      vim.keymap.set("n", "gd", function()
        local params = vim.lsp.util.make_position_params()
        client.request("workspace/executeCommand", {
          command = "typescript.goToSourceDefinition",
          arguments = { params.textDocument.uri, params.position },
        }, function(_, result)
          if result and result[1] and result[1].uri then
            vim.lsp.util.jump_to_location(result[1], "utf-8")
          end
        end, bufnr)
      end, vim.tbl_extend("force", opts, { desc = "Goto Source Definition" }))

      vim.keymap.set("n", "gr", function()
        client.request("workspace/executeCommand", {
          command = "typescript.findAllFileReferences",
          arguments = { vim.uri_from_bufnr(0) },
        }, function(_, result)
          vim.pretty_print(result)
        end, bufnr)
      end, vim.tbl_extend("force", opts, { desc = "File References" }))

      vim.keymap.set("n", "<leader>co", function()
        vim.lsp.buf.execute_command({ command = "source.organizeImports" })
      end, opts)

      vim.keymap.set("n", "<leader>cM", function()
        vim.lsp.buf.execute_command({ command = "source.addMissingImports.ts" })
      end, opts)

      vim.keymap.set("n", "<leader>cu", function()
        vim.lsp.buf.execute_command({ command = "source.removeUnused.ts" })
      end, opts)

      vim.keymap.set("n", "<leader>cD", function()
        vim.lsp.buf.execute_command({ command = "source.fixAll.ts" })
      end, opts)
    end

    -- konfiguracja vtsls
    lspconfig.vtsls.setup({
      on_attach = on_attach,
      filetypes = {
        "javascript",
        "javascriptreact",
        "javascript.jsx",
        "typescript",
        "typescriptreact",
        "typescript.tsx",
      },
      settings = {
        complete_function_calls = true,
        vtsls = {
          enableMoveToFileCodeAction = true,
          autoUseWorkspaceTsdk = true,
          experimental = {
            maxInlayHintLength = 30,
            completion = { enableServerSideFuzzyMatch = true },
          },
        },
        typescript = {
          updateImportsOnFileMove = { enabled = "always" },
          suggest = { completeFunctionCalls = true },
          inlayHints = {
            enumMemberValues = { enabled = true },
            functionLikeReturnTypes = { enabled = true },
            parameterNames = { enabled = "literals" },
            parameterTypes = { enabled = true },
            propertyDeclarationTypes = { enabled = true },
            variableTypes = { enabled = false },
          },
        },
        javascript = {
          suggest = { completeFunctionCalls = true },
          inlayHints = {
            enumMemberValues = { enabled = true },
            functionLikeReturnTypes = { enabled = true },
            parameterNames = { enabled = "literals" },
            parameterTypes = { enabled = true },
            propertyDeclarationTypes = { enabled = true },
            variableTypes = { enabled = false },
          },
        },
      },
    })
  end,
}
