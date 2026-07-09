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
    local answer_start = #q_lines -- 0-indexed end of question == start of answer

    local win = vim.api.nvim_open_win(buf, true, {
      relative = "editor",
      width = width, height = height, row = row, col = col,
      style = "minimal", border = "rounded",
      title = " AI asks ", title_pos = "center",
      footer = " <CR> submit · <Esc> skip ", footer_pos = "center",
    })
    vim.api.nvim_win_set_option(win, "wrap", true)
    vim.api.nvim_win_set_cursor(win, { answer_start + 1, 0 })
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
  if name == "web_search" then return M.web_search(args, callback) end
  if name == "ask_user"   then return M.ask_user(args, callback) end
  callback("error: unknown tool '" .. tostring(name) .. "'")
end

return M
