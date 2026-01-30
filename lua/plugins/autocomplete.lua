return {
  "hrsh7th/nvim-cmp",
  version = false, -- last release is old
  event = "InsertEnter",
  dependencies = {
    "hrsh7th/cmp-nvim-lsp",
    "hrsh7th/cmp-buffer",
    "hrsh7th/cmp-path",
    "hrsh7th/cmp-nvim-lsp-signature-help",
  },
  opts = function()
    -- capabilities dla LSP
    local capabilities = require("cmp_nvim_lsp").default_capabilities()
    for _, client in pairs(vim.lsp.get_active_clients()) do
      client.server_capabilities = vim.tbl_deep_extend(
        "force",
        client.server_capabilities,
        capabilities
      )
    end

    vim.api.nvim_set_hl(0, "CmpGhostText", { link = "Comment", default = true })
    local cmp = require("cmp")
    local types = require("cmp.types")
    local compare = require("cmp.config.compare")
    local defaults = require("cmp.config.default")()
    local auto_select = true

    local function normalize_label(entry)
      local completion_item = entry.completion_item or {}
      local label = completion_item.label
        or completion_item.insertText
        or (completion_item.textEdit and completion_item.textEdit.newText)
        or entry:get_insert_text()

      if type(label) ~= "string" then
        return nil
      end

      local tail = label:match("([%w_]+)$")
      return (tail or label):lower()
    end

    local preferred_kind_weight = {
      [types.lsp.CompletionItemKind.Variable] = 0,
      [types.lsp.CompletionItemKind.Field] = 0,
      [types.lsp.CompletionItemKind.Property] = 0,
      [types.lsp.CompletionItemKind.EnumMember] = 0,
      [types.lsp.CompletionItemKind.Constant] = 0,
      [types.lsp.CompletionItemKind.Parameter] = 0,
      [types.lsp.CompletionItemKind.Struct] = 1,
      [types.lsp.CompletionItemKind.Interface] = 2,
      [types.lsp.CompletionItemKind.Function] = 3,
      [types.lsp.CompletionItemKind.Method] = 3,
      [types.lsp.CompletionItemKind.Class] = 4,
      [types.lsp.CompletionItemKind.Constructor] = 4,
    }

    local function active_param_score(entry, param_name)
      if not param_name or param_name == "" then
        return nil
      end

      if normalize_label(entry) ~= param_name then
        return nil
      end

      local completion_item = entry.completion_item or {}
      local kind = completion_item.kind or entry:get_kind()
      local weight = preferred_kind_weight[kind] or 10
      return weight
    end

    local function prefer_active_parameter(entry1, entry2)
      local bufnr = vim.api.nvim_get_current_buf()
      local param_name = vim.b[bufnr].lsp_active_parameter_name
      if not param_name or param_name == "" then
        return nil
      end

      local normalized_param = param_name:lower()
      local score1 = active_param_score(entry1, normalized_param)
      local score2 = active_param_score(entry2, normalized_param)

      if score1 == nil and score2 == nil then
        return nil
      end
      if score1 ~= nil and score2 == nil then
        return true
      end
      if score1 == nil and score2 ~= nil then
        return false
      end

      if score1 ~= score2 then
        return score1 < score2
      end

      return nil
    end

    local function trigger_constructor_signature(entry)
      if not entry then
        return
      end

      local item = entry.completion_item or {}
      local kind = item.kind or entry:get_kind()

      if kind ~= types.lsp.CompletionItemKind.Class
        and kind ~= types.lsp.CompletionItemKind.Constructor then
        return
      end

      vim.defer_fn(function()
        pcall(vim.lsp.buf.signature_help)
      end, 10)
    end

    if not vim.g.__cmp_constructor_signature_listener then
      cmp.event:on("confirm_done", function(event)
        trigger_constructor_signature(event.entry)
      end)
      vim.g.__cmp_constructor_signature_listener = true
    end

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
        ["<C-y>"] = cmp.mapping.confirm({ select = true }),
        ["<S-CR>"] = cmp.mapping.confirm({ behavior = cmp.ConfirmBehavior.Replace }),
        ["<C-CR>"] = function(fallback)
          cmp.abort()
          fallback()
        end,
        ["<Tab>"] = cmp.mapping(function(fallback)
          if cmp.visible() then
            cmp.select_next_item()
          else
            fallback()
          end
        end, { "i", "s" }),
        ["<S-Tab>"] = cmp.mapping(function(fallback)
          if cmp.visible() then
            cmp.select_prev_item()
          else
            fallback()
          end
        end, { "i", "s" }),
      }),
      sources = cmp.config.sources({
        { name = "nvim_lsp" },
        { name = "nvim_lsp_signature_help" },
        { name = "path" },
      }, {
        { name = "buffer" },
      }),
      formatting = {
        format = function(entry, item)
          -- opcjonalnie możesz dodać własne ikonki dla typów completion
          local kind_icons = {
            Text = "",
            Method = "",
            Function = "",
            Constructor = "",
            Field = "",
            Variable = "",
            Class = "ﴯ",
            Interface = "",
            Module = "",
            Property = "ﰠ",
            Unit = "",
            Value = "",
            Enum = "",
            Keyword = "",
            Snippet = "",
            Color = "",
            File = "",
            Reference = "",
            Folder = "",
            EnumMember = "",
            Constant = "",
            Struct = "",
            Event = "",
            Operator = "",
            TypeParameter = "",
          }
          if kind_icons[item.kind] then
            item.kind = kind_icons[item.kind] .. " " .. item.kind
          end
          return item
        end,
      },
      experimental = {
        ghost_text = false
      },
      sorting = vim.tbl_deep_extend("force", defaults.sorting, {
        comparators = vim.list_extend({ prefer_active_parameter }, defaults.sorting.comparators or {
          compare.offset,
          compare.exact,
          compare.score,
          compare.recently_used,
          compare.locality,
          compare.kind,
          compare.sort_text,
          compare.length,
          compare.order,
        }),
      }),
      init_options = {
        preferences = {
          importModuleSpecifierPreference = "relative"
        }
      },
    }
  end,
}
