return {
  "hrsh7th/nvim-cmp",
  version = false,
  lazy = false,
  dependencies = {
    "hrsh7th/cmp-nvim-lsp",
    "hrsh7th/cmp-buffer",
    "hrsh7th/cmp-path",
    "hrsh7th/cmp-nvim-lsp-signature-help",
  },
  opts = function()
    local ok, cmp = pcall(require, "cmp")
    if not ok then return {} end

    local defaults = require("cmp.config.default")()
    local types = require("cmp.types")

    -- LSP capabilities
    local ok_lsp, cmp_lsp = pcall(require, "cmp_nvim_lsp")
    if ok_lsp then
      local capabilities = cmp_lsp.default_capabilities()
      for _, client in pairs(vim.lsp.get_active_clients()) do
        client.server_capabilities = vim.tbl_deep_extend("force", client.server_capabilities, capabilities)
      end
    end

    vim.api.nvim_set_hl(0, "CmpGhostText", { link = "Comment", default = true })

    return {
      completion = { completeopt = "menu,menuone,noinsert" },
      preselect = cmp.PreselectMode.Item,
      mapping = cmp.mapping.preset.insert({
        ["<C-b>"] = cmp.mapping.scroll_docs(-4),
        ["<C-f>"] = cmp.mapping.scroll_docs(4),
        ["<C-n>"] = cmp.mapping.select_next_item({ behavior = cmp.SelectBehavior.Insert }),
        ["<C-p>"] = cmp.mapping.select_prev_item({ behavior = cmp.SelectBehavior.Insert }),
        ["<C-Space>"] = cmp.mapping.complete(),
        ["<CR>"] = cmp.mapping.confirm({ select = true }),
        ["<Tab>"] = cmp.mapping(function(fallback)
          if cmp.visible() then cmp.select_next_item() else fallback() end
        end, { "i", "s" }),
        ["<S-Tab>"] = cmp.mapping(function(fallback)
          if cmp.visible() then cmp.select_prev_item() else fallback() end
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
          local kind_icons = {
            Text="", Method="", Function="", Constructor="", Field="", Variable="",
            Class="ﴯ", Interface="", Module="", Property="ﰠ", Unit="", Value="",
            Enum="", Keyword="", Snippet="", Color="", File="", Reference="", Folder="",
            EnumMember="", Constant="", Struct="", Event="", Operator="", TypeParameter="",
          }
          if kind_icons[item.kind] then item.kind = kind_icons[item.kind].." "..item.kind end
          return item
        end,
      },
      experimental = { ghost_text = false },
      sorting = defaults.sorting,
      init_options = { preferences = { importModuleSpecifierPreference = "relative" } },
    }
  end,
}

