-- SEARCH/REPLACE block parsing and application for the AI writer.
--
-- Rewriting a whole file to change three lines costs a full generation pass of
-- the file's own length. Edit blocks make the cost proportional to the change:
--
--   <<<<<<< SEARCH
--   old lines, copied verbatim
--   =======
--   new lines
--   >>>>>>> REPLACE
--
-- The parser is streaming-safe: it only ever returns COMPLETE blocks, so the
-- caller can re-parse the accumulated text after every chunk and apply each
-- block the moment it lands.
local M = {}

M.OPEN = "<<<<<<< SEARCH"
M.DIVIDER = "======="
M.CLOSE = ">>>>>>> REPLACE"

-- Local models habitually wrap their output in a Markdown fence even when told
-- not to. A fence at the very edge of a section is never real content, so drop
-- it — but leave fences in the middle alone, since a Markdown file being edited
-- may legitimately contain them.
local function trim_fences(lines)
  if #lines > 0 and lines[1]:match("^%s*```") then
    table.remove(lines, 1)
  end
  if #lines > 0 and lines[#lines]:match("^%s*```%s*$") then
    table.remove(lines)
  end
  return lines
end

-- Returns a list of { search = string, replace = string }.
function M.parse(text)
  if not text or text == "" then return {} end

  local blocks = {}
  local lines = vim.split(text, "\n", { plain = true })
  local state = "idle"
  local search, replace = {}, {}

  for _, line in ipairs(lines) do
    local trimmed = vim.trim(line)

    if state == "idle" then
      if trimmed:match("^<<<<<<<") then
        state = "search"
        search, replace = {}, {}
      end
    elseif state == "search" then
      if trimmed:match("^=======$") then
        state = "replace"
      elseif trimmed:match("^>>>>>>>") then
        -- malformed (no divider) — discard and resynchronize
        state = "idle"
      else
        table.insert(search, line)
      end
    elseif state == "replace" then
      if trimmed:match("^>>>>>>>") then
        table.insert(blocks, {
          search = table.concat(trim_fences(search), "\n"),
          replace = table.concat(trim_fences(replace), "\n"),
        })
        state = "idle"
      elseif trimmed:match("^<<<<<<<") then
        -- malformed (no close) — start over on the new block
        state = "search"
        search, replace = {}, {}
      else
        table.insert(replace, line)
      end
    end
  end

  return blocks
end

-- True if the text contains anything that looks like the start of a block.
-- Used to decide whether a response is an edit or a whole-file rewrite.
function M.looks_like_edits(text)
  if not text then return false end
  return text:match("\n%s*<<<<<<<") ~= nil or text:match("^%s*<<<<<<<") ~= nil
end

local function lines_equal(a, b, loose)
  if not loose then return a == b end
  return vim.trim(a) == vim.trim(b)
end

-- Find `needle` (list of lines) inside `haystack` (list of lines).
-- Returns the 1-based start index and the total number of matches.
local function find_lines(haystack, needle, loose)
  if #needle == 0 then return nil, 0 end

  local first, count = nil, 0
  local i = 1
  while i <= #haystack - #needle + 1 do
    local ok = true
    for j = 1, #needle do
      if not lines_equal(haystack[i + j - 1], needle[j], loose) then
        ok = false
        break
      end
    end
    if ok then
      count = count + 1
      if not first then first = i end
      -- Overlapping matches would double-count; skip past this one.
      i = i + #needle
    else
      i = i + 1
    end
  end

  return first, count
end

-- Apply one block to `bufnr`. Returns ok, err.
function M.apply(bufnr, block)
  if not vim.api.nvim_buf_is_valid(bufnr) then
    return false, "buffer is gone"
  end

  local buf_lines = vim.api.nvim_buf_get_lines(bufnr, 0, -1, false)
  local replace_lines = vim.split(block.replace or "", "\n", { plain = true })

  -- An empty SEARCH means "append this" rather than "replace nothing everywhere".
  if vim.trim(block.search or "") == "" then
    -- A buffer holding a single blank line is "empty" — overwrite it rather
    -- than pushing the new content down past it.
    if #buf_lines <= 1 and vim.trim(buf_lines[1] or "") == "" then
      vim.api.nvim_buf_set_lines(bufnr, 0, -1, false, replace_lines)
    else
      vim.api.nvim_buf_set_lines(bufnr, #buf_lines, #buf_lines, false, replace_lines)
    end
    return true
  end

  local search_lines = vim.split(block.search, "\n", { plain = true })

  local at, count = find_lines(buf_lines, search_lines, false)
  if not at then
    -- Local models routinely get indentation slightly wrong. Retry ignoring
    -- leading/trailing whitespace before giving up.
    at, count = find_lines(buf_lines, search_lines, true)
  end

  local preview = vim.trim(search_lines[1] or "")
  if #preview > 60 then preview = preview:sub(1, 60) .. "…" end

  if not at then
    return false, "no match for: " .. preview
  end
  -- A SEARCH that matches in several places would silently edit whichever one
  -- came first. Refusing is far better than rewriting the wrong function.
  if count > 1 then
    return false, string.format("ambiguous (%d matches) for: %s", count, preview)
  end

  vim.api.nvim_buf_set_lines(bufnr, at - 1, at - 1 + #search_lines, false, replace_lines)
  return true
end

return M
