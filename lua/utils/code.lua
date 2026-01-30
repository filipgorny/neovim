-- Code analysis utilities using LSP
local M = {}

-- Get word under cursor
function M.get_word_under_cursor()
  local word = vim.fn.expand("<cword>")
  if not word or word == "" then
    return nil
  end
  return word
end

-- Get current buffer info
function M.get_buffer_info(bufnr)
  bufnr = bufnr or vim.api.nvim_get_current_buf()

  return {
    bufnr = bufnr,
    filetype = vim.api.nvim_buf_get_option(bufnr, "filetype"),
    filename = vim.api.nvim_buf_get_name(bufnr),
  }
end

-- Get symbol definition path using LSP
-- @param bufnr number: Buffer number (optional, defaults to current)
-- @return string|nil: Path to definition file
function M.get_symbol_definition_path(bufnr)
  bufnr = bufnr or vim.api.nvim_get_current_buf()

  local clients = vim.lsp.get_clients({ bufnr = bufnr })
  if #clients == 0 then
    return nil
  end

  local client = clients[1]
  local params = vim.lsp.util.make_position_params(0, client.offset_encoding)

  -- Synchronous request for definition
  local result = vim.lsp.buf_request_sync(bufnr, "textDocument/definition", params, 1000)

  if not result then
    return nil
  end

  for _, res in pairs(result) do
    if res.result and #res.result > 0 then
      local loc = res.result[1]
      local uri = loc.uri or loc.targetUri
      if uri then
        return vim.uri_to_fname(uri)
      end
    end
  end

  return nil
end

-- Extract library/package name from definition path
-- @param definition_path string: Path to definition file
-- @param filetype string: File type (typescript, go, python, etc.)
-- @return string|nil: Library/package name
function M.extract_library_from_path(definition_path, filetype)
  if not definition_path then
    return nil
  end

  -- JavaScript/TypeScript: node_modules
  if definition_path:match("node_modules") then
    return definition_path:match("node_modules/(@[^/]+/[^/]+)") or
           definition_path:match("node_modules/([^/]+)")
  end

  -- Go: pkg/mod
  if definition_path:match("%.go$") or filetype == "go" then
    return definition_path:match("/pkg/mod/([^@]+)")
  end

  -- Python: site-packages
  if definition_path:match("site%-packages") or filetype == "python" then
    return definition_path:match("site%-packages/([^/]+)")
  end

  -- Lua: check for common paths
  if filetype == "lua" then
    -- Check if it's from a plugin or runtime
    local plugin_name = definition_path:match("/([^/]+)/lua/")
    if plugin_name then
      return plugin_name
    end
  end

  return nil
end

-- Find import statement for a symbol from buffer content
-- @param symbol string: Symbol name to search for
-- @param bufnr number: Buffer number (optional)
-- @return string|nil: Import source/package name
function M.find_import_source(symbol, bufnr)
  bufnr = bufnr or vim.api.nvim_get_current_buf()

  -- Get first 100 lines (imports are usually at the top)
  local lines = vim.api.nvim_buf_get_lines(bufnr, 0, 100, false)
  local content = table.concat(lines, "\n")
  local escaped_symbol = vim.pesc(symbol)

  -- JavaScript/TypeScript imports
  -- import { X } from 'package'
  local js_import = content:match("import[^}]*" .. escaped_symbol .. "[^}]*}%s*from%s*['\"]([^'\"]+)['\"]")
  if js_import then return js_import end

  -- import X from 'package'
  js_import = content:match("import%s+" .. escaped_symbol .. "%s+from%s*['\"]([^'\"]+)['\"]")
  if js_import then return js_import end

  -- import * as X from 'package'
  js_import = content:match("import%s+%*%s+as%s+" .. escaped_symbol .. "%s+from%s*['\"]([^'\"]+)['\"]")
  if js_import then return js_import end

  -- const X = require('package')
  js_import = content:match(escaped_symbol .. "[^=]*=%s*require%s*%(%s*['\"]([^'\"]+)['\"]")
  if js_import then return js_import end

  -- Python imports
  -- from package import X
  local py_import = content:match("from%s+([%w%.]+)%s+import[^%n]*" .. escaped_symbol)
  if py_import then return py_import end

  -- import package as X
  py_import = content:match("import%s+([%w%.]+)%s+as%s+" .. escaped_symbol)
  if py_import then return py_import end

  -- Go imports (more complex, need to check usage pattern)
  local go_import = content:match(escaped_symbol .. "%.")
  if go_import then
    -- Find the import that matches
    for line in content:gmatch("[^\n]+") do
      if line:match('^%s*"[^"]+"%s*$') or line:match('^%s*[%w_]+%s+"[^"]+"') then
        local pkg = line:match('"([^"]+)"')
        if pkg and pkg:match(escaped_symbol .. "$") then
          return pkg
        end
      end
    end
  end

  -- Lua requires
  -- local X = require("package")
  local lua_require = content:match("local%s+" .. escaped_symbol .. "%s*=%s*require%s*%(?['\"]([^'\"]+)['\"]")
  if lua_require then return lua_require end

  return nil
end

-- Get comprehensive symbol information
-- @param bufnr number: Buffer number (optional)
-- @return table: { symbol, filetype, filename, definition_path, library, import_source }
function M.get_symbol_info(bufnr)
  bufnr = bufnr or vim.api.nvim_get_current_buf()

  local symbol = M.get_word_under_cursor()
  if not symbol then
    return nil
  end

  local buffer_info = M.get_buffer_info(bufnr)
  local definition_path = M.get_symbol_definition_path(bufnr)
  local library = M.extract_library_from_path(definition_path, buffer_info.filetype)
  local import_source = M.find_import_source(symbol, bufnr)

  return {
    symbol = symbol,
    filetype = buffer_info.filetype,
    filename = buffer_info.filename,
    definition_path = definition_path,
    library = library or import_source,
    import_source = import_source,
  }
end

-- Check if symbol is from external library (vendor)
-- @param symbol_info table: Result from get_symbol_info
-- @return boolean
function M.is_vendor_symbol(symbol_info)
  if not symbol_info then
    return false
  end

  local def_path = symbol_info.definition_path
  if not def_path then
    return false
  end

  -- Check common vendor paths
  if def_path:match("node_modules") then return true end
  if def_path:match("site%-packages") then return true end
  if def_path:match("/pkg/mod/") then return true end
  if def_path:match("%.vim/plugged") then return true end
  if def_path:match("lazy/") then return true end

  return false
end

return M
