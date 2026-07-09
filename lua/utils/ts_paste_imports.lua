-- After pasting in TypeScript/JavaScript files, ask the TS language server to
-- add any missing imports and sort them alphabetically. The two code actions
-- used (`source.addMissingImports.ts`, `source.organizeImports.ts`) are
-- provided by typescript-language-server (and tsserver-based LSPs in general).
--
-- Behavior:
--   - In .ts/.tsx/.js/.jsx buffers, `p` and `P` are remapped to "paste then
--     fix imports".
--   - The action runs after a short delay so LSP sees the new text first.
--   - If no TS-compatible LSP is attached, paste behaves normally.
--   - On bind miss / mode toggle, plain paste still works (we wrap, never block).

local M = {}

local FILETYPES = { "typescript", "typescriptreact", "javascript", "javascriptreact" }

-- LSP code action kinds. typescript-language-server registers both ".ts"
-- and ".tsx" variants — try them in order.
local ADD_MISSING_KINDS = {
  "source.addMissingImports.ts",
  "source.addMissingImports",
}
local ORGANIZE_KINDS = {
  "source.organizeImports.ts",
  "source.organizeImports",
}

local function has_ts_client(bufnr)
  for _, client in ipairs(vim.lsp.get_clients({ bufnr = bufnr })) do
    local name = client.name or ""
    if name == "ts_ls" or name == "tsserver" or name == "vtsls"
       or name:match("typescript") then
      return true
    end
  end
  return false
end

-- Apply a code action by kind without prompting. Tries each kind in `kinds`
-- until one succeeds (LSPs disagree on the exact kind string).
local function apply_action(bufnr, kinds)
  for _, kind in ipairs(kinds) do
    local ok = pcall(vim.lsp.buf.code_action, {
      context = { only = { kind }, diagnostics = {} },
      apply = true,
      filter = function(action)
        return action.kind == kind
      end,
    })
    if ok then return end
  end
end

local function format_buffer(bufnr)
  local ok_conform, conform = pcall(require, "conform")
  if not ok_conform then return end
  pcall(conform.format, { bufnr = bufnr, async = true, lsp_fallback = true })
end

local function fix_imports_after_paste(bufnr)
  if not has_ts_client(bufnr) then
    -- No TS LSP — still format (e.g. for plain .jsx with no LSP attached)
    vim.defer_fn(function()
      if vim.api.nvim_buf_is_valid(bufnr) then format_buffer(bufnr) end
    end, 100)
    return
  end
  -- Delay so LSP receives the didChange notification for the pasted text
  -- before we ask for code actions.
  vim.defer_fn(function()
    if not vim.api.nvim_buf_is_valid(bufnr) then return end
    apply_action(bufnr, ADD_MISSING_KINDS)
    vim.defer_fn(function()
      if not vim.api.nvim_buf_is_valid(bufnr) then return end
      apply_action(bufnr, ORGANIZE_KINDS)
      -- Final pass: prettier on the whole file (covers JSX layout, indentation,
      -- attribute formatting, newly added imports).
      vim.defer_fn(function()
        if vim.api.nvim_buf_is_valid(bufnr) then format_buffer(bufnr) end
      end, 120)
    end, 120)
  end, 150)
end

-- Wrapped paste: run the original paste key, then trigger import fix.
local function make_paste_handler(key)
  return function()
    -- Honor any pending count (e.g. `3p`)
    local count = vim.v.count > 0 and vim.v.count or ""
    vim.cmd("normal! " .. count .. key)
    fix_imports_after_paste(vim.api.nvim_get_current_buf())
  end
end

function M.setup()
  local group = vim.api.nvim_create_augroup("TsPasteImports", { clear = true })
  vim.api.nvim_create_autocmd("FileType", {
    group = group,
    pattern = FILETYPES,
    callback = function(args)
      local bufnr = args.buf
      vim.keymap.set("n", "p", make_paste_handler("p"),
        { buffer = bufnr, desc = "Paste + add/sort TS imports" })
      vim.keymap.set("n", "P", make_paste_handler("P"),
        { buffer = bufnr, desc = "Paste before + add/sort TS imports" })
    end,
  })
end

return M
