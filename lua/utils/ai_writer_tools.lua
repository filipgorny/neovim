-- Tool definitions and executors for the AI writer agent (<leader>a).
-- Each tool follows the Ollama function-calling schema. Executors run async
-- and call back with a STRING result that gets stitched back into the chat
-- as a {role="tool", content=...} message.

local M = {}

local function urlencode(s)
  return (s:gsub("[^%w%-%._~]", function(c)
    return string.format("%%%02X", string.byte(c))
  end))
end

local function strip_html(s)
  return (s
    :gsub("<[^>]+>", "")
    :gsub("&amp;", "&")
    :gsub("&lt;", "<")
    :gsub("&gt;", ">")
    :gsub("&quot;", '"')
    :gsub("&#x27;", "'")
    :gsub("&#39;", "'")
    :gsub("&nbsp;", " "))
end

-- Public schema list (passed to the LLM in `tools` field)
M.definitions = {
  {
    type = "function",
    ["function"] = {
      name = "find_symbol",
      description =
      "Search the current project (cwd) for a class, function, type, interface or other named symbol. Returns matching file paths, line numbers and surrounding context.",
      parameters = {
        type = "object",
        properties = {
          name = { type = "string", description = "Symbol name to look up (case-sensitive)." },
        },
        required = { "name" },
      },
    },
  },
  {
    type = "function",
    ["function"] = {
      name = "web_search",
      description =
      "Search the web via DuckDuckGo for a query. Returns top 5 result titles, snippets and URLs. Use for docs, library APIs, error messages.",
      parameters = {
        type = "object",
        properties = {
          query = { type = "string", description = "Search query." },
        },
        required = { "query" },
      },
    },
  },
  {
    type = "function",
    ["function"] = {
      name = "read_file",
      description =
      "Read the contents of another file in the project — an import, a dependency, a type definition, a config. Use this BEFORE writing code that calls into or implements something defined elsewhere, so the signatures you emit actually match. Path is relative to the project root.",
      parameters = {
        type = "object",
        properties = {
          path = { type = "string", description = "File path relative to the project root, e.g. 'src/user/service.ts'." },
          start_line = { type = "integer", description = "Optional 1-based first line to return." },
          end_line = { type = "integer", description = "Optional 1-based last line to return." },
        },
        required = { "path" },
      },
    },
  },
  {
    type = "function",
    ["function"] = {
      name = "list_files",
      description =
      "List project files whose path matches a substring or glob. Use it to locate a dependency before calling read_file when you do not know its exact path.",
      parameters = {
        type = "object",
        properties = {
          pattern = { type = "string", description = "Substring or glob, e.g. 'user/service' or '*.config.ts'." },
        },
        required = { "pattern" },
      },
    },
  },
  {
    type = "function",
    ["function"] = {
      name = "ask_user",
      description =
      "Ask the user a clarifying question when the instruction is ambiguous or missing context. Returns the user's answer. Use sparingly — only when you genuinely cannot proceed.",
      parameters = {
        type = "object",
        properties = {
          question = { type = "string", description = "Question to display to the user." },
        },
        required = { "question" },
      },
    },
  },
}

-- find_symbol: ripgrep for common symbol-declaration patterns
function M.find_symbol(args, callback)
  local name = type(args) == "table" and args.name or ""
  if name == nil or name == "" then
    callback("error: missing 'name' argument")
    return
  end

  local escaped = vim.fn.escape(name, "[](){}.+*?|^$\\")
  -- Cover JS/TS, Python, Go, Rust, Java/C#/Kotlin, Lua, Ruby, C/C++
  local pattern = string.format(
    "\\b(class|interface|type|enum|struct|trait|impl|function|def|fn|func|local function|export\\s+(default\\s+)?(class|function|const|let|var|interface|type|enum))\\s+%s\\b",
    escaped
  )

  vim.fn.jobstart({
    "rg", "-n", "-S", "--no-heading", "-m", "30", "-C", "2",
    "--type-add", "code:*.{ts,tsx,js,jsx,mjs,cjs,py,go,rb,rs,java,cs,php,lua,kt,swift,c,cc,cpp,h,hh,hpp}",
    "-t", "code",
    "-e", pattern,
    vim.fn.getcwd(),
  }, {
    stdout_buffered = true,
    on_stdout = function(_, data)
      local out = table.concat(data or {}, "\n")
      if not out or vim.trim(out) == "" then
        callback("No matches found for symbol '" .. name .. "' in " .. vim.fn.getcwd())
        return
      end
      if #out > 4000 then out = out:sub(1, 4000) .. "\n... [truncated]" end
      callback(out)
    end,
    on_exit = function(_, code)
      if code ~= 0 and code ~= 1 then
        callback(string.format("rg exited with code %d (is ripgrep installed?)", code))
      end
    end,
  })
end

-- web_search: scrape DuckDuckGo HTML for top results
function M.web_search(args, callback)
  local query = type(args) == "table" and args.query or ""
  if query == nil or query == "" then
    callback("error: missing 'query' argument")
    return
  end

  local url = "https://html.duckduckgo.com/html/?q=" .. urlencode(query)
  vim.fn.jobstart({
    "curl", "-s", "-L",
    "-A", "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36",
    "--max-time", "10",
    url,
  }, {
    stdout_buffered = true,
    on_stdout = function(_, data)
      local html = table.concat(data or {}, "\n")
      if not html or html == "" then
        callback("No response from DuckDuckGo")
        return
      end

      local results = {}
      for block in html:gmatch('<div class="result__body[^"]*"[^>]*>(.-)</div>%s*</div>') do
        local link_url = block:match('class="result__a"[^>]*href="([^"]+)"')
        local title    = block:match('class="result__a"[^>]*>(.-)</a>')
        local snippet  = block:match('class="result__snippet"[^>]*>(.-)</a>')
        if title and link_url then
          title   = vim.trim(strip_html(title))
          snippet = snippet and vim.trim(strip_html(snippet)) or ""
          -- DuckDuckGo HTML wraps the URL in a redirect — extract the `uddg` param
          local real_url = link_url:match("uddg=([^&]+)")
          if real_url then real_url = vim.uri_decode(real_url) end
          table.insert(results, string.format(
            "• %s\n  %s\n  %s",
            title, snippet, real_url or link_url
          ))
          if #results >= 5 then break end
        end
      end

      if #results == 0 then
        callback("No parseable results (DuckDuckGo HTML structure may have changed). Raw length: " .. #html)
      else
        callback(table.concat(results, "\n\n"))
      end
    end,
    on_exit = function(_, code)
      if code ~= 0 then
        callback(string.format("curl exited with code %d", code))
      end
    end,
  })
end

-- Resolve a user/model-supplied path against the project root, refusing to
-- escape it. Returns absolute path or nil, err.
local function resolve_in_project(path)
  if type(path) ~= "string" or path == "" then
    return nil, "error: missing 'path' argument"
  end

  local root = vim.fn.getcwd()
  local abs = path
  if not abs:match("^/") then
    abs = root .. "/" .. abs
  end
  abs = vim.fn.resolve(vim.fn.fnamemodify(abs, ":p"))
  -- strip a trailing slash so the prefix test below is exact
  abs = abs:gsub("/$", "")

  local root_resolved = vim.fn.resolve(vim.fn.fnamemodify(root, ":p")):gsub("/$", "")
  if abs ~= root_resolved and abs:sub(1, #root_resolved + 1) ~= root_resolved .. "/" then
    return nil, "error: path escapes the project root (" .. root_resolved .. ")"
  end

  return abs
end

local READ_FILE_MAX_LINES = 500
local READ_FILE_MAX_CHARS = 12000

-- read_file: return the contents of another project file so the model can match
-- real signatures instead of inventing them.
function M.read_file(args, callback)
  args = type(args) == "table" and args or {}

  local abs, err = resolve_in_project(args.path)
  if not abs then
    callback(err)
    return
  end
  if vim.fn.filereadable(abs) ~= 1 then
    if vim.fn.isdirectory(abs) == 1 then
      callback("error: '" .. args.path .. "' is a directory, not a file. Use list_files to look inside it.")
    else
      callback("error: file not found: " .. args.path)
    end
    return
  end

  local ok, lines = pcall(vim.fn.readfile, abs)
  if not ok or type(lines) ~= "table" then
    callback("error: could not read " .. args.path)
    return
  end

  local total = #lines
  local first = tonumber(args.start_line) or 1
  local last = tonumber(args.end_line) or total
  if first < 1 then first = 1 end
  if last > total then last = total end
  if last < first then last = total end

  local truncated_lines = false
  if last - first + 1 > READ_FILE_MAX_LINES then
    last = first + READ_FILE_MAX_LINES - 1
    truncated_lines = true
  end

  local body = table.concat(vim.list_slice(lines, first, last), "\n")
  local truncated_chars = false
  if #body > READ_FILE_MAX_CHARS then
    body = body:sub(1, READ_FILE_MAX_CHARS)
    truncated_chars = true
  end

  local header = string.format("%s (lines %d-%d of %d)", args.path, first, last, total)
  local footer = ""
  if truncated_lines or truncated_chars then
    footer = "\n... [truncated — request a narrower start_line/end_line range for more]"
  end

  callback(header .. "\n" .. string.rep("─", 40) .. "\n" .. body .. footer)
end

-- list_files: locate a dependency by path fragment or glob.
function M.list_files(args, callback)
  local pattern = type(args) == "table" and args.pattern or ""
  if pattern == nil or pattern == "" then
    callback("error: missing 'pattern' argument")
    return
  end

  local root = vim.fn.getcwd()
  local cmd
  if vim.fn.executable("rg") == 1 then
    cmd = { "rg", "--files", root }
  else
    cmd = { "find", root, "-type", "f" }
  end

  -- Turn a glob into a Lua pattern; a plain substring matches literally.
  local is_glob = pattern:find("[*?]") ~= nil
  local lua_pat
  if is_glob then
    lua_pat = pattern:gsub("([%^%$%(%)%%%.%[%]%+%-])", "%%%1"):gsub("%*", ".*"):gsub("%?", ".")
  end

  vim.fn.jobstart(cmd, {
    stdout_buffered = true,
    on_stdout = function(_, data)
      local matches = {}
      for _, line in ipairs(data or {}) do
        if line ~= "" then
          local rel = line:sub(#root + 2)
          local hit
          if is_glob then
            hit = rel:match(lua_pat) ~= nil
          else
            hit = rel:lower():find(pattern:lower(), 1, true) ~= nil
          end
          if hit then
            table.insert(matches, rel)
            if #matches >= 50 then break end
          end
        end
      end

      if #matches == 0 then
        callback("No files matching '" .. pattern .. "' under " .. root)
      else
        callback(table.concat(matches, "\n"))
      end
    end,
    on_exit = function(_, code)
      if code ~= 0 and code ~= 1 then
        callback(string.format("file listing exited with code %d", code))
      end
    end,
  })
end

-- ask_user: open a floating prompt, return user's text
function M.ask_user(args, callback)
  local question = type(args) == "table" and args.question or ""
  if question == "" then
    callback("error: missing 'question'")
    return
  end

  vim.schedule(function()
    local ui = vim.api.nvim_list_uis()[1]
    local width = math.min(90, math.max(50, math.floor(ui.width * 0.6)))
    local height = 6
    local row = math.floor((ui.height - height) / 2)
    local col = math.floor((ui.width - width) / 2)

    local buf = vim.api.nvim_create_buf(false, true)
    vim.api.nvim_buf_set_option(buf, "buftype", "nofile")
    vim.api.nvim_buf_set_option(buf, "bufhidden", "wipe")
    vim.api.nvim_buf_set_option(buf, "filetype", "markdown")

    -- Display: question + separator + empty answer line
    local q_lines = vim.split("Q: " .. question, "\n", { plain = true })
    table.insert(q_lines, string.rep("─", width - 2))
    table.insert(q_lines, "")
    vim.api.nvim_buf_set_lines(buf, 0, -1, false, q_lines)
    -- 0-indexed line the user types on: the blank line appended above, i.e. the
    -- last line of the buffer. (Using #q_lines here put the cursor one line
    -- past the end and threw "Invalid cursor line: out of range".)
    local answer_start = #q_lines - 1

    local win = vim.api.nvim_open_win(buf, true, {
      relative = "editor",
      width = width, height = height, row = row, col = col,
      style = "minimal", border = "rounded",
      title = " AI asks ", title_pos = "center",
      footer = " <CR> submit · <Esc> skip ", footer_pos = "center",
    })
    vim.api.nvim_win_set_option(win, "wrap", true)
    pcall(vim.api.nvim_win_set_cursor, win, { answer_start + 1, 0 })
    vim.cmd("startinsert")

    local done = false
    local function finish(answer)
      if done then return end
      done = true
      if vim.api.nvim_win_is_valid(win) then
        vim.api.nvim_win_close(win, true)
      end
      callback(answer)
    end

    local map_opts = { buffer = buf, noremap = true, silent = true }
    vim.keymap.set({ "i", "n" }, "<C-CR>", function()
      vim.cmd("stopinsert")
      local lines = vim.api.nvim_buf_get_lines(buf, answer_start, -1, false)
      finish(vim.trim(table.concat(lines, "\n")))
    end, map_opts)
    vim.keymap.set("n", "<CR>", function()
      local lines = vim.api.nvim_buf_get_lines(buf, answer_start, -1, false)
      finish(vim.trim(table.concat(lines, "\n")))
    end, map_opts)
    vim.keymap.set({ "i", "n" }, "<Esc>", function()
      vim.cmd("stopinsert")
      finish("(user declined to answer; proceed with best guess)")
    end, map_opts)
  end)
end

-- Dispatch by tool name. `args` is already a decoded table.
function M.execute(name, args, callback)
  if name == "find_symbol" then return M.find_symbol(args, callback) end
  if name == "read_file"   then return M.read_file(args, callback) end
  if name == "list_files"  then return M.list_files(args, callback) end
  if name == "web_search" then return M.web_search(args, callback) end
  if name == "ask_user"   then return M.ask_user(args, callback) end
  callback("error: unknown tool '" .. tostring(name) .. "'")
end

-- Short human-readable label for the status window, e.g. `read_file src/a.ts`.
function M.describe(name, args)
  args = type(args) == "table" and args or {}

  if name == "read_file" then
    local range = ""
    if args.start_line or args.end_line then
      range = string.format(" (%s-%s)", tostring(args.start_line or 1), tostring(args.end_line or "end"))
    end
    return "reading " .. tostring(args.path or "?") .. range
  end
  if name == "list_files" then
    return "listing files matching '" .. tostring(args.pattern or "?") .. "'"
  end
  if name == "find_symbol" then
    return "looking up symbol '" .. tostring(args.name or "?") .. "'"
  end
  if name == "web_search" then
    return "searching the web for '" .. tostring(args.query or "?") .. "'"
  end
  if name == "ask_user" then
    return "waiting for your answer"
  end

  local detail = vim.inspect(args):gsub("%s+", " ")
  return name .. " " .. detail
end

return M
