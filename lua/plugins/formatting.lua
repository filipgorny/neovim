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
          go = { "gofmt" },
        },
        format_on_save = false, -- we want manual control
      })

      -- Format whole file
      vim.api.nvim_create_user_command("Format", function()
        conform.format({
          async = true,
          lsp_fallback = true,
        })
      end, {})

      -- Format only changed lines compared to HEAD
      vim.api.nvim_create_user_command("FormatDiff", function()
        local buf = vim.api.nvim_get_current_buf()
        local filename = vim.api.nvim_buf_get_name(buf)

        -- get diff from git
        local handle = io.popen("git diff -U0 HEAD -- " .. vim.fn.shellescape(filename))
        if not handle then
          vim.notify("Failed to run git diff", vim.log.levels.ERROR)
          return
        end

        local diff = handle:read("*a")
        handle:close()

        -- parse diff hunks
        local ranges = {}
        for line in diff:gmatch("[^\n]+") do
          local s, e = line:match("^@@ %-%d+,%d* %+(%d+),?(%d*) @@")
          if s then
            local start_line = tonumber(s)
            local count = tonumber(e) or 1
            local end_line = start_line + count - 1
            table.insert(ranges, { start_line, end_line })
          end
        end

        if vim.tbl_isempty(ranges) then
          vim.notify("No changes to format", vim.log.levels.INFO)
          return
        end

        -- run conform for each range
        for _, r in ipairs(ranges) do
          conform.format({
            async = true,
            lsp_fallback = true,
            range = {
              start = { r[1], 0 },
              ["end"] = { r[2], 0 },
            },
          })
        end
      end, {})


    end,
  },
}
