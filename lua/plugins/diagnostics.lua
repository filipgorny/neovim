return {
  "rachartier/tiny-inline-diagnostic.nvim",
  event = "VeryLazy",
  priority = 1000,
  config = function()
    local set_hl = vim.api.nvim_set_hl

    local function apply_line_highlights()
      set_hl(0, "DiagnosticLineError", { bg = "#4f1111" })
      set_hl(0, "DiagnosticLineWarn", { bg = "#4f2f11" })
      set_hl(0, "DiagnosticLineInfo", { bg = "#102f4f" })
      set_hl(0, "DiagnosticLineHint", { bg = "#104f2f" })
    end

    apply_line_highlights()

    vim.api.nvim_create_autocmd("ColorScheme", {
      callback = apply_line_highlights,
    })

    local function define_diagnostic_signs()
      local signs = {
        { name = "DiagnosticSignError", text = " ", linehl = "DiagnosticLineError" },
        { name = "DiagnosticSignWarn", text = " ", linehl = "DiagnosticLineWarn" },
        { name = "DiagnosticSignInfo", text = " ", linehl = "DiagnosticLineInfo" },
        { name = "DiagnosticSignHint", text = "󰌵", linehl = "DiagnosticLineHint" },
      }

      for _, sign in ipairs(signs) do
        vim.fn.sign_define(sign.name, {
          text = sign.text,
          texthl = sign.name,
          linehl = sign.linehl,
          numhl = "",
        })
      end
    end

    define_diagnostic_signs()

    require("tiny-inline-diagnostic").setup({
      options = {
        show_source = { enabled = true, if_many = false },
        use_icons_from_diagnostic = true,
        set_arrow_to_diag_color = true,
        add_messages = true,
        throttle = 20,
        softwrap = 40,
        multilines = {
          enabled = true,
          always_show = true,
          trim_whitespaces = false,
          tabstop = 4,
        },
        show_all_diags_on_cursorline = false,
        enable_on_insert = false,
        enable_on_select = false,
        overflow = { mode = "wrap", padding = 2 },
        break_line = { enabled = true, after = 32 },
        virt_texts = { priority = 2048 },
        severity = {
          vim.diagnostic.severity.ERROR,
          vim.diagnostic.severity.WARN,
          vim.diagnostic.severity.INFO,
          vim.diagnostic.severity.HINT,
        },
      },
    })

    vim.diagnostic.config({
      virtual_text = false,
      severity_sort = true,
    })

    set_hl(0, "TinyInlineDiagnosticVirtualTextError", { fg = "#ffd7d7", bg = "#4f1111" })
    set_hl(0, "TinyInlineDiagnosticVirtualTextWarn", { fg = "#ffe6bf", bg = "#4f2f11" })
    set_hl(0, "TinyInlineDiagnosticVirtualTextInfo", { fg = "#c2e3ff", bg = "#102f4f" })
    set_hl(0, "TinyInlineDiagnosticVirtualTextHint", { fg = "#c2ffe3", bg = "#104f2f" })
    set_hl(0, "TinyInlineDiagnosticVirtualTextArrow", { fg = "#ffcc00" })

    vim.api.nvim_create_autocmd({
      "VimEnter",
      "BufEnter",
      "BufReadPost",
      "BufWritePost",
      "InsertLeave",
      "TextChanged",
    }, {
      callback = function()
        local bufnr = vim.api.nvim_get_current_buf()
        if vim.api.nvim_buf_is_valid(bufnr) then
          vim.diagnostic.setqflist({ open = false })
        end
      end,
    })
  end,
}
