return {
  {
    "stevearc/conform.nvim",
    event = { "BufWritePre", "BufReadPost" },
    config = function()
      local conform = require("conform")

      conform.setup({
        formatters_by_ft = {
          javascript = { "prettier" },
          typescript = { "prettier" },
          css = { "prettier" },
          json = { "prettier" },
          html = { "prettier" },
          yaml = { "prettier" },
          go = { "gofmt" },
        },
        format_on_save = false, -- we want manual control
        formatters = {
          prettier = {
            prepend_args = function()
              return {
                "--print-width", "100",
                -- Preserve empty lines (don't collapse multiple blank lines)
                -- Note: Prettier doesn't have a direct option for this, but we can
                -- configure it via .prettierrc instead
              }
            end,
          },
        },
      })

      -- Format whole file
      vim.api.nvim_create_user_command("Format", function()
        local ok = pcall(conform.format, {
          async = true,
          lsp_fallback = true,
        })
        if not ok then
          vim.notify("Syntax errors: unable to format", vim.log.levels.WARN)
        end
      end, {})

    end,
  },
}
